package by.tradify.spec;

import by.tradify.dto.request.AdSearchFilter;
import by.tradify.entity.Ad;
import by.tradify.entity.AdStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public final class AdSpecifications {

    private AdSpecifications() {
    }

    public static Specification<Ad> search(AdSearchFilter filter, Collection<Long> categoryIds) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), AdStatus.ACTIVE));

            if (filter.q() != null && !filter.q().isBlank()) {
                String pattern = "%" + filter.q().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("title")), pattern),
                        cb.like(cb.lower(root.<String>get("description")), pattern)
                ));
            }

            if (filter.cityId() != null) {
                predicates.add(cb.equal(root.get("city").get("id"), filter.cityId()));
            }

            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.<BigDecimal>get("price"), filter.minPrice()));
            }

            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.<BigDecimal>get("price"), filter.maxPrice()));
            }

            if (filter.condition() != null) {
                predicates.add(cb.equal(root.get("condition"), filter.condition()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
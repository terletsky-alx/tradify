package by.tradify.repository;

import by.tradify.entity.Ad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface AdRepository extends JpaRepository<Ad, Long>, JpaSpecificationExecutor<Ad> {

    @EntityGraph(attributePaths = {"seller", "city", "category", "images"})
    Optional<Ad> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"city", "category", "images"})
    List<Ad> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    @Override
    @EntityGraph(attributePaths = {"city", "category"})
    Page<Ad> findAll(Specification<Ad> spec, Pageable pageable);
}
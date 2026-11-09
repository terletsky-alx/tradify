package by.tradify.dto.request;

import by.tradify.entity.AdCondition;

import java.math.BigDecimal;

public record AdSearchFilter(
        String q,
        Long cityId,
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        AdCondition condition
) {
}
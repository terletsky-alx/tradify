package by.tradify.dto.response;

import by.tradify.entity.AdCondition;
import by.tradify.entity.AdStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        AdCondition condition,
        AdStatus status,
        Long cityId,
        String cityName,
        Long categoryId,
        String categoryName,
        SellerShortDto seller,
        int viewsCount,
        Instant createdAt,
        Instant updatedAt,
        List<ImageDto> images
) {
}
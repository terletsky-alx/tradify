package by.tradify.dto.response;

import by.tradify.entity.AdStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record AdCardDto(
        Long id,
        String title,
        BigDecimal price,
        AdStatus status,
        String cityName,
        String categoryName,
        Instant createdAt,
        String coverUrl
) {
}
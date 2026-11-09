package by.tradify.dto.response;

import java.time.Instant;

public record SellerProfileResponse(
        Long id,
        String displayName,
        String phone,
        Long cityId,
        String cityName,
        String about,
        String avatarUrl,
        Instant memberSince,
        long activeAdsCount
) {
}
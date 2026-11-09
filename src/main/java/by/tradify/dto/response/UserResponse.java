package by.tradify.dto.response;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        String email,
        String displayName,
        String phone,
        Long cityId,
        String cityName,
        String about,
        Instant createdAt
) {
}
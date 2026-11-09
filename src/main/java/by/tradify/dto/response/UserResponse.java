package by.tradify.dto.response;

import by.tradify.entity.User;

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
        String avatarUrl,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhone(),
                user.getCity() != null ? user.getCity().getId() : null,
                user.getCity() != null ? user.getCity().getName() : null,
                user.getAbout(),
                user.getAvatarUrl(),
                user.getCreatedAt()
        );
    }
}
package by.tradify.dto.request;

import by.tradify.entity.AdStatus;
import jakarta.validation.constraints.NotNull;

public record AdStatusRequest(@NotNull AdStatus status) {
}
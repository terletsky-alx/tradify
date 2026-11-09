package by.tradify.dto.request;

import by.tradify.entity.AdCondition;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record AdRequest(

        @NotBlank
        @Size(max = 120)
        String title,

        @Size(max = 5000)
        String description,

        @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 10, fraction = 2)
        BigDecimal price,

        @NotNull
        AdCondition condition,

        @NotNull
        Long cityId,

        @NotNull
        Long categoryId
) {
}
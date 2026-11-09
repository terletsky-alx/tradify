package by.tradify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(

        @NotBlank
        @Size(max = 100)
        String displayName,

        @Size(max = 20)
        String phone,

        Long cityId,

        @Size(max = 2000)
        String about
) {
}
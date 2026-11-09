package by.tradify.controller;

import by.tradify.dto.request.ProfileUpdateRequest;
import by.tradify.dto.response.AdCardDto;
import by.tradify.dto.response.PageResponse;
import by.tradify.dto.response.SellerProfileResponse;
import by.tradify.dto.response.UserResponse;
import by.tradify.service.AdService;
import by.tradify.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AdService adService;

    @GetMapping("/{id}")
    public SellerProfileResponse getProfile(@PathVariable Long id) {
        return userService.getProfile(id);
    }

    @GetMapping("/{id}/ads")
    public PageResponse<AdCardDto> getSellerAds(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return adService.getSellerAds(id, pageable);
    }

    @PutMapping("/me")
    public UserResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                      @AuthenticationPrincipal UserDetails principal) {
        return userService.updateProfile(principal.getUsername(), request);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse updateAvatar(@RequestParam("file") MultipartFile file,
                                     @AuthenticationPrincipal UserDetails principal) {
        return userService.updateAvatar(principal.getUsername(), file);
    }
}
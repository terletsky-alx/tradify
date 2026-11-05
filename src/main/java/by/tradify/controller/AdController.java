package by.tradify.controller;

import by.tradify.dto.request.AdRequest;
import by.tradify.dto.request.AdStatusRequest;
import by.tradify.dto.response.AdCardDto;
import by.tradify.dto.response.AdResponse;
import by.tradify.service.AdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdResponse create(@Valid @RequestBody AdRequest request,
                             @AuthenticationPrincipal UserDetails principal) {
        return adService.create(request, principal.getUsername());
    }

    @GetMapping("/my")
    public List<AdCardDto> getMyAds(@AuthenticationPrincipal UserDetails principal) {
        return adService.getMyAds(principal.getUsername());
    }

    @GetMapping("/{id}")
    public AdResponse getById(@PathVariable Long id) {
        return adService.getById(id);
    }

    @PutMapping("/{id}")
    public AdResponse update(@PathVariable Long id,
                             @Valid @RequestBody AdRequest request,
                             @AuthenticationPrincipal UserDetails principal) {
        return adService.update(id, request, principal.getUsername());
    }

    @PatchMapping("/{id}/status")
    public AdResponse updateStatus(@PathVariable Long id,
                                   @Valid @RequestBody AdStatusRequest request,
                                   @AuthenticationPrincipal UserDetails principal) {
        return adService.updateStatus(id, request, principal.getUsername());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails principal) {
        adService.delete(id, principal.getUsername());
    }
}
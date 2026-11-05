package by.tradify.service;

import by.tradify.dto.request.AdRequest;
import by.tradify.dto.request.AdStatusRequest;
import by.tradify.dto.response.AdCardDto;
import by.tradify.dto.response.AdResponse;
import by.tradify.dto.response.SellerShortDto;
import by.tradify.entity.*;
import by.tradify.repository.AdRepository;
import by.tradify.repository.CategoryRepository;
import by.tradify.repository.CityRepository;
import by.tradify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdService {

    private final AdRepository adRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public AdResponse create(AdRequest request, String username) {
        User seller = findUser(username);

        Ad ad = new Ad();
        ad.setSeller(seller);
        applyRequest(ad, request);

        return toResponse(adRepository.save(ad));
    }

    @Transactional
    public AdResponse getById(Long id) {
        Ad ad = findAdWithDetails(id);
        if (ad.getStatus() == AdStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ad not found");
        }
        ad.setViewsCount(ad.getViewsCount() + 1);
        return toResponse(ad);
    }

    @Transactional
    public AdResponse update(Long id, AdRequest request, String username) {
        Ad ad = findAdWithDetails(id);
        checkOwner(ad, username);
        applyRequest(ad, request);
        return toResponse(ad);
    }

    @Transactional
    public AdResponse updateStatus(Long id, AdStatusRequest request, String username) {
        Ad ad = findAdWithDetails(id);
        checkOwner(ad, username);
        ad.setStatus(request.status());
        return toResponse(ad);
    }

    @Transactional
    public void delete(Long id, String username) {
        Ad ad = findAdWithDetails(id);
        checkOwner(ad, username);
        ad.setStatus(AdStatus.ARCHIVED);
    }

    @Transactional(readOnly = true)
    public List<AdCardDto> getMyAds(String username) {
        User user = findUser(username);
        return adRepository.findBySellerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toCard)
                .toList();
    }
    

    private void applyRequest(Ad ad, AdRequest request) {
        City city = cityRepository.findById(request.cityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "City not found"));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));

        ad.setTitle(request.title().trim());
        ad.setDescription(request.description());
        ad.setPrice(request.price());
        ad.setCondition(request.condition());
        ad.setCity(city);
        ad.setCategory(category);
    }

    private Ad findAdWithDetails(Long id) {
        return adRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ad not found"));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void checkOwner(Ad ad, String username) {
        if (!ad.getSeller().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify your own ads");
        }
    }

    private AdResponse toResponse(Ad ad) {
        return new AdResponse(
                ad.getId(),
                ad.getTitle(),
                ad.getDescription(),
                ad.getPrice(),
                ad.getCondition(),
                ad.getStatus(),
                ad.getCity().getId(),
                ad.getCity().getName(),
                ad.getCategory().getId(),
                ad.getCategory().getName(),
                new SellerShortDto(ad.getSeller().getId(), ad.getSeller().getDisplayName()),
                ad.getViewsCount(),
                ad.getCreatedAt(),
                ad.getUpdatedAt()
        );
    }

    private AdCardDto toCard(Ad ad) {
        return new AdCardDto(
                ad.getId(),
                ad.getTitle(),
                ad.getPrice(),
                ad.getStatus(),
                ad.getCity().getName(),
                ad.getCategory().getName(),
                ad.getCreatedAt()
        );
    }
}
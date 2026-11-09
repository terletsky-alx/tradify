package by.tradify.service;

import by.tradify.dto.request.AdRequest;
import by.tradify.dto.request.AdSearchFilter;
import by.tradify.dto.request.AdStatusRequest;
import by.tradify.dto.response.*;
import by.tradify.entity.*;
import by.tradify.repository.AdImageRepository;
import by.tradify.repository.AdRepository;
import by.tradify.repository.CategoryRepository;
import by.tradify.repository.CityRepository;
import by.tradify.repository.UserRepository;
import by.tradify.spec.AdSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdService {

    private static final int MAX_IMAGES = 10;
    private static final Set<String> SORTABLE_FIELDS = Set.of("createdAt", "price");

    private final AdRepository adRepository;
    private final AdImageRepository adImageRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;
    private final StorageService storageService;

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

    @Transactional(readOnly = true)
    public PageResponse<AdCardDto> search(AdSearchFilter filter, Pageable pageable) {
        validateSort(pageable);

        if (filter.minPrice() != null && filter.maxPrice() != null
                && filter.minPrice().compareTo(filter.maxPrice()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minPrice must not be greater than maxPrice");
        }

        List<Long> categoryIds = resolveCategoryIds(filter.categoryId());

        Page<AdCardDto> page = adRepository
                .findAll(AdSpecifications.search(filter, categoryIds), pageable)
                .map(this::toCard);

        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdCardDto> getSellerAds(Long sellerId, Pageable pageable) {
        if (!userRepository.existsById(sellerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        validateSort(pageable);

        Page<AdCardDto> page = adRepository
                .findBySellerIdAndStatus(sellerId, AdStatus.ACTIVE, pageable)
                .map(this::toCard);

        return PageResponse.from(page);
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

    // images

    @Transactional
    public AdResponse addImages(Long id, List<MultipartFile> files, String username) {
        Ad ad = findAdWithDetails(id);
        checkOwner(ad, username);

        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No files provided");
        }
        if (ad.getImages().size() + files.size() > MAX_IMAGES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "An ad can have at most " + MAX_IMAGES + " images");
        }

        for (MultipartFile file : files) {
            String fileName = storageService.save(file);

            AdImage image = new AdImage();
            image.setAd(ad);
            image.setFileName(fileName);
            image.setPosition(ad.getImages().size());

            ad.getImages().add(adImageRepository.save(image));
        }
        return toResponse(ad);
    }

    @Transactional
    public AdResponse deleteImage(Long adId, Long imageId, String username) {
        Ad ad = findAdWithDetails(adId);
        checkOwner(ad, username);

        AdImage image = ad.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));

        ad.getImages().remove(image);
        storageService.delete(image.getFileName());

        for (int i = 0; i < ad.getImages().size(); i++) {
            ad.getImages().get(i).setPosition(i);
        }
        return toResponse(ad);
    }

    // helpers

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

    private String imageUrl(AdImage image) {
        return "/images/" + image.getFileName();
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
                ad.getUpdatedAt(),
                ad.getImages().stream()
                        .map(img -> new ImageDto(img.getId(), imageUrl(img)))
                        .toList()
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
                ad.getCreatedAt(),
                ad.getImages().isEmpty() ? null : imageUrl(ad.getImages().get(0))
        );
    }

    private void validateSort(Pageable pageable) {
        for (Sort.Order order : pageable.getSort()) {
            if (!SORTABLE_FIELDS.contains(order.getProperty())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Sorting by '" + order.getProperty() + "' is not allowed");
            }
        }
    }

    private List<Long> resolveCategoryIds(Long categoryId) {
        if (categoryId == null) {
            return List.of();
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));

        List<Long> ids = new ArrayList<>();
        ids.add(category.getId());
        categoryRepository.findByParentId(categoryId)
                .forEach(child -> ids.add(child.getId()));
        return ids;
    }
}
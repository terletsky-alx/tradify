package by.tradify.service;

import by.tradify.dto.request.ProfileUpdateRequest;
import by.tradify.dto.response.SellerProfileResponse;
import by.tradify.dto.response.UserResponse;
import by.tradify.entity.AdStatus;
import by.tradify.entity.City;
import by.tradify.entity.User;
import by.tradify.repository.AdRepository;
import by.tradify.repository.CityRepository;
import by.tradify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String IMAGES_PREFIX = "/images/";

    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final AdRepository adRepository;
    private final StorageService storageService;

    @Transactional(readOnly = true)
    public SellerProfileResponse getProfile(Long id) {
        User user = userRepository.findById(id)
                .filter(User::isEnabled)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        long activeAds = adRepository.countBySellerIdAndStatus(id, AdStatus.ACTIVE);

        return new SellerProfileResponse(
                user.getId(),
                user.getDisplayName(),
                user.getPhone(),
                user.getCity() != null ? user.getCity().getId() : null,
                user.getCity() != null ? user.getCity().getName() : null,
                user.getAbout(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                activeAds
        );
    }

    @Transactional
    public UserResponse updateProfile(String username, ProfileUpdateRequest request) {
        User user = findByUsername(username);

        City city = null;
        if (request.cityId() != null) {
            city = cityRepository.findById(request.cityId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "City not found"));
        }

        user.setDisplayName(request.displayName().trim());
        user.setPhone(request.phone());
        user.setCity(city);
        user.setAbout(request.about());

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateAvatar(String username, MultipartFile file) {
        User user = findByUsername(username);

        String newFileName = storageService.save(file);
        String oldUrl = user.getAvatarUrl();

        user.setAvatarUrl(IMAGES_PREFIX + newFileName);

        if (oldUrl != null && oldUrl.startsWith(IMAGES_PREFIX)) {
            storageService.delete(oldUrl.substring(IMAGES_PREFIX.length()));
        }
        return UserResponse.from(user);
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
package by.tradify.service;

import by.tradify.dto.request.AdRequest;
import by.tradify.dto.request.AdSearchFilter;
import by.tradify.dto.response.AdResponse;
import by.tradify.entity.*;
import by.tradify.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdServiceTest {

    @Mock AdRepository adRepository;
    @Mock AdImageRepository adImageRepository;
    @Mock UserRepository userRepository;
    @Mock CityRepository cityRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock StorageService storageService;

    @InjectMocks AdService adService;

    private User alex;
    private City minsk;
    private Category phones;

    @BeforeEach
    void setUp() {
        alex = new User();
        alex.setId(1L);
        alex.setUsername("alex");
        alex.setDisplayName("Александр");

        minsk = new City();
        minsk.setId(1L);
        minsk.setName("Минск");

        phones = new Category();
        phones.setId(8L);
        phones.setName("Телефоны");
    }

    private Ad adOf(User seller, AdStatus status) {
        Ad ad = new Ad();
        ad.setId(10L);
        ad.setTitle("iPhone 13");
        ad.setPrice(new BigDecimal("1450.00"));
        ad.setStatus(status);
        ad.setSeller(seller);
        ad.setCity(minsk);
        ad.setCategory(phones);
        return ad;
    }

    private AdRequest request() {
        return new AdRequest("iPhone 13", "Отличное состояние",
                new BigDecimal("1450.00"), AdCondition.USED, 1L, 8L);
    }

    @Test
    void create_setsCurrentUserAsSeller() {
        when(userRepository.findByUsername("alex")).thenReturn(Optional.of(alex));
        when(cityRepository.findById(1L)).thenReturn(Optional.of(minsk));
        when(categoryRepository.findById(8L)).thenReturn(Optional.of(phones));
        when(adRepository.save(any(Ad.class))).thenAnswer(inv -> inv.getArgument(0));

        AdResponse response = adService.create(request(), "alex");

        assertThat(response.seller().id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("iPhone 13");
        assertThat(response.cityName()).isEqualTo("Минск");
    }

    @Test
    void update_byNotOwner_throwsForbidden() {
        when(adRepository.findWithDetailsById(10L)).thenReturn(Optional.of(adOf(alex, AdStatus.ACTIVE)));

        assertThatThrownBy(() -> adService.update(10L, request(), "bob"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);

        verify(cityRepository, never()).findById(any());
    }

    @Test
    void getById_archivedAd_throwsNotFound() {
        when(adRepository.findWithDetailsById(10L)).thenReturn(Optional.of(adOf(alex, AdStatus.ARCHIVED)));

        assertThatThrownBy(() -> adService.getById(10L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getById_incrementsViews() {
        when(adRepository.findWithDetailsById(10L)).thenReturn(Optional.of(adOf(alex, AdStatus.ACTIVE)));

        AdResponse response = adService.getById(10L);

        assertThat(response.viewsCount()).isEqualTo(1);
    }

    @Test
    void delete_byOwner_archivesAd() {
        Ad ad = adOf(alex, AdStatus.ACTIVE);
        when(adRepository.findWithDetailsById(10L)).thenReturn(Optional.of(ad));

        adService.delete(10L, "alex");

        assertThat(ad.getStatus()).isEqualTo(AdStatus.ARCHIVED);
    }

    @Test
    void search_withForbiddenSort_throwsBadRequest() {
        AdSearchFilter filter = new AdSearchFilter(null, null, null, null, null, null);

        assertThatThrownBy(() -> adService.search(filter, PageRequest.of(0, 20, Sort.by("title"))))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verifyNoInteractions(adRepository);
    }

    @Test
    void search_withMinPriceGreaterThanMax_throwsBadRequest() {
        AdSearchFilter filter = new AdSearchFilter(null, null, null,
                new BigDecimal("500"), new BigDecimal("100"), null);

        assertThatThrownBy(() -> adService.search(filter, PageRequest.of(0, 20)))
                .isInstanceOf(ResponseStatusException.class);
    }
}
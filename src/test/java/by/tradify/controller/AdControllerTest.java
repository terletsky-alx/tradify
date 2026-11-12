package by.tradify.controller;

import by.tradify.config.SecurityConfig;
import by.tradify.dto.request.AdRequest;
import by.tradify.dto.response.AdResponse;
import by.tradify.dto.response.SellerShortDto;
import by.tradify.entity.AdCondition;
import by.tradify.entity.AdStatus;
import by.tradify.service.AdService;
import by.tradify.service.StorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdController.class)
@Import(SecurityConfig.class)
class AdControllerTest {

    private static final String VALID_AD = """
            {
              "title": "iPhone 13",
              "description": "Отличное состояние",
              "price": 1450.00,
              "condition": "USED",
              "cityId": 1,
              "categoryId": 8
            }
            """;

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    AdService adService;

    @MockitoBean
    StorageService storageService; // его требует WebConfig

    private AdResponse sampleAd() {
        return new AdResponse(10L, "iPhone 13", "Отличное состояние", new BigDecimal("1450.00"),
                AdCondition.USED, AdStatus.ACTIVE, 1L, "Минск", 8L, "Телефоны",
                new SellerShortDto(1L, "Александр"), 0, Instant.now(), Instant.now(), List.of());
    }

    @Test
    void getAd_isPublic() throws Exception {
        when(adService.getById(10L)).thenReturn(sampleAd());

        mockMvc.perform(get("/api/ads/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("iPhone 13"))
                .andExpect(jsonPath("$.seller.displayName").value("Александр"));
    }

    @Test
    void createAd_withoutLogin_returns401() throws Exception {
        mockMvc.perform(post("/api/ads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_AD))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(adService);
    }

    @Test
    @WithMockUser(username = "alex")
    void createAd_withLogin_returns201() throws Exception {
        when(adService.create(any(AdRequest.class), eq("alex"))).thenReturn(sampleAd());

        mockMvc.perform(post("/api/ads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_AD))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    @WithMockUser(username = "alex")
    void createAd_withEmptyTitle_returns400() throws Exception {
        String invalid = VALID_AD.replace("\"iPhone 13\"", "\"\"");

        mockMvc.perform(post("/api/ads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(adService);
    }

    @Test
    void myAds_withoutLogin_returns401() throws Exception {
        mockMvc.perform(get("/api/ads/my"))
                .andExpect(status().isUnauthorized());
    }
}
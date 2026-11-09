package by.tradify.controller;


import by.tradify.dto.response.CategoryDto;
import by.tradify.dto.response.CityDto;
import by.tradify.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DictionaryController {

    public final DictionaryService dictionaryService;

    @GetMapping("/cities")
    public List<CityDto> getCities() {
        return dictionaryService.getCities();
    }

    @GetMapping("/categories")
    public List<CategoryDto> getCategories() {
        return dictionaryService.getCategories();
    }
}

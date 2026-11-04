package by.tradify.service;

import by.tradify.dto.response.CategoryDto;
import by.tradify.dto.response.CityDto;
import by.tradify.repository.CategoryRepository;
import by.tradify.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DictionaryService {

    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;

    public List<CityDto> getCities(){
        return cityRepository.findAll(Sort.by("region", "name")).stream()
                .map(city -> new CityDto(city.getId(), city.getName(), city.getRegion()))
                .toList();
    }
    public List<CategoryDto> getCategories(){
        return categoryRepository.findAll(Sort.by("name")).stream()
                .map(category -> new CategoryDto(
                        category.getId(),
                        category.getName(),
                        category.getSlug(),
                        category.getParent() != null ? category.getParent().getId() : null))
                .toList();
    }
}


package by.tradify.repository;

import by.tradify.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository <Category, Long> {
    List<Category> findByParentId(Long parentId);
}

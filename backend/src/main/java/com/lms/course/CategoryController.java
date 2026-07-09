package com.lms.course;

import com.lms.common.exception.ResourceNotFoundException;
import com.lms.course.dto.CategoryRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    // Danh sách category cho dropdown ở editor & bộ lọc catalog. Đọc công khai.
    @GetMapping
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll(Sort.by("name")));
    }

    // --- Admin-only management ---

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(resolveSlug(request))
                .build();
        // A duplicate slug hits the unique constraint -> handled as 409 by GlobalExceptionHandler.
        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.getName().trim());
        category.setSlug(resolveSlug(request));
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        // If courses still reference this category the FK constraint fires and
        // GlobalExceptionHandler reports a 409 rather than a 500.
        categoryRepository.delete(category);
        return ResponseEntity.noContent().build();
    }

    /** Use the provided slug, or derive one from the name when it's blank. */
    private String resolveSlug(CategoryRequest request) {
        String slug = request.getSlug();
        String source = (slug != null && !slug.isBlank()) ? slug : request.getName();
        return source.trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
    }
}

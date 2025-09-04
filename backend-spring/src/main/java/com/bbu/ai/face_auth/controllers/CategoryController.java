package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.CategoryRequest;
import com.bbu.ai.face_auth.mapper.CategoryResponse;
import com.bbu.ai.face_auth.models.Category;
import com.bbu.ai.face_auth.repository.CategoryRepository;
import com.bbu.ai.face_auth.services.CategoryService;
import jakarta.validation.Valid;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome this endpoint is not secure";
    }



    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService, CategoryRepository categoryRepository) {
        this.categoryService = categoryService;
        this.categoryRepository = categoryRepository;
    }

    @PostMapping()
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest categoryRequest) throws BadRequestException {
        Category categoryCreate = categoryService.create(categoryRequest);
        CategoryResponse categoryResponse = new CategoryResponse(categoryCreate);
        return ResponseEntity.ok(categoryResponse);
    }

    @GetMapping()
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }
    @GetMapping("/{id}")
    public List<Category> getById(@PathVariable(value = "id") Integer id) {
        return Collections.singletonList(categoryRepository.findById(id));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable(value = "id") Long categoryId,
                                                   @Valid @RequestBody Category categoryDetails) throws BadRequestException {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BadRequestException("Category not found for this id :: " + categoryId));

        category.setName(categoryDetails.getName());
        category.setParentId(categoryDetails.getParentId());
        final Category updatedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(updatedCategory);
    }


}

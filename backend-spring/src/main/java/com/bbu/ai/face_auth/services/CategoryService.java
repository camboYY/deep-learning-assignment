package com.bbu.ai.face_auth.services;


import com.bbu.ai.face_auth.dto.CategoryRequest;
import com.bbu.ai.face_auth.models.Category;
import com.bbu.ai.face_auth.repository.CategoryRepository;
import org.apache.coyote.BadRequestException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    private static final Logger logger = LogManager.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;


    public CategoryService(
            CategoryRepository categoryRepository
    ) {
        this.categoryRepository = categoryRepository;
    }

    public Category create(CategoryRequest categoryRequest) throws BadRequestException {
        logger.info("CategoryRequest{}", categoryRequest);
        // Create new user's account
        Category category = new Category(categoryRequest.getName(), categoryRequest.getParentId());
        categoryRepository.save(category);
        return categoryRepository.save(category);
    }

}

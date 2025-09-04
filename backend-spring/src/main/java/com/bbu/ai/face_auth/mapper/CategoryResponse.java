package com.bbu.ai.face_auth.mapper;
import com.bbu.ai.face_auth.models.Category;
import lombok.Data;

@Data
public class CategoryResponse {
    private String name;
    private Integer parentId;
    private long id;

    public CategoryResponse(Category category){
        this.setName(category.getName());
        this.setParentId(category.getParentId());
        this.setId(category.getId());
    }
}

package com.inventory.dto;

import com.inventory.entity.OrderCustomField;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCustomFieldDTO {

    private UUID id;
    private String fieldName;
    private OrderCustomField.FieldType fieldType;
    private Boolean required;
    private Integer displayOrder;
    private Boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderCustomFieldDTO fromEntity(OrderCustomField field) {
        return OrderCustomFieldDTO.builder()
                .id(field.getId())
                .fieldName(field.getFieldName())
                .fieldType(field.getFieldType())
                .required(field.getRequired())
                .displayOrder(field.getDisplayOrder())
                .deleted(field.getDeleted())
                .createdAt(field.getCreatedAt())
                .updatedAt(field.getUpdatedAt())
                .build();
    }
}

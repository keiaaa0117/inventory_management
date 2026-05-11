package com.inventory.dto;

import com.inventory.entity.OrderCustomField;
import com.inventory.entity.OrderCustomFieldValue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCustomFieldValueDTO {

    private UUID fieldId;
    private String fieldName;
    private OrderCustomField.FieldType fieldType;
    private String value;

    public static OrderCustomFieldValueDTO fromEntity(OrderCustomFieldValue fieldValue) {
        return OrderCustomFieldValueDTO.builder()
                .fieldId(fieldValue.getField().getId())
                .fieldName(fieldValue.getField().getFieldName())
                .fieldType(fieldValue.getField().getFieldType())
                .value(fieldValue.getValue())
                .build();
    }
}

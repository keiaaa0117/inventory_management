package com.inventory.service;

import com.inventory.dto.OrderCustomFieldDTO;
import com.inventory.entity.OrderCustomField;
import com.inventory.repository.OrderCustomFieldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderCustomFieldService {

    private final OrderCustomFieldRepository orderCustomFieldRepository;

    public List<OrderCustomFieldDTO> getAllFields() {
        return orderCustomFieldRepository.findAllNotDeleted().stream()
                .map(OrderCustomFieldDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public OrderCustomFieldDTO getFieldById(UUID id) {
        return orderCustomFieldRepository.findByIdAndNotDeleted(id)
                .map(OrderCustomFieldDTO::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Order custom field not found: " + id));
    }

    public OrderCustomFieldDTO createField(OrderCustomFieldDTO fieldDTO) {
        validateField(fieldDTO);
        String fieldName = fieldDTO.getFieldName().trim();
        if (orderCustomFieldRepository.findByFieldNameAndNotDeleted(fieldName).isPresent()) {
            throw new IllegalArgumentException("Order custom field already exists: " + fieldName);
        }

        OrderCustomField field = OrderCustomField.builder()
                .fieldName(fieldName)
                .fieldType(fieldDTO.getFieldType())
                .required(Boolean.TRUE.equals(fieldDTO.getRequired()))
                .displayOrder(fieldDTO.getDisplayOrder() == null ? 0 : fieldDTO.getDisplayOrder())
                .deleted(false)
                .build();

        return OrderCustomFieldDTO.fromEntity(orderCustomFieldRepository.save(field));
    }

    public OrderCustomFieldDTO updateField(UUID id, OrderCustomFieldDTO fieldDTO) {
        validateField(fieldDTO);
        String fieldName = fieldDTO.getFieldName().trim();

        OrderCustomField field = orderCustomFieldRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new IllegalArgumentException("Order custom field not found: " + id));

        orderCustomFieldRepository.findByFieldNameAndNotDeleted(fieldName)
                .filter(existingField -> !existingField.getId().equals(id))
                .ifPresent(existingField -> {
                    throw new IllegalArgumentException("Order custom field already exists: " + fieldName);
                });

        field.setFieldName(fieldName);
        field.setFieldType(fieldDTO.getFieldType());
        field.setRequired(Boolean.TRUE.equals(fieldDTO.getRequired()));
        field.setDisplayOrder(fieldDTO.getDisplayOrder() == null ? 0 : fieldDTO.getDisplayOrder());

        return OrderCustomFieldDTO.fromEntity(orderCustomFieldRepository.save(field));
    }

    public void deleteField(UUID id) {
        OrderCustomField field = orderCustomFieldRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new IllegalArgumentException("Order custom field not found: " + id));
        field.setDeleted(true);
        orderCustomFieldRepository.save(field);
    }

    private void validateField(OrderCustomFieldDTO fieldDTO) {
        if (fieldDTO.getFieldName() == null || fieldDTO.getFieldName().trim().isEmpty()) {
            throw new IllegalArgumentException("Field name is required");
        }
        if (fieldDTO.getFieldType() == null) {
            throw new IllegalArgumentException("Field type is required");
        }
    }
}

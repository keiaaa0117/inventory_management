package com.inventory.controller;

import com.inventory.dto.OrderCustomFieldDTO;
import com.inventory.service.OrderCustomFieldService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/order-fields")
@RequiredArgsConstructor
@Slf4j
public class OrderCustomFieldController {

    private final OrderCustomFieldService orderCustomFieldService;

    @GetMapping
    public ResponseEntity<List<OrderCustomFieldDTO>> getAllFields() {
        log.info("GET /api/order-fields");
        return ResponseEntity.ok(orderCustomFieldService.getAllFields());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFieldById(@PathVariable UUID id) {
        log.info("GET /api/order-fields/{}", id);
        try {
            return ResponseEntity.ok(orderCustomFieldService.getFieldById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createField(@RequestBody OrderCustomFieldDTO fieldDTO) {
        log.info("POST /api/order-fields - {}", fieldDTO.getFieldName());
        try {
            OrderCustomFieldDTO createdField = orderCustomFieldService.createField(fieldDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdField);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateField(@PathVariable UUID id, @RequestBody OrderCustomFieldDTO fieldDTO) {
        log.info("PUT /api/order-fields/{}", id);
        try {
            return ResponseEntity.ok(orderCustomFieldService.updateField(id, fieldDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteField(@PathVariable UUID id) {
        log.info("DELETE /api/order-fields/{}", id);
        try {
            orderCustomFieldService.deleteField(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    record ErrorResponse(String message) {
    }
}

package com.inventory.controller;

import com.inventory.dto.CustomerDTO;
import com.inventory.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Slf4j
public class CustomerController {

    private final CustomerService customerService;

    /**
     * GET /api/customers - 全顧客一覧を取得
     */
    @GetMapping
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        log.info("GET /api/customers");
        List<CustomerDTO> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    /**
     * GET /api/customers/{id} - 顧客詳細を取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable UUID id) {
        log.info("GET /api/customers/{}", id);
        try {
            CustomerDTO customer = customerService.getCustomerById(id);
            return ResponseEntity.ok(customer);
        } catch (IllegalArgumentException e) {
            log.error("Customer not found: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/customers - 顧客を作成
     */
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody CustomerDTO customerDTO) {
        log.info("POST /api/customers - {}", customerDTO.getName());
        try {
            CustomerDTO createdCustomer = customerService.createCustomer(customerDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
        } catch (IllegalArgumentException e) {
            log.error("Failed to create customer: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/customers/{id} - 顧客を更新
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable UUID id, @RequestBody CustomerDTO customerDTO) {
        log.info("PUT /api/customers/{}", id);
        try {
            CustomerDTO updatedCustomer = customerService.updateCustomer(id, customerDTO);
            return ResponseEntity.ok(updatedCustomer);
        } catch (IllegalArgumentException e) {
            log.error("Failed to update customer: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/customers/{id} - 顧客を削除（論理削除）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable UUID id) {
        log.info("DELETE /api/customers/{}", id);
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete customer: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * エラーレスポンス
     */
    record ErrorResponse(String message) {}

}

package com.inventory.service;

import com.inventory.dto.CustomerDTO;
import com.inventory.entity.Customer;
import com.inventory.repository.CustomerRepository;
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
public class CustomerService {

    private final CustomerRepository customerRepository;

    /**
     * 全顧客一覧を取得（削除済みを除外）
     */
    public List<CustomerDTO> getAllCustomers() {
        log.info("Fetching all customers");
        return customerRepository.findAllNotDeleted().stream()
                .map(CustomerDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 顧客 ID で顧客を取得
     */
    public CustomerDTO getCustomerById(UUID id) {
        log.info("Fetching customer by id: {}", id);
        return customerRepository.findByIdAndNotDeleted(id)
                .map(CustomerDTO::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));
    }

    /**
     * 顧客を作成
     */
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        log.info("Creating customer: {}", customerDTO.getName());
        validateCustomer(customerDTO);
        String customerName = customerDTO.getName().trim();

        // 名前の重複チェック
        if (customerRepository.findByNameAndNotDeleted(customerName).isPresent()) {
            throw new IllegalArgumentException("Customer name already exists: " + customerName);
        }

        Customer customer = Customer.builder()
                .name(customerName)
                .contactInfo(customerDTO.getContactInfo())
                .memo(customerDTO.getMemo())
                .deleted(false)
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Customer created successfully: {}", savedCustomer.getId());
        return CustomerDTO.fromEntity(savedCustomer);
    }

    /**
     * 顧客を更新
     */
    public CustomerDTO updateCustomer(UUID id, CustomerDTO customerDTO) {
        log.info("Updating customer: {}", id);
        validateCustomer(customerDTO);
        String customerName = customerDTO.getName().trim();

        Customer customer = customerRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

        // 名前が変更される場合、重複チェック
        if (!customer.getName().equals(customerName)) {
            if (customerRepository.findByNameAndNotDeleted(customerName).isPresent()) {
                throw new IllegalArgumentException("Customer name already exists: " + customerName);
            }
        }

        customer.setName(customerName);
        customer.setContactInfo(customerDTO.getContactInfo());
        customer.setMemo(customerDTO.getMemo());

        Customer updatedCustomer = customerRepository.save(customer);
        log.info("Customer updated successfully: {}", id);
        return CustomerDTO.fromEntity(updatedCustomer);
    }

    /**
     * 顧客を論理削除
     */
    public void deleteCustomer(UUID id) {
        log.info("Deleting customer: {}", id);

        Customer customer = customerRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

        customer.setDeleted(true);
        customerRepository.save(customer);
        log.info("Customer deleted successfully: {}", id);
    }

    private void validateCustomer(CustomerDTO customerDTO) {
        if (customerDTO.getName() == null || customerDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required");
        }
    }

}

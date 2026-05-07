package com.inventory.repository;

import com.inventory.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    @Query("SELECT c FROM Customer c WHERE c.deleted = false ORDER BY c.createdAt DESC")
    List<Customer> findAllNotDeleted();

    @Query("SELECT c FROM Customer c WHERE c.id = ?1 AND c.deleted = false")
    Optional<Customer> findByIdAndNotDeleted(UUID id);

    @Query("SELECT c FROM Customer c WHERE c.name = ?1 AND c.deleted = false")
    Optional<Customer> findByNameAndNotDeleted(String name);

}

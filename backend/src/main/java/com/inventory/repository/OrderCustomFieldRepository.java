package com.inventory.repository;

import com.inventory.entity.OrderCustomField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderCustomFieldRepository extends JpaRepository<OrderCustomField, UUID> {

    @Query("SELECT f FROM OrderCustomField f WHERE f.deleted = false ORDER BY f.displayOrder ASC, f.createdAt ASC")
    List<OrderCustomField> findAllNotDeleted();

    @Query("SELECT f FROM OrderCustomField f WHERE f.id = ?1 AND f.deleted = false")
    Optional<OrderCustomField> findByIdAndNotDeleted(UUID id);

    @Query("SELECT f FROM OrderCustomField f WHERE LOWER(f.fieldName) = LOWER(?1) AND f.deleted = false")
    Optional<OrderCustomField> findByFieldNameAndNotDeleted(String fieldName);
}

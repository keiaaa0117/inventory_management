package com.inventory.repository;

import com.inventory.entity.OrderCustomFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderCustomFieldValueRepository extends JpaRepository<OrderCustomFieldValue, UUID> {

    List<OrderCustomFieldValue> findByOrderId(UUID orderId);

    void deleteByOrderId(UUID orderId);
}

package com.inventory.dto;

import com.inventory.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {

    private UUID id;
    private String orderName;
    private UUID customerId;
    private String customerName;
    private String memo;
    private Order.Priority priority;
    private Order.Status status;
    private LocalDate constructionDate;
    private LocalDate deliveryDate;
    private Boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderDTO fromEntity(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderName(order.getOrderName())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .memo(order.getMemo())
                .priority(order.getPriority())
                .status(order.getStatus())
                .constructionDate(order.getConstructionDate())
                .deliveryDate(order.getDeliveryDate())
                .deleted(order.getDeleted())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

}

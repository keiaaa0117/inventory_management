package com.inventory.service;

import com.inventory.dto.OrderDTO;
import com.inventory.entity.Customer;
import com.inventory.entity.Order;
import com.inventory.repository.CustomerRepository;
import com.inventory.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    /**
     * 全注文一覧を取得（削除済みを除外）
     */
    public List<OrderDTO> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAllNotDeleted().stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 注文 ID で注文を取得
     */
    public OrderDTO getOrderById(UUID id) {
        log.info("Fetching order by id: {}", id);
        return orderRepository.findByIdAndNotDeleted(id)
                .map(OrderDTO::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    /**
     * ステータスで注文を取得
     */
    public List<OrderDTO> getOrdersByStatus(Order.Status status) {
        log.info("Fetching orders by status: {}", status);
        return orderRepository.findByStatusAndNotDeleted(status).stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 顧客 ID で注文を取得
     */
    public List<OrderDTO> getOrdersByCustomerId(UUID customerId) {
        log.info("Fetching orders by customer id: {}", customerId);
        return orderRepository.findByCustomerIdAndNotDeleted(customerId).stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 日付範囲で注文を取得（カレンダー表示用）
     */
    public List<OrderDTO> getOrdersByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching orders between {} and {}", startDate, endDate);
        return orderRepository.findByDeliveryDateBetweenAndNotDeleted(startDate, endDate).stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 近期納期の注文を取得（アラート用）
     */
    public List<OrderDTO> getUpcomingOrders(int daysBeforeDelivery) {
        log.info("Fetching upcoming orders (within {} days)", daysBeforeDelivery);
        LocalDate targetDate = LocalDate.now().plusDays(daysBeforeDelivery);
        return orderRepository.findUpcomingOrders(
                        targetDate,
                        List.of(Order.Status.PENDING, Order.Status.WORKING))
                .stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 注文を作成
     */
    public OrderDTO createOrder(OrderDTO orderDTO) {
        log.info("Creating order: {}", orderDTO.getOrderName());

        // バリデーション
        validateOrder(orderDTO);

        // 顧客の存在確認
        Customer customer = customerRepository.findByIdAndNotDeleted(orderDTO.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + orderDTO.getCustomerId()));

        Order order = Order.builder()
                .orderName(orderDTO.getOrderName().trim())
                .customer(customer)
                .memo(orderDTO.getMemo())
                .priority(orderDTO.getPriority())
                .status(orderDTO.getStatus())
                .constructionDate(orderDTO.getConstructionDate())
                .deliveryDate(orderDTO.getDeliveryDate())
                .deleted(false)
                .build();

        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully: {}", savedOrder.getId());
        return OrderDTO.fromEntity(savedOrder);
    }

    /**
     * 注文を更新
     */
    public OrderDTO updateOrder(UUID id, OrderDTO orderDTO) {
        log.info("Updating order: {}", id);

        Order order = orderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));

        // バリデーション
        validateOrder(orderDTO);

        // 顧客の存在確認
        Customer customer = customerRepository.findByIdAndNotDeleted(orderDTO.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + orderDTO.getCustomerId()));

        order.setOrderName(orderDTO.getOrderName().trim());
        order.setCustomer(customer);
        order.setMemo(orderDTO.getMemo());
        order.setPriority(orderDTO.getPriority());
        order.setStatus(orderDTO.getStatus());
        order.setConstructionDate(orderDTO.getConstructionDate());
        order.setDeliveryDate(orderDTO.getDeliveryDate());

        Order updatedOrder = orderRepository.save(order);
        log.info("Order updated successfully: {}", id);
        return OrderDTO.fromEntity(updatedOrder);
    }

    /**
     * 注文を論理削除
     */
    public void deleteOrder(UUID id) {
        log.info("Deleting order: {}", id);

        Order order = orderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));

        order.setDeleted(true);
        orderRepository.save(order);
        log.info("Order deleted successfully: {}", id);
    }

    /**
     * 注文日付のバリデーション
     */
    private void validateOrder(OrderDTO orderDTO) {
        if (orderDTO.getOrderName() == null || orderDTO.getOrderName().trim().isEmpty()) {
            throw new IllegalArgumentException("Order name is required");
        }
        if (orderDTO.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer is required");
        }
        if (orderDTO.getPriority() == null) {
            throw new IllegalArgumentException("Priority is required");
        }
        if (orderDTO.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }
        validateOrderDates(orderDTO.getConstructionDate(), orderDTO.getDeliveryDate());
    }

    private void validateOrderDates(LocalDate constructionDate, LocalDate deliveryDate) {
        if (constructionDate == null || deliveryDate == null) {
            throw new IllegalArgumentException("Construction date and delivery date are required");
        }
        if (constructionDate.isAfter(deliveryDate)) {
            throw new IllegalArgumentException("Construction date must be before or equal to delivery date");
        }
    }

}

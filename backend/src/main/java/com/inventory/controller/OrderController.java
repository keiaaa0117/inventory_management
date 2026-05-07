package com.inventory.controller;

import com.inventory.dto.OrderDTO;
import com.inventory.entity.Order;
import com.inventory.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class OrderController {

    private final OrderService orderService;

    /**
     * GET /api/orders - 全注文一覧を取得
     */
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        log.info("GET /api/orders");
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/{id} - 注文詳細を取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable UUID id) {
        log.info("GET /api/orders/{}", id);
        try {
            OrderDTO order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            log.error("Order not found: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/orders/status/{status} - ステータスで注文を取得
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable String status) {
        log.info("GET /api/orders/status/{}", status);
        try {
            Order.Status orderStatus = Order.Status.valueOf(status.toUpperCase());
            List<OrderDTO> orders = orderService.getOrdersByStatus(orderStatus);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/orders/customer/{customerId} - 顧客の注文を取得
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByCustomerId(@PathVariable UUID customerId) {
        log.info("GET /api/orders/customer/{}", customerId);
        List<OrderDTO> orders = orderService.getOrdersByCustomerId(customerId);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/calendar?start=2024-01-01&end=2024-01-31 - カレンダー用に日付範囲で注文を取得
     */
    @GetMapping("/calendar")
    public ResponseEntity<List<OrderDTO>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        log.info("GET /api/orders/calendar?start={}&end={}", start, end);
        List<OrderDTO> orders = orderService.getOrdersByDateRange(start, end);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/alerts/upcoming?days=3 - 近期納期の注文を取得
     */
    @GetMapping("/alerts/upcoming")
    public ResponseEntity<List<OrderDTO>> getUpcomingOrders(
            @RequestParam(defaultValue = "3") int days) {
        log.info("GET /api/orders/alerts/upcoming?days={}", days);
        List<OrderDTO> orders = orderService.getUpcomingOrders(days);
        return ResponseEntity.ok(orders);
    }

    /**
     * POST /api/orders - 注文を作成
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO orderDTO) {
        log.info("POST /api/orders - {}", orderDTO.getOrderName());
        try {
            OrderDTO createdOrder = orderService.createOrder(orderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (IllegalArgumentException e) {
            log.error("Failed to create order: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/orders/{id} - 注文を更新
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable UUID id, @RequestBody OrderDTO orderDTO) {
        log.info("PUT /api/orders/{}", id);
        try {
            OrderDTO updatedOrder = orderService.updateOrder(id, orderDTO);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalArgumentException e) {
            log.error("Failed to update order: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/orders/{id} - 注文を削除（論理削除）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable UUID id) {
        log.info("DELETE /api/orders/{}", id);
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete order: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * エラーレスポンス
     */
    record ErrorResponse(String message) {
    }

}

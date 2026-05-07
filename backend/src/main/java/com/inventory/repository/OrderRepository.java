package com.inventory.repository;

import com.inventory.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT o FROM Order o WHERE o.deleted = false ORDER BY o.deliveryDate ASC, o.constructionDate ASC")
    List<Order> findAllNotDeleted();

    @Query("SELECT o FROM Order o WHERE o.id = ?1 AND o.deleted = false")
    Optional<Order> findByIdAndNotDeleted(UUID id);

    @Query("SELECT o FROM Order o WHERE o.status = ?1 AND o.deleted = false ORDER BY o.deliveryDate ASC")
    List<Order> findByStatusAndNotDeleted(Order.Status status);

    @Query("SELECT o FROM Order o WHERE o.customer.id = ?1 AND o.deleted = false ORDER BY o.deliveryDate ASC")
    List<Order> findByCustomerIdAndNotDeleted(UUID customerId);

    @Query("SELECT o FROM Order o WHERE o.deliveryDate >= ?1 AND o.deliveryDate <= ?2 AND o.deleted = false ORDER BY o.deliveryDate ASC")
    List<Order> findByDeliveryDateBetweenAndNotDeleted(LocalDate startDate, LocalDate endDate);

    @Query("SELECT o FROM Order o WHERE o.deliveryDate <= ?1 AND o.status IN ?2 AND o.deleted = false ORDER BY o.deliveryDate ASC")
    List<Order> findUpcomingOrders(LocalDate date, Collection<Order.Status> statuses);

}

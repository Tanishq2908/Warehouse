package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.EmployeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeePaymentRepository extends JpaRepository<EmployeePayment, Integer> {

    // TODO Special character, escape charater support to be implemented
    String findAllByIdQuery = "select * from employee_payment where " +
            " (:employee_id is null or employee_id = :employee_id)";

   //String findAllByNameQuery = "select * from employee where emp_name ILIKE %?%#{escape([0])} escape ?#{escapeCharacter()}";

    @Query(value = findAllByIdQuery, nativeQuery = true)
    List<EmployeePayment> findEmployeePayments(@Param("employee_id") Integer employeeId);

    EmployeePayment findByEmployeeId(Integer employeeId);
}

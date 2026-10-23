package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.entity.EmployeePaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;

@Repository
public interface EmployeePaymentHistoryRepository extends JpaRepository<EmployeePaymentHistory, Integer> {

    // TODO Special character, escape charater support to be implemented
    String findAllByCriteriaQuery = "select * from employee_payment_history where (:employee_id is null or employee_id = :employee_id) " +
            "  and (cast(:payment_date as timestamp) is null or payment_date = :payment_date) " +
            " and (cast(:start_date as timestamp) is null or created_at >= :start_date) " +
            " and (cast(:end_date as timestamp) is null or created_at - INTERVAL '1 DAY' <= :end_date) " +
            " order by created_at asc" +
            " OFFSET :start_key LIMIT :records";

   //String findAllByNameQuery = "select * from employee where emp_name ILIKE %?%#{escape([0])} escape ?#{escapeCharacter()}";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<EmployeePaymentHistory> findPaymentHistoriesByCriteria(@Param("employee_id") Integer employeeId,
                                                                @Param("payment_date") Date paymentDate,
                                                                @Param("start_date") Date startDate,
                                                                @Param("end_date") Date endDate,
                                                                @Param("start_key") Integer startKey,
                                                                @Param("records") Integer records );
   /* @Query(value = findAllByNameQuery)
    List<Employee> findEmployeesByName(String empName);*/
}

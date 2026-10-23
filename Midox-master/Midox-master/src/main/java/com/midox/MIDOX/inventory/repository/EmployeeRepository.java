package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Brand;
import com.midox.MIDOX.inventory.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    // TODO Special character, escape charater support to be implemented
    String findAllByNameQuery = "select * from employee where (:emp_name is null or emp_name ILIKE %:emp_name%)" +
            " and (:emp_id is null or emp_id = :emp_id)";

    String updatePasswordQuery = "update employee set password = :password where employee_id = :employee_id ";

   //String findAllByNameQuery = "select * from employee where emp_name ILIKE %?%#{escape([0])} escape ?#{escapeCharacter()}";

    @Query(value = findAllByNameQuery, nativeQuery = true)
    List<Employee> findEmployeesByName(@Param("emp_name") String empName, @Param("emp_id") Integer empId);
   /* @Query(value = findAllByNameQuery)
    List<Employee> findEmployeesByName(String empName);*/

    @Modifying
    @Query(value = updatePasswordQuery, nativeQuery = true)
    void updatePasswordByEmpId(@Param("employee_id") Integer employeeId, @Param("password") String password);
}

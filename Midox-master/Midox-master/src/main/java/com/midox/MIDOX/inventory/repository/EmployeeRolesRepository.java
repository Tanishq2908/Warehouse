package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.entity.EmployeeRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRolesRepository extends JpaRepository<EmployeeRoles, Integer> {

    String findAllByIdQuery = "select * from employee_roles where (:employee_id is null or employee_id = :employee_id)";

    String deleteAllByIdQuery = "delete from employee_roles where employee_id = :employee_id ";

    @Query(value = findAllByIdQuery, nativeQuery = true)
    List<EmployeeRoles> findEmployeeRolesByEmpId(@Param("employee_id") Integer employeeId);

    @Modifying
    @Query(value = deleteAllByIdQuery, nativeQuery = true)
    void deleteEmployeeRolesByEmpId(@Param("employee_id") Integer employeeId);
}

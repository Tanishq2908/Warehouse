package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.models.RequestModels.EmployeeRoleRequestModel;

import java.util.List;

public interface IEmployeeService{
    Employee addEmployee(Employee employee) throws MidoxException;

    Employee editEmployee(Employee employee);

    Employee getEmployee(Integer employeeId);

    List<Employee> getEmployeesByCriteria(String empName, Integer id);

    boolean addEmployeeRoles(EmployeeRoleRequestModel roles) throws MidoxException;

    List<String> getEmployeeRoles(Integer employeeId);

    boolean updatePassword(Integer employeeId, String password);

    //List<Employee> searchEmployees(String employeeName, String designation, String);
}
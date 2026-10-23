package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.service.spi.IEmployeeService;
import com.midox.MIDOX.inventory.util.MapperUtils;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        injectionStrategy = InjectionStrategy.CONSTRUCTOR,
imports = {MapperUtils.class})
public abstract class EmployeeNameMapper {

    @Mapping(source = "empId", target = "empId")
    @Mapping(source = "empId", target = "empName", qualifiedByName = "mapEmployeeName")
    abstract EmployeeDetails intToEmployee(Integer empId);

    @Autowired
    private IEmployeeService employeeService;

    @Named(value = "mapEmployeeName")
    String mapEmployeeFromId(Integer empId) {
        Employee emp = employeeService.getEmployee(empId);
        return emp.getEmpName();
    }

}

package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.BusinessConstants;
import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.EmployeeRoles;
import com.midox.MIDOX.inventory.models.RequestModels.EmployeeRoleRequestModel;
import com.midox.MIDOX.inventory.repository.EmployeeRepository;
import com.midox.MIDOX.inventory.repository.EmployeeRolesRepository;
import com.midox.MIDOX.inventory.service.spi.IEmployeePaymentService;
import com.midox.MIDOX.inventory.service.spi.IEmployeeService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements IEmployeeService{

    private static Map<Integer, Employee> employeeMap = new HashMap();

    @Autowired
    private final EmployeeRepository employeeRepo;

    @Autowired
    IEmployeePaymentService paymentService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    private EmployeeRolesRepository rolesRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Employee addEmployee(Employee employee) throws MidoxException{
        // TODO create employee payment entry on employee creation
        employee.setDefaultValues();
        employee.setPassword(passwordEncoder.encode(BusinessConstants.DEFAULT_PASSWORD));
        employee = employeeRepo.saveAndFlush(employee);
        createEmployeePayment(employee);
        return employee;
    }

    private void createEmployeePayment(Employee employee) throws MidoxException {
        EmployeePayment payment = new EmployeePayment();
        payment.setEmployeeId(employee.getEmpId());
        paymentService.addEmployeePayment(payment);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Employee editEmployee(Employee employee) {
        // TODO remove cached entry from emp map
        employeeMap.remove(employee.getEmpId());
        return employeeRepo.saveAndFlush(employee);
    }

    @Override
    public Employee getEmployee(Integer employeeId) {
        if(employeeMap.containsKey(employeeId)){
            return employeeMap.get(employeeId);
        }else{
            Optional<Employee> emp =  employeeRepo.findById(employeeId);
            if(emp.isPresent()) {
                employeeMap.put(employeeId, emp.get());
                return emp.get();
            }
        }
        return null;
    }

    @Override
    public List<Employee> getEmployeesByCriteria(String empName, Integer empId){
        return  employeeRepo.findEmployeesByName(empName, empId);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean addEmployeeRoles(EmployeeRoleRequestModel employee) throws MidoxException{
        if(employee.getEmployeeId() == null){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        final Integer employeeId = employee.getEmployeeId();
        rolesRepository.deleteEmployeeRolesByEmpId(employeeId);
        employee.getRoles().forEach(r -> {
            EmployeeRoles role = new EmployeeRoles();
            role.setRole(TextileEnum.Roles.valueOf(r));
            role.setEmployeeId(employeeId);
            role.setDefaultValues();
            rolesRepository.saveAndFlush(role);
        });
        return true;
    }

    @Override
    public List<String> getEmployeeRoles(Integer employeeId) {
        if(employeeId == null){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        List<EmployeeRoles> employeeRoles = rolesRepository.findEmployeeRolesByEmpId(employeeId);
        List<String> roles = new ArrayList<>();
        employeeRoles.forEach(r -> roles.add(r.getRole().toString()));
        return roles;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean updatePassword(Integer employeeId, String password){
        if(employeeId == null){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        Employee employee = getEmployee(employeeId);
        if(ValidationUtil.isNotNull(password)){
            // TODO remove encoding when incoming password is encoded
            employee.setPassword(passwordEncoder.encode(password));
        }else{
            employee.setPassword(passwordEncoder.encode(BusinessConstants.DEFAULT_PASSWORD));
        }
        employee.setDefaultValues();
        employeeRepo.saveAndFlush(employee);
        return true;
    }


}

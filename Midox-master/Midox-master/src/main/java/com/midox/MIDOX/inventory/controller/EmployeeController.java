package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.EmployeePaymentHistory;
import com.midox.MIDOX.inventory.entity.EmployeeRoles;
import com.midox.MIDOX.inventory.models.JwtRequest;
import com.midox.MIDOX.inventory.models.RequestModels.EmployeeRoleRequestModel;
import com.midox.MIDOX.inventory.models.RequestModels.GenericSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.PaymentSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.EmployeePaymentHistoryResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.EmployeePaymentResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobCardResponse;
import com.midox.MIDOX.inventory.repository.EmployeeRolesRepository;
import com.midox.MIDOX.inventory.service.spi.IEmployeePaymentService;
import com.midox.MIDOX.inventory.service.spi.IEmployeeService;
import com.midox.MIDOX.inventory.util.Mapper.EmployeePaymentHistoryMapper;
import com.midox.MIDOX.inventory.util.Mapper.EmployeePaymentMapper;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

    @Autowired
    private IEmployeeService employeeService;

    @Autowired
    private EmployeeRolesRepository employeeRolesRepository;

    @Autowired
    private IEmployeePaymentService paymentService;

    @Autowired
    private EmployeePaymentMapper paymentMapper;

    @Autowired
    private EmployeePaymentHistoryMapper paymentHistoryMapper;

    @PostMapping("/save")
    public ResponseEntity<Message> addEmployee(@RequestBody Employee employee) {
        ResponseEntity<Message> response = null;
        try {
            employeeService.addEmployee(employee);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.EMPLOYEE_ADDED_SUCCESSFULLY), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.EMPLOYEE_ADD_OPERATION_FAILED), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/edit")
    public ResponseEntity<Message> editEmployee(@RequestBody Employee employee) {
        ResponseEntity<Message> response = null;
        try {
            employeeService.editEmployee(employee);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.EMPLOYEE_ADDED_SUCCESSFULLY), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.EMPLOYEE_ADD_OPERATION_FAILED), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/get/{employeeId}")
    public ResponseEntity<?> getEmployee(@PathVariable Integer employeeId) {
        ResponseEntity<?> response = null;
        try {
            Employee employee = employeeService.getEmployee(employeeId);
            if(null != employee){
                response = new ResponseEntity<Employee>(employee, HttpStatus.OK);
            } else{
                response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.EMPLOYEE_NOT_FOUND), HttpStatus.OK);
            }
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/get-employees")
    public ResponseEntity<?> getEmployees(@RequestBody GenericSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<Employee> employees = employeeService.getEmployeesByCriteria(searchCriteria.getName(), searchCriteria.getId());
            response = new ResponseEntity<List<Employee>>(employees, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/outstandings")
    public ResponseEntity<?> getEmployeePaymentOutstandings(@RequestBody PaymentSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<EmployeePayment> payments = paymentService.getEmployeeOutstandingByCriteria(searchCriteria);
            List<EmployeePaymentResponse> result = new ArrayList<>();
            payments.forEach(p -> result.add(paymentMapper.toEmployeePaymentResponse(p)));
            response = new ResponseEntity<List<EmployeePaymentResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/pay-history")
    public ResponseEntity<?> getEmployeePaymentHistories(@RequestBody PaymentSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<EmployeePaymentHistory> paymentHistories = paymentService.getPaymentByCriteria(searchCriteria);
            List<EmployeePaymentHistoryResponse> result = new ArrayList<>();
            paymentHistories.forEach(p -> result.add(paymentHistoryMapper.toEmployeePaymentHistoryResponse(p)));
            response = new ResponseEntity<List<EmployeePaymentHistoryResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/pay")
    public ResponseEntity<Message> payEmployee(@RequestBody EmployeePaymentHistory paymentHistory) {
        ResponseEntity<Message> response = null;
        try {
            paymentService.makePayment(paymentHistory);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.EMPLOYEE_ADDED_SUCCESSFULLY), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/add-roles")
    public ResponseEntity<Message> addRoles(@RequestBody EmployeeRoleRequestModel roleRequestModel) {
        ResponseEntity<Message> response = null;
        try {
            employeeService.addEmployeeRoles(roleRequestModel);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.EMPLOYEE_ADDED_SUCCESSFULLY), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/get-roles/{employeeId}")
    public ResponseEntity<?> getEmployeeRoles(@PathVariable Integer employeeId) {
        ResponseEntity<?> response = null;
        try {
            List<String> roles = employeeService.getEmployeeRoles(employeeId);
            response = new ResponseEntity<List<String>>(roles, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/update-password")
    public ResponseEntity<Message> updateEmployeePassword(@RequestBody JwtRequest employee) {
        ResponseEntity<Message> response = null;
        try {
            employeeService.updatePassword(Integer.parseInt(employee.getUsername()), employee.getPassword());
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.PASSWORD_UPDATE_SUCCESFUL), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.PASSWORD_UPDATE_FAILED), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/reset-password/{employeeId}")
    public ResponseEntity<Message> resetEmployeePassword(@PathVariable Integer employeeId) {
        ResponseEntity<Message> response = null;
        try {
            employeeService.updatePassword(employeeId, null);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.PASSWORD_RESET_SUCCESFUL), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.PASSWORD_RESET_FAILED), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    // TODO implement delete api - should be soft delete. Roles should be removed once deleted

}

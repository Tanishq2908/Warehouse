package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.EmployeePaymentHistory;
import com.midox.MIDOX.inventory.entity.EmployeeRoles;
import com.midox.MIDOX.inventory.models.RequestModels.PaymentSearchCriteria;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IEmployeePaymentService {
    @Transactional(propagation = Propagation.REQUIRED)
    EmployeePayment addEmployeePayment(EmployeePayment payment) throws MidoxException;

    EmployeePayment updateEmployeePayment(EmployeePayment payment) throws MidoxException;

    EmployeePaymentHistory addEmployeePaymentHistory(EmployeePaymentHistory paymentHistory) throws MidoxException;

    EmployeePaymentHistory updateEmployeePaymentHistory(EmployeePaymentHistory paymentHistory) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    EmployeePayment makePayment(EmployeePaymentHistory payment) throws MidoxException;

    List<EmployeePaymentHistory> getPaymentByCriteria(PaymentSearchCriteria searchCriteria);

    List<EmployeePayment> getEmployeeOutstandingByCriteria(PaymentSearchCriteria searchCriteria);

    EmployeePayment getPaymentForEmployee(Integer employeeId);

    EmployeePayment createEmployeePayment(Integer employeeId) throws MidoxException;

    //List<Employee> searchEmployees(String employeeName, String designation, String);
}
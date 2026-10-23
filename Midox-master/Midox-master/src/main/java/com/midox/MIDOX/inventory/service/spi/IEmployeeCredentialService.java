package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.Employee;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface IEmployeeCredentialService extends UserDetailsService {


    Employee getEmployee(Integer employeeId);

    boolean doesPasswordNeedReset(String password);

}
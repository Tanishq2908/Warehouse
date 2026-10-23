package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.BusinessConstants;
import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.EmployeeRoles;
import com.midox.MIDOX.inventory.repository.EmployeeRepository;
import com.midox.MIDOX.inventory.repository.EmployeeRolesRepository;
import com.midox.MIDOX.inventory.service.spi.IEmployeeCredentialService;
import com.midox.MIDOX.inventory.service.spi.IEmployeePaymentService;
import com.midox.MIDOX.inventory.service.spi.IEmployeeService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EmployeeCredentialServiceImpl implements IEmployeeCredentialService{

    @Autowired
    private final EmployeeRepository employeeRepo;


    @Autowired
    private EmployeeRolesRepository rolesRepository;

    @Override
    public Employee getEmployee(Integer employeeId) {
        Optional<Employee> emp =  employeeRepo.findById(employeeId);
        if(emp.isPresent()) {
            return emp.get();
        }
        return null;
    }

    @Override
    public boolean doesPasswordNeedReset(String password) {
        // TODO need encoding when incoming password is encoded
        if( null != password){
            if( !BusinessConstants.DEFAULT_PASSWORD.equals(password)){
                return false;
            }
        }
        return true;
    }


    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        Employee employee = getEmployee(Integer.parseInt(userId));
        if (employee != null) {
            employee.setRoles(new HashSet<EmployeeRoles>(rolesRepository.findEmployeeRolesByEmpId(employee.getEmpId())));
            List<GrantedAuthority> authorities = getUserAuthority(employee.getRoles());
            return buildUserForAuthentication(employee, authorities);
        } else {
            throw new UsernameNotFoundException("Username not found");
        }
    }


    /*public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }*/

    private List<GrantedAuthority> getUserAuthority(Set<EmployeeRoles> userRoles) {
        Set<GrantedAuthority> roles = new HashSet<>();
        userRoles.forEach((role) -> {
            roles.add(new SimpleGrantedAuthority(role.getRole().toString()));
        });

        List<GrantedAuthority> grantedAuthorities = new ArrayList<>(roles);
        return grantedAuthorities;
    }

    private UserDetails buildUserForAuthentication(Employee employee, List<GrantedAuthority> authorities) {
        return new org.springframework.security.core.userdetails.User(employee.getEmpId().toString(), employee.getPassword(), authorities);
    }
}

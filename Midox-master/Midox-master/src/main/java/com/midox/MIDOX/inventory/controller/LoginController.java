package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.models.JwtRequest;
import com.midox.MIDOX.inventory.models.JwtResponse;
import com.midox.MIDOX.inventory.security.authentication.JwtTokenUtil;
import com.midox.MIDOX.inventory.service.spi.IEmployeeCredentialService;
import com.midox.MIDOX.inventory.service.spi.IEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin()
@RestController
/*@RequiredArgsConstructor
@RequestMapping("/login")*/
public class LoginController {
    @Autowired
    private IEmployeeCredentialService credentialService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping(value = {"/", "/home","/sign-in","/authenticate"})
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest authenticationRequest) {

        this.doAuthenticate(authenticationRequest.getUsername(), authenticationRequest.getPassword());

        UserDetails userDetails = credentialService.loadUserByUsername(authenticationRequest.getUsername());
        String token = this.jwtTokenUtil.generateToken(userDetails);

        // Get all the roles user have
        Set<String> roles = new HashSet<>();
        userDetails.getAuthorities().forEach(authority -> roles.add(authority.getAuthority()));

        Employee employee = credentialService.getEmployee(Integer.parseInt(authenticationRequest.getUsername()));

        boolean resetPassword = credentialService.doesPasswordNeedReset(authenticationRequest.getPassword());

        /*JwtResponse response = JwtResponse.builder()
                .jwtToken(token)
                .username(userDetails.getUsername()).build();*/
        JwtResponse response = new JwtResponse(token, roles, true, "Success", employee.getEmpName(), resetPassword);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private void doAuthenticate(String username, String password) {
        Objects.requireNonNull(username);
        Objects.requireNonNull(password);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username, password);
        try {
            authenticationManager.authenticate(authentication);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException(" Invalid Username or Password  !!");
        }
    }

    @ExceptionHandler(BadCredentialsException.class)
    public String exceptionHandler() {
        return "Credentials Invalid !!";
    }
}

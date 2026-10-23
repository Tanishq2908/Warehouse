package com.midox.MIDOX.inventory.models;

import lombok.Data;

import java.io.Serializable;
import java.util.Set;

@Data
public class JwtResponse implements Serializable {

    private static final long serialVersionUID = -8091879091924046844L;
    private final String token;
    private final Set<String> roles;
    private final boolean loginSuccessful;
    private final String message;
    private final String fullName;
    private final boolean resetPassword;
}

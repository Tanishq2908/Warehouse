package com.midox.MIDOX.inventory.models;

import lombok.Data;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.annotation.Id;

@Data
@EntityScan
public class Role {

    @Id
    private String id;

    private String role;
}

package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.constants.TextileEnum.Designation;
import com.midox.MIDOX.inventory.constants.TextileEnum.EmployeeStatus;
import com.midox.MIDOX.inventory.constants.TextileEnum.Roles;
import com.midox.MIDOX.inventory.models.Role;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Builder
// can work when enhancing
public class EmployeeRoles extends AbstractDataEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emp_role_id_generator")
    @SequenceGenerator(name = "emp_role_id_generator", sequenceName = "employee_role_seq", allocationSize = 1)
    @Column(name = "employee_role_id", unique = true)
    private Integer employeeRoleId;

    @NonNull
    @Column(name = "employee_id")
    private Integer employeeId;

    @NonNull
    @Column
    @Enumerated(EnumType.STRING)
    private Roles role;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
    }
}


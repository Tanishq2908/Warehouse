package com.midox.MIDOX.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.midox.MIDOX.inventory.constants.TextileEnum.*;
import com.midox.MIDOX.inventory.models.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.sql.ast.tree.expression.Over;
import org.springframework.validation.ValidationUtils;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Builder
// can work when enhancing
public class Employee extends AbstractDataEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emp_id_generator")
    @SequenceGenerator(name = "emp_id_generator", sequenceName = "emp_seq", allocationSize = 1)
    @Column(name = "emp_id", unique = true)
    private Integer empId;

    @NonNull
    @Column(name = "emp_name")
    private String empName;

    @NonNull
    @Column(name = "joining_date")
    private Date joiningDate;

    @NonNull
    @Column(name = "emp_dob")
    private Date empDOB;

    @NonNull
    @Column
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @NonNull
    @Column(name = "contact_no")
    private String contactNo;

    @NonNull
    @Column(name = "address")
    private String address;

    // Gender

    // Mobile no

    // Address

    @Column
    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    @Column(name = "identification_no")
    private String identificationNo;

    @NonNull
    @Enumerated(EnumType.STRING)
    private Designation designation;

    @Column(name = "email")
    private String email;

    @Column(name = "description")
    private String description;

    @Transient
    //@JsonIgnore
    private Set<EmployeeRoles> roles;

    @Column
    @JsonIgnore
    private String password;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.status = null == this.status ? EmployeeStatus.EMP_ACTIVE : this.status;
        this.joiningDate = null == this.joiningDate? new Date(System.currentTimeMillis()) : this.joiningDate;
    }
}


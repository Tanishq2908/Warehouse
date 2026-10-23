package com.midox.MIDOX.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Builder
public class EmployeePayment extends AbstractDataEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emp_payment_id_generator")
    @SequenceGenerator(name = "emp_payment_id_generator", sequenceName = "payment_sequence", allocationSize = 1)
    @Column(name = "payment_id", unique = true)
    private Integer paymentId;

    @NonNull
    @Column(name = "employee_id")
    private Integer employeeId;

    private Double outstanding;

    @Column(name = "total_paid")
    private Double totalPaid;

    @Transient
    private List<EmployeePaymentHistory> paymentHistories;

    @Transient
    private long pendingJob;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.outstanding = null == this.outstanding ? 0d : this.outstanding;
        this.totalPaid = null == this.totalPaid ? 0d : this.totalPaid;
    }
}


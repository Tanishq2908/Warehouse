package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.constants.TextileEnum.Designation;
import com.midox.MIDOX.inventory.constants.TextileEnum.EmployeeStatus;
import com.midox.MIDOX.inventory.constants.TextileEnum.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Builder
public class JobHistory extends AbstractDataEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "job_history_id_generator")
    @SequenceGenerator(name = "job_history_id_generator", sequenceName = "job_history_sequence", allocationSize = 1)
    @Column(name = "job_history_id", unique = true)
    private Integer jobHistoryId;

    @NonNull
    @Column(name = "employee_id")
    private Integer employeeId;

    @NonNull
    @Column(name = "bundle_history_id")
    private Integer bundleHistoryId;

    @NonNull
    @Column(name = "process_cd")
    String processCd;

    @Column(name = "assign_date")
    private Date assignDate;

    @Column(name = "completion_date")
    private Date completionDate;

    @Column
    private Double quantity;

    @Column(name = "paid_wage")
    private Double paidWage;

    @Column(name = "total_wage")
    private Double totalWage;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private TextileEnum.PaymentStatus paymentStatus;

    @Column
    String details;

    @Transient
    String bundleName;

    // TODO add job history status - same as bundle and once completed, should be marked completed and due wages should be computed after that only
    @Enumerated(EnumType.STRING)
    private TextileEnum.ProcStatus status;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.quantity = null == this.quantity ? 0d : this.quantity;
        this.totalWage = null == this.totalWage ? 0d : this.totalWage;
        this.paidWage = null == this.paidWage ? 0d : this.paidWage;
        this.paymentStatus = null == this.paymentStatus ? TextileEnum.PaymentStatus.PAID_UNPAID : this.paymentStatus;
        this.status = null == this.status ? TextileEnum.ProcStatus.PROC_STAT_INP : this.status;
        this.assignDate = null == this.assignDate? new Date(System.currentTimeMillis()) : this.assignDate;
    }
}


package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
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
public class EmployeePaymentHistory extends AbstractDataEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pay_history_id_generator")
    @SequenceGenerator(name = "pay_history_id_generator", sequenceName = "payment_history_sequence", allocationSize = 1)
    @Column(name = "payment_history_id", unique = true)
    private Integer paymentHistoryId;

    @NonNull
    @Column(name = "employee_id")
    private Integer employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode")
    private TextileEnum.PaymentMode paymentMode;

    @Column
    String details;

    @Column(name = "paid_by")
    private Integer paidBy;

    @Column(name = "payment_date")
    Date paymentDate;

    @Column(name = "amount_paid")
    private Double amountPaid;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.amountPaid = null == this.amountPaid ? 0d : this.amountPaid;
        this.paymentDate = null == this.paymentDate? new Date(System.currentTimeMillis()) : this.paymentDate;
    }
}


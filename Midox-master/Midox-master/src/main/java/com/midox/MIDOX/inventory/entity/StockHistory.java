package com.midox.MIDOX.inventory.entity;

import jakarta.annotation.Nullable;
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
@Table(name = "stock_history")
public class StockHistory extends AbstractDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "stock_history_generator")
    @SequenceGenerator(name = "stock_history_generator", sequenceName = "stock_history_sequence", allocationSize = 1)
    @Column(name = "stock_history_id", unique = true)
    private Integer stockHistoryId;

    @NonNull
    //@JsonBackReference
    //@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id")
    private Integer stockId;

    @Nullable
    @Column(name = "bill_no")
    private String billNo;

    @NonNull
    private Double quantity;

    @Column
    private Double amount;

    @Nullable
    @Column(name = "bill_date")
    private Date billDate;

    @Column(name = "supplier_id")
    private Integer supplierId;

    @Column(name = "adda_id")
    private Integer addaId;

    @Column(name = "credit_debit_ind")
    // C or D
    private char creditDebitInd;


    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.supplierId = (null == this.supplierId) ? ((this.creditDebitInd == 'C') ? 1 : null) : this.supplierId;
        this.addaId = (null == this.addaId) ? ((this.creditDebitInd == 'D') ? 1 : null) : this.addaId;
        this.billDate = null == this.billDate? new Date(System.currentTimeMillis()) : this.billDate;
    }
}

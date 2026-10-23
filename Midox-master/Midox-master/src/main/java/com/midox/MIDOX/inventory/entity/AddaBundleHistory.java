package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class AddaBundleHistory extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bundle_history_id_generator")
    @SequenceGenerator(name = "bundle_history_id_generator", sequenceName = "bundle_history_sequence", allocationSize = 1)
    @Column(name = "bundle_history_id", unique = true)
    private Integer bundleHistoryId;

    @NonNull
    @Column(name = "bundle_id")
    Integer bundleId;

    @Column(name = "employee_id")
    Integer employeeId;

    @NonNull
    @Column(name = "process_cd")
    String processCd;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(name = "process_status")
    private TextileEnum.ProcStatus processStatus;

    @NonNull
    @Column(name = "quantity")
    Double quantity;

    @Column(name = "start_date")
    private Date startDate;

    @Column(name = "end_date")
    private Date endDate;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.processStatus = null == this.processStatus ? TextileEnum.ProcStatus.PROC_STAT_TBS : this.processStatus;
        this.startDate = null == this.startDate? new Date(System.currentTimeMillis()) : this.startDate;
    }
}


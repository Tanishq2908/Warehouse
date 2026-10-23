package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class AddaBundle extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "adda_bundle_id_generator")
    @SequenceGenerator(name = "adda_bundle_id_generator", sequenceName = "bundle_sequence", allocationSize = 1)
    @Column(name = "bundle_id", unique = true)
    private Integer bundleId;

    @NonNull
    @Column(name = "pattern_id")
    Integer patternId;

    @NonNull
    @Column(name = "bundle_name")
    String bundleName;

    // TODO check if completion of bundle doesn't mark these fields null, then restore non null check
    //@NonNull
    @Column(name = "current_process_cd")
    String currentProcessCd;

    //@NonNull
    @Enumerated(EnumType.STRING)
    @Column(name = "current_process_status")
    private TextileEnum.ProcStatus currentProcessStatus;

    @Column(name = "current_employee_id")
    Integer currentEmployeeId;

    @Enumerated(EnumType.STRING)
    private TextileEnum.ProcStatus status;

    @NonNull
    @Column(name = "quantity")
    Double quantity;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.status = null == this.status ? TextileEnum.ProcStatus.PROC_STAT_TBS : this.status;

    }
}


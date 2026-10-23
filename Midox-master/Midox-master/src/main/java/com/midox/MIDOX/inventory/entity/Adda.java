package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.constants.TextileEnum.*;
import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class Adda extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "adda_id_generator")
    @SequenceGenerator(name = "adda_id_generator", sequenceName = "adda_sequence", allocationSize = 1)
    @Column(name = "adda_id", unique = true)
    private Integer addaId;

    @NonNull
    @Column(name = "adda_no")
    String addaNo;

    /*@NonNull]
    @Column(name = "brand_id")
    Integer brandId;

    @NonNull
    @Column(name = "product_cd")
    String productCd;*/

    @NonNull
    @Column(name = "design_id")
    Integer designId;

    @NonNull
    @Column(name = "brand_id")
    Integer brandId;

    // Also if brand and product are actually needed
    /*@NonNull
    @Column(name = "design_no")
    Integer designNo;*/

    @NonNull
    @Column(name = "quantity")
    Double quantity;

    @Column(name = "finished_quantity")
    Double finishedQuantity;

    @Column(name = "completion_date")
    Date completionDate;

    @Enumerated(EnumType.STRING)
    private ProcStatus status;

    @Column
    String remarks;

    @Transient
    List<AddaMaterial> addaMaterials;

    @Transient
    List<AddaPattern> addaPatterns;

    @Transient
    AddaInfo addaInfo;

    @Transient
    Double remainingQtyForPattern;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.finishedQuantity = null == this.finishedQuantity? 0.0 : this.finishedQuantity;
        this.status = null == this.status ? ProcStatus.PROC_STAT_TBS : this.status;
    }
}


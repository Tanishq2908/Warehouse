package com.midox.MIDOX.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class AddaInfo extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "adda_info_id_generator")
    @SequenceGenerator(name = "adda_info_id_generator", sequenceName = "adda_info_sequence", allocationSize = 1)
    @Column(name = "adda_info_id", unique = true)
    private Integer addaInfoId;

    @NonNull
    @Column(name = "adda_id")
    Integer addaId;

    @Column(name = "drying_by")
    Integer dryingBy;

    @Column(name = "cutting_by")
    Integer cuttingBy;

    @Column(name = "tie_by")
    Integer tieBy;

    @Column(name = "custom")
    Integer custom;

    @Column(name = "gross_weight")
    Double grossWeight;

    @Column(name = "net_weight")
    Double netWeight;

    @Column(name = "wastage_weight")
    Double wastageWeight;

    @Column(name = "wastage_percent")
    Double wastagePercent;

    @Column(name = "rib_weight")
    Double ribWeight;

    @Column(name = "paipin_weight")
    Double paipinWeight;

    @Column(name = "rib_net_weight")
    Double ribNetWeight;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
    }
}


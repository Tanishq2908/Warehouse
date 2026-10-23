package com.midox.MIDOX.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class AddaPattern extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "adda_pattern_id_generator")
    @SequenceGenerator(name = "adda_pattern_id_generator", sequenceName = "adda_pattern_sequence", allocationSize = 1)
    @Column(name = "pattern_id", unique = true)
    private Integer patternId;

    @NonNull
    @Column(name = "adda_id")
    Integer addaId;

    @NonNull
    @Column
    String size;

    @Column(name = "pattern_name")
    String patternName;

    @NonNull
    @Column
    String color;

    @NonNull
    @Column(name = "bundle_size")
    Integer bundleSize;

    @NonNull
    @Column(name = "quantity")
    Double quantity;

    @Column(name = "finished_quantity")
    Double finishedQuantity;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.finishedQuantity = null == this.finishedQuantity? 0.0 : this.finishedQuantity;
    }
}


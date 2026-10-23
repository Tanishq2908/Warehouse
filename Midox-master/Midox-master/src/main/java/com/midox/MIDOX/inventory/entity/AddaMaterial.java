package com.midox.MIDOX.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class AddaMaterial extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "adda_mat_id_generator")
    @SequenceGenerator(name = "adda_mat_id_generator", sequenceName = "adda_mat_sequence", allocationSize = 1)
    @Column(name = "adda_material_id", unique = true)
    private Integer addaMaterialId;

    @NonNull
    @Column(name = "adda_id")
    Integer addaId;

    @NonNull
    @Column(name = "stock_id")
    Integer stockId;

    @NonNull
    @Column(name = "quantity")
    Double quantity;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
    }
}


package com.midox.MIDOX.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Builder

public class Material extends AbstractDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "material_id_generator")
    @SequenceGenerator(name = "material_id_generator", sequenceName = "material_seq", allocationSize = 1)
    @Column(name = "material_id", unique = true)
    private Integer materialId;

    @NonNull
    @Column(name = "material_name")
    private String materialName;

    @NonNull
    @Column(name = "sub_category")
    private String subCategory;

    @NonNull
    @Column(name = "measurement_type")
    private String measurementType;

    @NonNull
    @Column(name = "color_fabric_code")
    private String colorFabricCode;

    @NonNull
    private String supplier;
}

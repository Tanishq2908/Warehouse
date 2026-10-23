package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class Design extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "design_id_generator")
    @SequenceGenerator(name = "design_id_generator", sequenceName = "design_sequence", allocationSize = 1)
    @Column(name = "design_id", unique = true)
    private Integer designId;

    @NonNull
    @Column(name = "design_no")
    String designNo;

    @NonNull
    @Column(name = "brand_id")
    Integer brandId;

    @NonNull
    @Column(name = "product_cd")
    String productCd;

    @Column(name = "details")
    String details;

    @Column
    @Enumerated(EnumType.STRING)
    private TextileEnum.Status status;

    @Transient
    List<DesignProcess> processes;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.status = null == this.status ? TextileEnum.Status.ACTIVE : this.status;
    }
}

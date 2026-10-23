package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.util.ValidationUtil;
import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.mapping.Set;
import org.springframework.boot.context.properties.bind.DefaultValue;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Builder

public class Stock extends AbstractDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "stock_id_generator")
    @SequenceGenerator(name = "stock_id_generator", sequenceName = "stock_sequence", allocationSize = 1)
    @Column(name = "stock_id", unique = true)
    private Integer stockId;

    @NonNull
    @Column(name = "material_cd")
    private String materialCd;

    @NonNull
    @Column(name = "subcategory_cd")
    private String subcategoryCd;

    @Column(name = "color_fabric_cd")
    private String colorFabricCd;

    @NonNull
    private String unit;

    @Column(name = "stock_name")
    private String stockName;

    @Column(name = "available_quantity")
    private Double availableQuantity;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.availableQuantity = null == this.availableQuantity? 0.0 : this.availableQuantity;
    }
}

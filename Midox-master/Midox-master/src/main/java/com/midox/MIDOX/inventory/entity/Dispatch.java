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
public class Dispatch extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dispatch_id_generator")
    @SequenceGenerator(name = "dispatch_id_generator", sequenceName = "dispatch_sequence", allocationSize = 1)
    @Column(name = "dispatch_id", unique = true)
    private Integer dispatchId;

    @NonNull
    @Column(name = "finished_goods_id")
    Integer finishedGoodsId;

    @Column
    Double quantity;

    @Column(name = "dispatch_date")
    Date dispatchDate;

    @Column
    String remarks;

    @Column(name="vehicle_no")
    String vehicleNo;

    @Column(name="dispatch_no")
    String dispatchNo;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.dispatchDate = null == this.dispatchDate ? new Date(System.currentTimeMillis()) : this.dispatchDate;
    }
}


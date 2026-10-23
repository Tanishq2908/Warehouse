package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.constants.TextileEnum.ProcStatus;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
public class FinishedGoods extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "goods_id_generator")
    @SequenceGenerator(name = "goods_id_generator", sequenceName = "finished_goods_sequence", allocationSize = 1)
    @Column(name = "finished_goods_id", unique = true)
    private Integer finishedGoodsId;

    @NonNull
    @Column(name = "adda_id")
    Integer addaId;

    @NonNull
    @Column(name = "pattern_id")
    Integer patternId;

    @Column(name = "dispatched_quantity")
    Double dispatchedQuantity;

    @Column(name = "finished_quantity")
    Double finishedQuantity;

    @Column(name = "available_quantity")
    Double availableQuantity;

    @Enumerated(EnumType.STRING)
    private TextileEnum.DispatchStatus status;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.finishedQuantity = null == this.finishedQuantity? 0.0 : this.finishedQuantity;
        this.dispatchedQuantity = null == this.dispatchedQuantity? 0.0 : this.dispatchedQuantity;
        this.availableQuantity = null == this.availableQuantity? 0.0 : this.availableQuantity;
        this.status = null == this.status ? TextileEnum.DispatchStatus.DISP_STATUS_PREP : this.status;
    }
}


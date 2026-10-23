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
public class DesignProcess extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "design_process_id_generator")
    @SequenceGenerator(name = "design_process_id_generator", sequenceName = "design_process_sequence", allocationSize = 1)
    @Column(name = "process_id", unique = true)
    private Integer processId;

    @NonNull
    @Column(name = "design_id")
    Integer designId;

    @NonNull
    @Column(name = "process_cd")
    String processCd;

    @NonNull
    @Column
    Integer priority;

    @NonNull
    @Column(name = "rate_per_peice")
    private Double ratePerPeice;

    @Column(name = "details")
    String details;

    @Column
    @Enumerated(EnumType.STRING)
    private TextileEnum.Status status;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.status = null == this.status ? TextileEnum.Status.ACTIVE : this.status;
    }
}

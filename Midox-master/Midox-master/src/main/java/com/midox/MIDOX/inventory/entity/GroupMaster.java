package com.midox.MIDOX.inventory.entity;

import jakarta.annotation.Nullable;
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
public class GroupMaster extends AbstractDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "group_master_id_generator")
    @SequenceGenerator(name = "group_master_id_generator", sequenceName = "group_master_sequence", allocationSize = 1)
    @Column(name = "master_id", unique = true)
    private Integer masterId;

    @NonNull
    @Column(name = "master_cd", unique = true)
    private String masterCd;

    @NonNull
    @Column(name = "display_value", unique = true)
    private String displayValue;

    @Nullable
    @Column(name = "master_prefix", unique = true)
    private String masterPrefix;

}

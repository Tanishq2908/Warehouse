package com.midox.MIDOX.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Entity
@Builder
// Can work when enhancing
public class Bundle extends AbstractDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bundle_id_generator")
    @SequenceGenerator(name = "bundle_id_generator", sequenceName = "bundle_seq", allocationSize = 1)
    @Column(name = "bundle_id", unique = true)
    private Integer bundleId;

    @NonNull
    @Column(name = "bundle_name")
    private String bundleName;

    @NonNull
    @Column(name = "pattern_id")
    Integer patternId;
}

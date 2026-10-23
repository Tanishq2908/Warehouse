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
// not sure about this
public class Pattern {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pattern_id_generator")
    @SequenceGenerator(name = "pattern_id_generator", sequenceName = "pattern_seq", allocationSize = 1)
    @Column(name = "pattern_id",unique = true)
    private Integer patternId;

    @NonNull
    @Column(name = "pattern_name")
    private String patternName;

    @NonNull
    @Column(name = "created_at")
    private Timestamp createdAt;

    @NonNull
    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @NonNull
    @Column(name = "created_by")
    private String createdBy;

    @NonNull
    @Column(name = "updated_by")
    private String updatedBy;
}

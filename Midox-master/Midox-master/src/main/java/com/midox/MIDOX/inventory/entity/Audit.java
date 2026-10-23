package com.midox.MIDOX.inventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
public class Audit {

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

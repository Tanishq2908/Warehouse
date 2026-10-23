package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Builder
@Table(name = "supplier")
public class Supplier extends AbstractDataEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "supplier_id_generator")
    @SequenceGenerator(name = "supplier_id_generator", sequenceName = "supplier_sequence", allocationSize = 1)
    @Column(name = "supplier_id", unique = true)
    private Integer supplierId;

    @NonNull
    @Column(name = "supplier_name")
    private String supplierName;

   @NonNull
    String address;

    @NonNull
    @Column(name = "supplier_uid")
    String supplierUID;

    @Column(name = "contact_no")
    private String contactNo;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column
    @Enumerated(EnumType.STRING)
    private TextileEnum.Status status;

    @Column(name = "email")
    private String email;

    @Column(name = "description")
    private String description;

    @Override
    public void setDefaultValues(){
        super.setDefaultValues();
        this.status = null == this.status ? TextileEnum.Status.ACTIVE : this.status;
    }
}

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
public class Brand extends AbstractDataEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "brand_id_generator")
    @SequenceGenerator(name = "brand_id_generator", sequenceName = "brand_sequence", allocationSize = 1)
    @Column(name = "brand_id", unique = true)
    private Integer brandId;

    @NonNull
    @Column(name = "brand_name")
    String brandName;

    @NonNull
    @Column
    String address;

    @NonNull
    @Column(name = "brand_uid")
    String brandUID;

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

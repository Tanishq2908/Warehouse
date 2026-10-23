package com.midox.MIDOX.inventory.entity;

import lombok.*;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Builder
public class BundleCard {

    private String addaNo;

    String item;

    String size;

    private String bundle;

    private String design;

    private Double quantity;

    String color;

    private Date date;

    private Integer designId;

    private List<String> stPros;




}


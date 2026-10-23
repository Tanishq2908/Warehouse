package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import lombok.*;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
public class BundleCardResponse {

    private String addaNo;

    EntityCode item;

    EntityCode size;

    private String bundle;

    private String design;

    private Double quantity;

    EntityCode color;

    private Date date;

    private List<String> stPros;
}


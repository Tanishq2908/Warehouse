package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.models.RequestWrapper;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SecondaryRow;

@Getter @Setter
public class GenericSearchCriteria implements RequestWrapper {

    String name;
    Integer id;
}

package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Getter @Setter
public class SearchResponse implements ResponseWrapper {


   String name;
   Integer id;
   TextileEnum.SearchResultType type;
}

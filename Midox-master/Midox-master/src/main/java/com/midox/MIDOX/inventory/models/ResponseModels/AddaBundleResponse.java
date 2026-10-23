package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter @Setter
public class AddaBundleResponse extends AbstractEntityResponse implements ResponseWrapper {

    Integer patternId;

    //Integer addaId;

    EntityCode size;

    EntityCode color;

    // Integer bundleSize;

    Double quantity;

    String addaNo;
    String designNo;
    // From design process
    Integer jobFlowNo;
    Double jobRate;

    Integer bundleId;

    String bundleName;

    EntityCode currentProcessCd;

    EntityCode currentProcessStatus;

    EmployeeDetails currentEmployeeId;

    EntityCode status;

}

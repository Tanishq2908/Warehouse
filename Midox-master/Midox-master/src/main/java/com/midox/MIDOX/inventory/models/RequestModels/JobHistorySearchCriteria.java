package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.models.RequestWrapper;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
public class JobHistorySearchCriteria implements RequestWrapper {

    Integer employeeId;
    Date completionDate;
    String processCd;
    Integer addaId;
    Integer bundleHistoryId;
    String paymentStatusToExclude;
    String paymentStatusToInclude;
    String statusToInclude;
    String statusToExclude;

    Date startDate = ConfigConstants.DEFAULT_CONFIG.startDate;
    Date endDate = ConfigConstants.DEFAULT_CONFIG.endDate;
    Integer startKey = ConfigConstants.DEFAULT_CONFIG.startKey;
    Integer records = ConfigConstants.DEFAULT_CONFIG.records;


}

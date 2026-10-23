package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.models.RequestWrapper;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;

@Getter@Setter
public class AddaBundleSearchCriteria implements RequestWrapper {

    Integer bundleId;
    String  bundleName;
    String  processCd;
    Integer patternId;
    Integer employeeId;
    Integer bundleHistoryId;
    List<Integer> employeeIds;
    List<Integer> bundleIds;

    Integer addaId;
    String  exclude_status;
    String  status;

    Date startDate = ConfigConstants.DEFAULT_CONFIG.startDate;
    Date endDate = ConfigConstants.DEFAULT_CONFIG.endDate;
    Integer startKey = ConfigConstants.DEFAULT_CONFIG.startKey;
    Integer records = ConfigConstants.DEFAULT_CONFIG.records;
}

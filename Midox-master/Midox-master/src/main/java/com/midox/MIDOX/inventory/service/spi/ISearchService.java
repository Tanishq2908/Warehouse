package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.entity.JobHistory;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.JobHistorySearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.SearchResponse;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.naming.directory.SearchResult;
import java.util.List;
import java.util.Map;

public interface ISearchService {
    List<SearchResponse> getSearchResult(String searchText);

    Map getDashboardData() throws MidoxException;

}
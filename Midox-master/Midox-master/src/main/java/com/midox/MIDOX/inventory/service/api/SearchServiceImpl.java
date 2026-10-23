package com.midox.MIDOX.inventory.service.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.models.ResponseModels.SearchResponse;
import com.midox.MIDOX.inventory.repository.JobHistoryRepository;
import com.midox.MIDOX.inventory.repository.SearchJDBC;
import com.midox.MIDOX.inventory.service.spi.IEmployeePaymentService;
import com.midox.MIDOX.inventory.service.spi.ISearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements ISearchService {

    @Autowired
    JobHistoryRepository jobHistoryRepository;

    @Autowired
    IEmployeePaymentService paymentService;

    @Autowired
    SearchJDBC searchJDBC;


    @Override
    public List<SearchResponse> getSearchResult(String searchText) {
        List<SearchResponse> response =  searchJDBC.findAllForGenericSearch(searchText);
        return response;
    }

    @Override
    public Map getDashboardData() throws MidoxException{
        Map<String, Object> result = new HashMap<>();
        result.putAll(searchJDBC.getTotalAdda());
        result.putAll(searchJDBC.getTotalAddaBundle());
        result.putAll(searchJDBC.getTotalEmployee());
        result.putAll(searchJDBC.getTotalJobCards());

        result.put(SearchJDBC.BUNDLE_BAR_CHART_KEY, searchJDBC.getBundleBarChart());
        result.put(SearchJDBC.ADDA_BAR_CHART_KEY,searchJDBC.getAddaBarChart());
        result.put(SearchJDBC.DISPATCH_BAR_CHART_KEY,Arrays.asList(searchJDBC.getDispatchBarChart(), searchJDBC.getDispatchBarChart()));
        result.put(SearchJDBC.STOCK_BAR_CHART_KEY,searchJDBC.getStockHistoryBarChart());

        Map<Object, Object> bundlePieChartResult = new HashMap();
        bundlePieChartResult.putAll(searchJDBC.getBundlePieChartHistory(TextileEnum.ProcStatus.PROC_STAT_TBS.toString(), SearchJDBC.TO_BE_STARTED));
        bundlePieChartResult.putAll(searchJDBC.getBundlePieChartHistory(TextileEnum.ProcStatus.PROC_STAT_INP.toString(), SearchJDBC.IN_PROGRESS));
        bundlePieChartResult.putAll(searchJDBC.getBundlePieChartHistory(TextileEnum.ProcStatus.PROC_STAT_FIN.toString(), SearchJDBC.FINISHED));

        result.put(SearchJDBC.BUNDLE_PIE_CHART_KEY, bundlePieChartResult);

        return result;
    }


}

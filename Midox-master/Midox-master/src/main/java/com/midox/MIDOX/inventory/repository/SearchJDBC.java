package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.BundleCard;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.SearchResponse;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Component;

import java.sql.Types;
import java.util.*;

@Component
public class SearchJDBC {

    private final String TOTAL_ADDA = "totalAdda";
    private final String TOTAL_BUNDLES = "bundles";
    private final String TOTAL_EMPLOYEES = "employees";
    private final String TOTAL_JOB_CARDS = "jobCard";

    public static final String IN_PROGRESS = "In Progress";
    public static final String TO_BE_STARTED = "To Be Started";
    public static final String FINISHED = "Finished";

    public static final String BUNDLE_BAR_CHART_KEY = "bundleBarChart";
    public static final String ADDA_BAR_CHART_KEY = "addaPerMonthBarChart";
    public static final String DISPATCH_BAR_CHART_KEY = "dispatchStackedChart";
    public static final String STOCK_BAR_CHART_KEY = "accessoriesBarChart";

    public static final String BUNDLE_PIE_CHART_KEY = "bundlePieChart";
    public static final String STOCK_PIE_CHART_KEY = "accessoriesBarChart";

    @Autowired
    JdbcTemplate jdbcTemplate;

    String findAllBundleCard = "select\n" +
            "\tab.created_at as date,\n" +
            "\ta.adda_no as addaNo,\n" +
            "\td.product_cd as item,\n" +
            "\tap.size as size,\n" +
            "\tap.color as color,\n" +
            "\tab.bundle_name as bundle,\n" +
            "\tab.quantity  as quantity,\n" +
            "\td.design_no as design,\n" +
            "\td.design_id as designId \n" +
            "\tfrom\n" +
            "\tadda_bundle ab,\n" +
            "\tadda_pattern ap,\n" +
            "\tadda a,\n" +
            "\tdesign d\n" +
            "where\n" +
            "\tab.pattern_id = ap.pattern_id\n" +
            "\tand ap.adda_id = a.adda_id\n" +
            "\tand a.design_id = d.design_id \n";
            //"\tand ab.bundle_id = 36;"

    String findAllJobCard = "select\n" +
            "\t'JC-' || j.job_history_id as jobCardNo,\n" +
            "\tj.employee_id employeeId,\t\n" +
            "\tj.process_cd as jobAssigned,\n" +
            "\ta.adda_no as addaNo,\n" +
            "\td.product_cd as item,\n" +
            "\tap.size as size,\n" +
            "\tab.bundle_name as bundle,\n" +
            "\td.design_no as design,\n" +
            "\tj.quantity  as quantity,\n" +
            "\tj.total_wage  as wageToProvide,\n" +
            "\tdp.rate_per_peice as rate,\n" +
            "\tdp.priority as jobFlowNumber,\n" +
            "\tap.pattern_name as pattern,\n" +
            "\tabh.process_status as status,\n" +
            "\tj.updated_at as lastModifiedAt,\n" +
            "\tj.updated_by as lastModifiedBy,\n" +
            "\tj.assign_date as assignDate\n" +
            "from\n" +
            "\tjob_history j,\n" +
            "\tadda_bundle_history abh,\n" +
            "\tadda_bundle ab,\n" +
            "\tadda_pattern ap,\n" +
            "\tadda a,\n" +
            "\tdesign d, \n" +
            "\tdesign_process dp\n" +
            "where\n" +
            "\tj.bundle_history_id = abh.bundle_history_id\n" +
            "\tand abh.bundle_id = ab.bundle_id\n" +
            "\tand ab.pattern_id = ap.pattern_id\n" +
            "\tand ap.adda_id = a.adda_id\n" +
            "\tand a.design_id = d.design_id \n" +
            "\tand abh.process_cd = dp.process_cd \n" +
            "\tand d.design_id = dp.design_id\n" +
            "\tand abh.process_cd  = ab.current_process_cd \n";

    String genericSearchQuery = "select e.emp_id as id, e.emp_name as name, 'EMPLOYEE' as type from employee e where e.emp_name ILIKE ? " +
            "union " +
            "select ab.bundle_id as id, ab.bundle_name as name, 'BUNDLE' as type from adda_bundle ab where ab.bundle_name ILIKE ? " +
            "union " +
            "select a.adda_id as id, a.adda_no as name, 'ADDA' as type from adda a  where a.adda_no ILIKE ? ";

    String getBundleNameByHistory = "select ab.bundle_name as bundle_name from adda_bundle ab , adda_bundle_history abh where ab.bundle_id = abh.bundle_id \n" +
            "and abh.bundle_history_id = ? ";

    String addJobFilterWithStatus = " and abh.process_status not in (?) ";
    String addJobFilterWithEmployees = " and j.employee_id IN (%s) ";
    String addJobFilterWithBundleHistory = " and abh.bundle_history_id = ? ";
    String addJobFilterWithBundle = " and ab.bundle_id = ? ";
    String addDateStartRangeOnJobCreation = " and j.created_at >= ? ";
    String addDateEndRangeOnJobCreation = " and j.created_at - INTERVAL '1 DAY' <= ? ";

    String addBundleFilterWithPattern = " and ab.pattern_id = ? ";
    String addBundleFilterWithAdda = " and a.adda_id = ? ";
    String addBundleFilterWithBundleIds = " and ab.bundle_id IN (%s) ";
    String addDateStartRangeOnBundleCreation = " and ab.created_at >= ? ";
    String addDateEndRangeOnBundleCreation = " and ab.created_at - INTERVAL '1 DAY' <= ? ";

    String getTotalAddaQuery = "select count(*) from adda ";
    String getTotalAddaBundleQuery = "select count(*) from adda_bundle ";
    String getTotalEmployeeQuery = "select count(*) from employee ";
    String getTotalJobCardsQuery = "select count(*) from adda_bundle_history ";

    String getBundlePieChartQuery = "select count(*) from adda_bundle where status = ? ";

    String SELECT_CLAUSE_FOR_BAR_CHART = "SELECT TO_CHAR(date_trunc('month', created_at),'MON'), count(*) ";
    String WHERE_CLAUSE_FOR_BAR_CHART = "where created_at between now() - interval '365' day and CURRENT_TIMESTAMP ";
    String GROUP_BY_CLAUSE_FOR_BAR_CHART = "group by date_trunc('month',\tcreated_at) ";
    String ORDER_BY_CLAUSE_FOR_BAR_CHART = "order by date_trunc('month',\tcreated_at) asc ";

    String OFFSET_LIMIT_CLAUSE = " OFFSET ? LIMIT ? ";


    public List<JobCard> findAllJobCards(AddaBundleSearchCriteria searchCriteria){
        String query = findAllJobCard;

        if(ValidationUtil.isNotNull(searchCriteria.getBundleHistoryId())){
            query = query + addJobFilterWithBundleHistory;
        }

        if(ValidationUtil.isNotNull(searchCriteria.getBundleId())){
            query = query + addJobFilterWithBundle;
        }

        if(ValidationUtil.isNotNull(searchCriteria.getExclude_status())){
            query = query + addJobFilterWithStatus;
        }

        if(ValidationUtil.isNotEmpty(searchCriteria.getEmployeeIds())){
            query = query + addJobFilterWithEmployees;
            String inSql = String.join(",", Collections.nCopies(searchCriteria.getEmployeeIds().size(), "?"));
            query = String.format(query, inSql);
        }

        if(null !=  searchCriteria.getStartDate()){
            query = query + addDateStartRangeOnJobCreation;
        }
        if(null !=  searchCriteria.getEndDate()){
            query = query + addDateEndRangeOnJobCreation;
        }
        // TODO Add order by
        String orderBy = " ORDER BY bundle ";

        query = query + orderBy;
        if(ValidationUtil.isNotNull(searchCriteria.getStartKey()) && ValidationUtil.isNotNull(searchCriteria.getRecords())){
            query = query + OFFSET_LIMIT_CLAUSE;
        }
        query = query + ";";

        SqlRowSet rs ;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();

        if(ValidationUtil.isNotNull(searchCriteria.getBundleHistoryId())) {
            args.add(searchCriteria.getBundleHistoryId()) ;
            argTypes.add(Types.INTEGER);
        }

        if(ValidationUtil.isNotNull(searchCriteria.getBundleId())) {
            args.add(searchCriteria.getBundleId()) ;
            argTypes.add(Types.INTEGER);
        }

        if(ValidationUtil.isNotNull(searchCriteria.getExclude_status())) {
           args.add(searchCriteria.getExclude_status()) ;
           argTypes.add(Types.VARCHAR);
        }
        if(ValidationUtil.isNotEmpty(searchCriteria.getEmployeeIds())){
            searchCriteria.getEmployeeIds().forEach(emp -> {
                args.add(emp);
                argTypes.add(Types.INTEGER);
            });
        }
        if(null !=  searchCriteria.getStartDate()){
            args.add(searchCriteria.getStartDate()) ;
            argTypes.add(Types.DATE);
        }
        if(null !=  searchCriteria.getEndDate()){
            args.add(searchCriteria.getEndDate()) ;
            argTypes.add(Types.DATE);
        }

        if(ValidationUtil.isNotNull(searchCriteria.getStartKey()) && ValidationUtil.isNotNull(searchCriteria.getRecords())){
            args.add(searchCriteria.getStartKey()) ;
            argTypes.add(Types.INTEGER);
            args.add(searchCriteria.getRecords()) ;
            argTypes.add(Types.INTEGER);
        }

       rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        List result = new ArrayList();
        while(rs.next()){
            JobCard jc = new JobCard();
            jc.setJobCardNo(rs.getString("jobCardNo"));
            jc.setEmployeeId( rs.getInt("employeeId"));
            jc.setJobAssigned(rs.getString("jobAssigned"));
            jc.setAddaNo(rs.getString("addaNo"));
            jc.setItem(rs.getString("item"));
            jc.setSize(rs.getString("size"));
            jc.setBundle(rs.getString("bundle"));
            jc.setPattern(rs.getString("pattern"));
            jc.setDesign(rs.getString("design"));
            jc.setQuantity(rs.getDouble("quantity"));
            jc.setWageToProvide(rs.getDouble("wageToProvide"));
            jc.setRate(rs.getDouble("rate"));
            jc.setJobFlowNumber(rs.getInt("jobFlowNumber"));
            jc.setStatus(rs.getString("status"));
            jc.setLastModifiedAt(rs.getTimestamp("lastModifiedAt"));
            jc.setLastModifiedBy( rs.getInt("lastModifiedBy"));
            jc.setAssignDate(rs.getDate("assignDate"));
            result.add(jc);
        }
        return result;
    }

    public List<BundleCard> findAllBundleCards(AddaBundleSearchCriteria searchCriteria){
        String query = findAllBundleCard;

        if(ValidationUtil.isNotNull(searchCriteria.getPatternId())){
            query = query + addBundleFilterWithPattern;
        }

        if(ValidationUtil.isNotNull(searchCriteria.getAddaId())){
            query = query + addBundleFilterWithAdda;
        }

        if(ValidationUtil.isNotEmpty(searchCriteria.getBundleIds())){
            query = query + addBundleFilterWithBundleIds;
            String inSql = String.join(",", Collections.nCopies(searchCriteria.getBundleIds().size(), "?"));
            query = String.format(query, inSql);
        }

        if(null !=  searchCriteria.getStartDate()){
            query = query + addDateStartRangeOnBundleCreation;
        }
        if(null !=  searchCriteria.getEndDate()){
            query = query + addDateEndRangeOnBundleCreation;
        }

        // TODO Add order by
        String orderBy = " ORDER BY bundle ";

        query = query + orderBy;

        if(ValidationUtil.isNotNull(searchCriteria.getStartKey()) && ValidationUtil.isNotNull(searchCriteria.getRecords())){
            query = query + OFFSET_LIMIT_CLAUSE;
        }

        query = query + ";";

        SqlRowSet rs ;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();

        if(ValidationUtil.isNotNull(searchCriteria.getPatternId())) {
            args.add(searchCriteria.getPatternId()) ;
            argTypes.add(Types.INTEGER);
        }

        if(ValidationUtil.isNotNull(searchCriteria.getAddaId())) {
            args.add(searchCriteria.getAddaId()) ;
            argTypes.add(Types.INTEGER);
        }

        if(ValidationUtil.isNotEmpty(searchCriteria.getBundleIds())){
            searchCriteria.getBundleIds().forEach(b -> {
                args.add(b);
                argTypes.add(Types.INTEGER);
            });
        }

        if(null !=  searchCriteria.getStartDate()){
            args.add(searchCriteria.getStartDate()) ;
            argTypes.add(Types.DATE);
        }
        if(null !=  searchCriteria.getEndDate()){
            args.add(searchCriteria.getEndDate()) ;
            argTypes.add(Types.DATE);
        }

        if(ValidationUtil.isNotNull(searchCriteria.getStartKey()) && ValidationUtil.isNotNull(searchCriteria.getRecords())){
            args.add(searchCriteria.getStartKey()) ;
            argTypes.add(Types.INTEGER);
            args.add(searchCriteria.getRecords()) ;
            argTypes.add(Types.INTEGER);
        }
        rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        List result = new ArrayList();
        while(rs.next()){
            BundleCard jc = new BundleCard();
            jc.setAddaNo(rs.getString("addaNo"));
            jc.setItem(rs.getString("item"));
            jc.setSize(rs.getString("size"));
            jc.setBundle(rs.getString("bundle"));
            jc.setDesign(rs.getString("design"));
            jc.setColor(rs.getString("color"));
            jc.setQuantity(rs.getDouble("quantity"));
            jc.setDate(rs.getDate("date"));
            jc.setDesignId(rs.getInt("designId"));
            result.add(jc);
        }
        return result;
    }

    public List<SearchResponse> findAllForGenericSearch(String searchText){
        String query = genericSearchQuery;

        query = query + ";";
        SqlRowSet rs ;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();

        args.add("%"+searchText+"%") ;
        argTypes.add(Types.VARCHAR);
        args.add("%"+searchText+"%") ;
        argTypes.add(Types.VARCHAR);
        args.add("%"+searchText+"%") ;
        argTypes.add(Types.VARCHAR);

        rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        List result = new ArrayList();
        while(rs.next()){
            SearchResponse response = new SearchResponse();
            response.setName(rs.getString("name"));
            response.setId(rs.getInt("id"));
            response.setType(TextileEnum.SearchResultType.valueOf(rs.getString("type")));
            result.add(response);
        }
        return result;
    }

    public String getBundleNameFromHistory(Integer bundleHistoryId){
        String query = getBundleNameByHistory;

        query = query + ";";
        SqlRowSet rs ;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();

        args.add(bundleHistoryId) ;
        argTypes.add(Types.INTEGER);

        rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        String result = null;
        while(rs.next()){
            result = rs.getString("bundle_name");
        }
        return result;
    }

    public Map getTotalAdda(){
        String query = getTotalAddaQuery;
        query = query + ";";

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = new HashMap();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            resultMap.put(TOTAL_ADDA,rs.getString(index++));
        }
        return resultMap;
    }

    public Map getTotalAddaBundle(){
        String query = getTotalAddaBundleQuery;
        query = query + ";";

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = new HashMap();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            resultMap.put(TOTAL_BUNDLES,rs.getString(index++));
        }
        return resultMap;
    }

    public Map getTotalEmployee(){
        String query = getTotalEmployeeQuery;
        query = query + ";";

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = new HashMap();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            resultMap.put(TOTAL_EMPLOYEES,rs.getString(index++));
        }
        return resultMap;
    }

    public Map getTotalJobCards(){
        String query = getTotalJobCardsQuery;
        query = query + ";";

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = new HashMap();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            resultMap.put(TOTAL_JOB_CARDS,rs.getString(index++));
        }
        return resultMap;
    }

    public Map getBundleBarChart(){
        String query = SELECT_CLAUSE_FOR_BAR_CHART;
        query = query + "FROM ADDA_BUNDLE ";
        query = query + WHERE_CLAUSE_FOR_BAR_CHART;
        query = query + "and status = 'PROC_STAT_FIN' ";
        query = query + GROUP_BY_CLAUSE_FOR_BAR_CHART;
        query = query + ORDER_BY_CLAUSE_FOR_BAR_CHART;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = generateDefaultMapForMonths();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            index = 1;
            resultMap.put(rs.getString(index++),rs.getString(index++));
        }
        return resultMap;
    }

    public Map getAddaBarChart(){
        String query = SELECT_CLAUSE_FOR_BAR_CHART;
        query = query + "FROM ADDA ";
        query = query + WHERE_CLAUSE_FOR_BAR_CHART;
        //query = query + "and status = 'PROC_STAT_FIN' ";
        query = query + GROUP_BY_CLAUSE_FOR_BAR_CHART;
        query = query + ORDER_BY_CLAUSE_FOR_BAR_CHART;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = generateDefaultMapForMonths();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            index = 1;
            resultMap.put(rs.getString(index++),rs.getString(index++));
        }
        return resultMap;
    }

    public Map getDispatchBarChart(){
        String query = SELECT_CLAUSE_FOR_BAR_CHART;
        query = query + "FROM DISPATCH ";
        query = query + WHERE_CLAUSE_FOR_BAR_CHART;
        //query = query + "and status = 'PROC_STAT_FIN' ";
        query = query + GROUP_BY_CLAUSE_FOR_BAR_CHART;
        query = query + ORDER_BY_CLAUSE_FOR_BAR_CHART;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = generateDefaultMapForMonths();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            index = 1;
            resultMap.put(rs.getString(index++),rs.getString(index++));
        }
        return resultMap;
    }

    public Map getStockHistoryBarChart(){
        String query = SELECT_CLAUSE_FOR_BAR_CHART;
        query = query + "FROM STOCK_HISTORY ";
        query = query + WHERE_CLAUSE_FOR_BAR_CHART;
        query = query + "and CREDIT_DEBIT_IND= 'C' ";
        query = query + GROUP_BY_CLAUSE_FOR_BAR_CHART;
        query = query + ORDER_BY_CLAUSE_FOR_BAR_CHART;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();
        Map<String, String> resultMap = generateDefaultMapForMonths();

        SqlRowSet rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            index = 1;
            resultMap.put(rs.getString(index++),rs.getString(index++));
        }
        return resultMap;
    }

    public Map getBundlePieChartHistory(String statusCd, String pieKey){
        String query = getBundlePieChartQuery;

        query = query + ";";
        SqlRowSet rs ;

        List<Object> args = new ArrayList<>();
        List<Integer> argTypes = new ArrayList<>();

        args.add(statusCd) ;
        argTypes.add(Types.VARCHAR);
        Map<String, String> resultMap = new HashMap();

        rs = jdbcTemplate.queryForRowSet(query, args.toArray(), argTypes.stream().mapToInt(i -> i).toArray());

        int index=1;
        while(rs.next()){
            resultMap.put(pieKey,rs.getString(index++));
        }
        return resultMap;
    }

    Map<String, String> generateDefaultMapForMonths(){
        Map<String, String > monthMap = new LinkedHashMap<>();
        monthMap.put("JAN", "0");
        monthMap.put("FEB", "0");
        monthMap.put("MAR", "0");
        monthMap.put("APR", "0");
        monthMap.put("MAY", "0");
        monthMap.put("JUN", "0");
        monthMap.put("JUL", "0");
        monthMap.put("AUG", "0");
        monthMap.put("SEP", "0");
        monthMap.put("OCT", "0");
        monthMap.put("NOV", "0");
        monthMap.put("DEC", "0");
        return monthMap;
    }
}

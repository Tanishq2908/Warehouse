package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.BusinessConstants;
import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.DispatchSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.StockHistorySearchCriteria;
import com.midox.MIDOX.inventory.repository.Adda.AddaInfoRepository;
import com.midox.MIDOX.inventory.repository.Adda.AddaMaterialRepository;
import com.midox.MIDOX.inventory.repository.Adda.AddaPatternRepository;
import com.midox.MIDOX.inventory.repository.Adda.AddaRepository;
import com.midox.MIDOX.inventory.service.spi.*;
import com.midox.MIDOX.inventory.util.MapperUtils;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddaServiceImpl implements IAddaService {

    @Autowired
    AddaRepository addaRepository;

    @Autowired
    AddaMaterialRepository addaMaterialRepo;

    @Autowired
    AddaInfoRepository addaInfoRepository;

    @Autowired
    AddaPatternRepository addaPatternRepo;

    @Autowired
    IStockHistoryService stockHistoryService;

    @Autowired
    IStockService stockService;

    @Autowired
    IDesignProcessService processService;

    @Autowired
    @Lazy
    IAddaBundleService bundleService;

    @Autowired
    IFinishedGoodsService goodsService;

    @Override
    public Adda addAdda(Adda adda) {
        adda.setDefaultValues();
        return addaRepository.saveAndFlush(adda);
    }

    @Override
    public Adda create(Adda adda) throws MidoxException{
        String addaNoPrefix = getAddaNoPrefix();
        adda.setAddaNo(addaNoPrefix+(addaRepository.getSeqCurrentVal()+1));
        AddaInfo info = adda.getAddaInfo();
        adda = addAdda(adda);
        createAddaInfo(info, adda);
        return adda;
    }

    private AddaInfo createAddaInfo(AddaInfo addaInfo, Adda adda){
        addaInfo.setAddaId(adda.getAddaId());
        addaInfo.setDefaultValues();
        addaInfoRepository.saveAndFlush(addaInfo);
        return addaInfo;
    }

    @Override
    public Adda updateAdda(Adda adda) throws MidoxException{
        if(null == adda.getAddaId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        adda.setDefaultValues();
        return addaRepository.saveAndFlush(adda);
    }

    @Override
    public Adda updateAddaWithFinishedGoods(Adda adda, AddaPattern pattern, AddaBundle bundle) throws MidoxException{
        if(null == adda.getAddaId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        DispatchSearchCriteria searchCriteria = new DispatchSearchCriteria();
        searchCriteria.setAddaId(pattern.getAddaId());
        searchCriteria.setPatternId(bundle.getPatternId());
        List<FinishedGoods>  goods = goodsService.getFinishedGoods(searchCriteria);
        if(ValidationUtil.isNotEmpty(goods)){
            // TODO goods are duplicate due to dispatch entry, check on size/or make it unique
            FinishedGoods finishedGood = goods.get(0);
            finishedGood.setFinishedQuantity(finishedGood.getFinishedQuantity() + bundle.getQuantity());
            finishedGood.setAvailableQuantity(finishedGood.getAvailableQuantity() + bundle.getQuantity());
            if(finishedGood.getFinishedQuantity().doubleValue() == pattern.getQuantity().doubleValue()){
                finishedGood.setStatus(TextileEnum.DispatchStatus.DISP_STATUS_READY);
            }
            goodsService.updateFinishedGoods(finishedGood);
        } else{
            FinishedGoods finishedGood = new FinishedGoods();
            finishedGood.setAddaId(adda.getAddaId());
            finishedGood.setPatternId(bundle.getPatternId());
            finishedGood.setFinishedQuantity(bundle.getQuantity());
            finishedGood.setAvailableQuantity(bundle.getQuantity());
            goodsService.createFinishedGoods(finishedGood);
        }
        adda.setDefaultValues();
        return addaRepository.saveAndFlush(adda);
    }

    private String getAddaNoPrefix(){
        return "A-";
    }

    @Override
    public AddaMaterial addAddaMaterial(AddaMaterial addaMaterial) throws MidoxException{
        createStockHistoryForAdda(addaMaterial);
        addaMaterial.setDefaultValues();
        return addaMaterialRepo.saveAndFlush(addaMaterial);
    }

    @Override
    public AddaMaterial updateAddaMaterial(AddaMaterial addaMaterial) throws MidoxException {
        //TODO put a check for bundle creation - no update allowed post bundle creation
        if(null == addaMaterial.getAddaMaterialId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        Optional<AddaMaterial> existingMaterial = addaMaterialRepo.findById(addaMaterial.getAddaMaterialId());
        if(existingMaterial.isEmpty()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        AddaMaterial existing = existingMaterial.get();
        updatedStockHistoryForAdda(addaMaterial);
        existing.setQuantity(addaMaterial.getQuantity());
        existing.setDefaultValues();
        return addaMaterialRepo.saveAndFlush(existing);
    }

    @Override
    public void deleteAddaMaterial(AddaMaterial addaMaterial) throws MidoxException{
        //TODO put a check for bundle creation - no update allowed post bundle creation
        if(null == addaMaterial.getAddaMaterialId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        deleteStockHistoryForAdda(addaMaterial);
        addaMaterialRepo.deleteById(addaMaterial.getAddaMaterialId());
    }

    private boolean validateSufficientStockQuantity(Stock stock, Double quantity){
        return stock.getAvailableQuantity() >= quantity;
    }

    private boolean validatePatternQuantityAgainstAdda(AddaPattern pattern, boolean excludeExistingPattern){
        Adda existingAdda = addaRepository.findById(pattern.getAddaId()).get();
        List<AddaPattern> patterns = addaPatternRepo.findAllByAddaId(existingAdda.getAddaId(), ValidationUtil.sortBy);
        if(excludeExistingPattern){
            patterns = patterns.stream().filter(p-> p.getPatternId() != pattern.getPatternId()).collect(Collectors.toList());
        }
        Double existingPatternQuantities = patterns.stream().mapToDouble(AddaPattern::getQuantity).sum();
        return existingAdda.getQuantity() - existingPatternQuantities >= pattern.getQuantity();
        // 500 -50 > 450
//        patterns.stream().reduce(0,(x,y) -> x.getQuantity()+ y.getQuantity());

    }
    @Override
    public AddaPattern addAddaPattern(AddaPattern addaPattern) throws MidoxException{
        if(!validatePatternQuantityAgainstAdda(addaPattern, false)){
            throw new MidoxException(MidoxException.TOTAL_PATTERN_QUANTITY_EXCEEDS_ADDA_QTY);
        }
        addaPattern.setDefaultValues();
        addaPattern.setPatternName(getPatternName(addaPattern));
        addaPattern = addaPatternRepo.saveAndFlush(addaPattern);
        bundleService.createBundlesForPattern(addaPattern);
        return addaPattern;
    }

    private String getPatternName(AddaPattern pattern){
        StringBuilder patternName = new StringBuilder("A");
        patternName.append(pattern.getAddaId()).append("-P-");
        patternName.append(MapperUtils.getDisplayValueForEntity(pattern.getSize())).append("_");
        patternName.append(MapperUtils.getDisplayValueForEntity(pattern.getColor())).append("_");
        return patternName.toString().trim().replaceAll(" ", "_");
    }

    @Override

    public AddaPattern updateAddaPattern(AddaPattern addaPattern) throws MidoxException {
        if(null == addaPattern.getPatternId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        if(!validatePatternQuantityAgainstAdda(addaPattern, true)){
            throw new MidoxException(MidoxException.TOTAL_PATTERN_QUANTITY_EXCEEDS_ADDA_QTY);
        }
        addaPattern.setDefaultValues();
        return addaPatternRepo.saveAndFlush(addaPattern);
    }

    @Override
    public void deleteAddaPattern(AddaPattern addaPattern) throws MidoxException{
        if(null == addaPattern.getPatternId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        // TODO delete bundles also
        addaPatternRepo.deleteById(addaPattern.getPatternId());
    }

    @Override
    public List<Adda> getAddaByCriteria(AddaSearchCriteria searchCriteria) {
        List<Adda> addas =  addaRepository.findAddasByCriteria(searchCriteria.getDesignId(), searchCriteria.getDesignNo(), searchCriteria.getAddaId(), searchCriteria.getBrandId(), searchCriteria.getProductCd(), searchCriteria.getAddaNo());
        // TODO load dependents conditionally
        //if(searchCriteria.isLoadDependents()) {
            addas.forEach(adda -> {
                adda.setAddaMaterials(addaMaterialRepo.findAllByAddaId(adda.getAddaId()));
                adda.setAddaPatterns(addaPatternRepo.findAllByAddaId(adda.getAddaId(), ValidationUtil.sortBy));
                adda.setRemainingQtyForPattern(computeRemainingQuantity(adda));
                adda.setAddaInfo(addaInfoRepository.findByAddaId(adda.getAddaId()));
            });
        //}
        return addas;
    }

    private Double computeRemainingQuantity(Adda adda){
        Double total = adda.getAddaPatterns().stream().mapToDouble(i->i.getQuantity()).sum();
        return adda.getQuantity() - total;
    }

    @Override
    public List<DesignProcess> getDesignProcessesForAdda(Integer addaId){
       Adda adda = addaRepository.findById(addaId).get();

       return processService.getAllProcessesForDesign(adda.getDesignId());
    }

    @Override
    public AddaPattern getPatternById(Integer patternId){
        //TODO exception handling
        return addaPatternRepo.findById(patternId).get();
    }

    private void createStockHistoryForAdda(AddaMaterial addaMaterial) throws MidoxException{
        Stock found = stockService.getStockById(addaMaterial.getStockId());
        if(!validateSufficientStockQuantity(found, addaMaterial.getQuantity())){
            throw new MidoxException(MidoxException.NOT_ENOUGH_QUANTITY);
        }
        StockHistory history = new StockHistory();
        history.setStockId(addaMaterial.getStockId());
        history.setCreditDebitInd(BusinessConstants.DEBIT_INDICATOR);
        history.setQuantity(addaMaterial.getQuantity());
        history.setAddaId(addaMaterial.getAddaId());

        stockHistoryService.createStockHistory(history);
        found.setAvailableQuantity(found.getAvailableQuantity() - addaMaterial.getQuantity());
        stockService.updateStock(found);
    }

    private void updatedStockHistoryForAdda(AddaMaterial addaMaterial) throws MidoxException{
        Stock found = stockService.getStockById(addaMaterial.getStockId());

        StockHistorySearchCriteria searchCriteria = new StockHistorySearchCriteria();
        searchCriteria.setStockId(addaMaterial.getStockId());
        searchCriteria.setAddaId(addaMaterial.getAddaId());
        List<StockHistory> histories = stockHistoryService.getStockHistoryFromCriteria(searchCriteria);
        // TODO check history exist and handle
        StockHistory history = histories.get(0);

        found.setAvailableQuantity(found.getAvailableQuantity() + history.getQuantity());
        if(!validateSufficientStockQuantity(found, addaMaterial.getQuantity())){
            throw new MidoxException(MidoxException.NOT_ENOUGH_QUANTITY);
        }
        history.setQuantity(addaMaterial.getQuantity());
        stockHistoryService.updateStockHistory(history);
        found.setAvailableQuantity(found.getAvailableQuantity() - history.getQuantity());
        stockService.updateStock(found);
    }

    private void deleteStockHistoryForAdda(AddaMaterial addaMaterial) throws MidoxException{
        Optional<AddaMaterial> material = addaMaterialRepo.findById(addaMaterial.getAddaMaterialId());
        if(material.isEmpty()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        addaMaterial =material.get();
        StockHistorySearchCriteria searchCriteria = new StockHistorySearchCriteria();
        searchCriteria.setStockId(addaMaterial.getStockId());
        searchCriteria.setAddaId(addaMaterial.getAddaId());

        List<StockHistory> histories = stockHistoryService.getStockHistoryFromCriteria(searchCriteria);
        if(!ValidationUtil.isEmpty(histories)) {
            StockHistory history = histories.get(0);
            Stock found = stockService.getStockById(addaMaterial.getStockId());
            found.setAvailableQuantity(found.getAvailableQuantity() + history.getQuantity());
            stockHistoryService.deleteStockHistory(history);
            stockService.updateStock(found);
        }
    }
}

package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.entity.Dispatch;
import com.midox.MIDOX.inventory.entity.FinishedGoods;
import com.midox.MIDOX.inventory.models.RequestModels.DispatchSearchCriteria;
import com.midox.MIDOX.inventory.repository.DispatchRepository;
import com.midox.MIDOX.inventory.service.spi.IAddaService;
import com.midox.MIDOX.inventory.service.spi.IDispatchService;
import com.midox.MIDOX.inventory.service.spi.IFinishedGoodsService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DispatchServiceImpl implements IDispatchService {

    @Autowired
    DispatchRepository dispatchRepository;

    @Autowired
    IFinishedGoodsService finishedGoodsService;

    //@Autowired
    //IAddaService addaService;

    @Override
    public Dispatch createDispatch(Dispatch dispatch) throws MidoxException{
        // TODO update finished goods dispatch quantity
        updateFinishedGoods(dispatch);
        return addDispatch(dispatch);
    }

    @Override
    public Dispatch addDispatch(Dispatch dispatch) throws MidoxException{
        // TODO update finished goods dispatch quantity
        dispatch.setDefaultValues();
        return dispatchRepository.saveAndFlush(dispatch);
    }

    // TODO 28-03-2024 add total qty also to dispatch so that user will be aware
    private void updateFinishedGoods(Dispatch dispatch) throws MidoxException{
        DispatchSearchCriteria searchCriteria = new DispatchSearchCriteria();
        searchCriteria.setFinishedGoodsId(dispatch.getFinishedGoodsId());
        List<FinishedGoods> finishedGoods = finishedGoodsService.getFinishedGoods(searchCriteria);
        if(ValidationUtil.isNotEmpty(finishedGoods)){
            FinishedGoods finishedGood = finishedGoods.get(0);
            if(!validateDispatchQtyAgainstAvlQty(dispatch, finishedGood)){
                throw new MidoxException(MidoxException.NOT_ENOUGH_QUANTITY);
            }
            finishedGood.setDispatchedQuantity(finishedGood.getDispatchedQuantity() + dispatch.getQuantity());
            finishedGood.setAvailableQuantity(finishedGood.getAvailableQuantity() - dispatch.getQuantity());
            if(TextileEnum.DispatchStatus.DISP_STATUS_READY.equals(finishedGood.getStatus())){
                if(finishedGood.getFinishedQuantity().doubleValue() == finishedGood.getDispatchedQuantity().doubleValue()){
                    finishedGood.setStatus(TextileEnum.DispatchStatus.DISP_STATUS_FULL);
                } else{
                    finishedGood.setStatus(TextileEnum.DispatchStatus.DISP_STATUS_PART);
                }
            }
            finishedGoodsService.updateFinishedGoods(finishedGood);
        }
    }

    private boolean validateDispatchQtyAgainstAvlQty(Dispatch dispatch, FinishedGoods finishedGoods){
        if(null != dispatch && null !=  finishedGoods){
            return finishedGoods.getAvailableQuantity() >= dispatch.getQuantity();
        }
        return false;
    }

    // TODO revisit this
    private boolean validateQtyAgainstPatternQty(Dispatch dispatch, FinishedGoods finishedGood){
        //AddaPattern pattern = addaService.getPatternById(finishedGood.getPatternId());
        DispatchSearchCriteria searchCriteria = new DispatchSearchCriteria();
        searchCriteria.setPatternId(finishedGood.getPatternId());
        List<Dispatch> dispatches = getDispatchHistory(searchCriteria);
        Double totalDispatched = dispatch.getQuantity();
        if(ValidationUtil.isNotEmpty(dispatches)){
            for(Dispatch d : dispatches){
                totalDispatched = totalDispatched + d.getQuantity();
            }
        }
        return finishedGood.getAvailableQuantity() - totalDispatched >=0;
    }

    @Override
    public Dispatch updateDispatch(Dispatch dispatch) {
        if(null == dispatch.getDispatchId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        dispatch.setDefaultValues();
        return dispatchRepository.saveAndFlush(dispatch);
    }

    @Override
    public List<Dispatch> getDispatchHistory(DispatchSearchCriteria searchCriteria) {
        return dispatchRepository.findDispatchByCriteria(searchCriteria.getFinishedGoodsId(),searchCriteria.getAddaId(),
                searchCriteria.getPatternId(), searchCriteria.getBrandId(),
                searchCriteria.getAddaNo(), searchCriteria.getDesignNo(),
                searchCriteria.getProductCd());
    }
}

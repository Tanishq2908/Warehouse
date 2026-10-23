import { Component, Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-stock-history',
  templateUrl: './stock-history.component.html',
  styleUrls: ['./stock-history.component.scss']
})
export class StockHistoryComponent implements OnDestroy {
  showSpinner:boolean = false;
  isTable:boolean = false;
  stockHistoryForm:any = FormGroup; 
  dateSelectorGroup!:FormGroup;
  displayStartDate:string = "N/A";
  displayEndDate:string = "N/A";
  viewClothData!: any[];
  isCalendarVisible:boolean = true;
  
  stockHistoryDetails: any = [];
  isStockHistoryById:boolean = false;
  subscriber:any;
  constructor(private formBuilder: FormBuilder, private commonService: CommonService){ 
    commonService.stockHistoryData.subscribe((val:any) => {
      this.stockHistoryDetails = val?.data;
      console.log(this.stockHistoryDetails);
    });
    this.subscriber = commonService.isStockHistoryClick.subscribe((val:any) => {
      this.isCalendarVisible = val;
      this.viewClothData = [];
    });
  }

  // constructor(private formBuilder: FormBuilder) { }

  ngOnInit(){    
    this.stockHistoryForm = this.formBuilder.group({
      uniqueId: ['', Validators.required],      
      currentFullTimestamp: ['']
    })  
    this.initializeForm();
    if(this.stockHistoryDetails?.stockId){
      this.isStockHistoryById = true;
      let stockObj:any  = {
        "stockId":this.stockHistoryDetails?.stockId
      }
      this.getStockHistory(stockObj);
    }
  }

  getStockHistory(stockObj:any) {
    this.showSpinner = true;
    this.commonService.getStockHistory(stockObj).subscribe((responseData)=>{
      this.viewClothData = [];
      this.showSpinner = false;
      this.isTable = true;
      let response = responseData.body;
      if (responseData.status === 200) {
        this.viewClothData = response;
      }
    });
  }

  initializeForm(){
    this.dateSelectorGroup = this.formBuilder.group({
      startDate:['', Validators.required],
      endDate:['', Validators.required]
    });
 
    this.dateSelectorGroup.controls['startDate'].valueChanges.subscribe(value => {
      console.log('start date changes');
      if(value){
        this.displayStartDate = value;
        // const endDate = moment(this.dateSelectorGroup.controls['endDate'].value);
        // const startDate = moment(value);
        // const difference = endDate.diff(startDate, 'days');
        // console.log(difference);
        // if(difference > 90){
        //   this.displayEndDate = value;
        // }
      }
      else{
        this.displayStartDate = "N/A"
      }
    });
 
    this.dateSelectorGroup.controls['endDate'].valueChanges.subscribe(value => {
      console.log('end date changes');
      
      if(value){
        const endDate = moment(value);
        const startDate = moment(this.dateSelectorGroup.controls['startDate'].value);
        const difference = endDate.diff(startDate, 'days');
        console.log(difference);
        if(difference < 90){
          this.displayEndDate = value;
        }else{
          setTimeout(()=>{
            this.dateSelectorGroup.reset();
          }, 200)
          
        }
        
      }
      else{
        this.displayEndDate = "N/A"
      }
    })
  }

  onSubmit() { 
    if (this.dateSelectorGroup.invalid) {
      return;
    }
    let formValue = this.dateSelectorGroup.value;
    let startDate = moment(formValue.startDate).format('YYYY-MM-DD');
    let endDate = moment(formValue.endDate).format('YYYY-MM-DD');
    let stockObj:any  = {
      "stockId":this.stockHistoryDetails?.stockId,
      "fromDate":startDate,
      "toDate":endDate,
    }
    this.getStockHistory(stockObj);
    console.log('Form values:', this.dateSelectorGroup.value);
    this.dateSelectorGroup.reset();
  }

  ngOnDestroy(): void {
    this.commonService.isStockHistoryClick.next(false);
    this.subscriber.unsubscribe();
  }


}

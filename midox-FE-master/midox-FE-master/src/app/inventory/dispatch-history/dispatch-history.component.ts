import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-dispatch-history',
  templateUrl: './dispatch-history.component.html',
  styleUrls: ['./dispatch-history.component.scss']
})
export class DispatchHistoryComponent {
  showSpinner:boolean = true;
  disptachDetails: any = [];
  constructor(private commonService: CommonService){
    commonService.dispatchData.subscribe((val:any) => {
      this.disptachDetails = val;
      console.log(this.disptachDetails);
      
    });
  }

  ngOnInit(){
    setTimeout(() => {
      this.showSpinner = false
    }, 1000);
  }

  viewFinishGoodsData: any = [
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      dispatch_date:"13 Sept 2022",
      avl_qty:1500
    },
];
}

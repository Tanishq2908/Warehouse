import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-finish-goods',
  templateUrl: './finish-goods.component.html',
  styleUrls: ['./finish-goods.component.scss']
})
export class FinishGoodsComponent {
  showSpinner:boolean = true;
  selectedRowsData:any = [];
  @ViewChild('grid', { static: false }) dataGrid!: DxDataGridComponent;
  //(click)="sendDispatchData(grid.instance.getSelectedRowsData())"
  constructor(private common: CommonService){

  }
  ngOnInit(){
    setTimeout(() => {
      this.showSpinner = false
    }, 1000);
  }

  getSelectedData(rowData:any) {
    // this.selectedRowsData = this.dataGrid.instance.getSelectedRowsData();
    // this.selectedRowsData = this.dataGrid.instance.getRowData(1);
    // let selectedRowsData1 = this.dataGrid.instance.getVisibleRows();
    // let temp = selectedRowsData1[index];
    console.log("rowData ", rowData);
    // console.log(temp?.values);
    
    // console.log(this.selectedRowsData);
    
    this.sendDispatchData(rowData)
    // ===== or when deferred selection is used =====
    // this.dataGrid.instance.getSelectedRowsData().then((selectedRowsData) => {
    //     // Your code goes here
    // });
  }

  viewFinishGoodsData: any = [
    {
      unique_id:"123",
      brand:"Ciana",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana2",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana3",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana4",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
    {
      unique_id:"123",
      brand:"Ciana5",
      product:"T-shirt",
      design:"C-1002",
      avl_qty:1500
    },
];

sendDispatchData(data:any){
  this.common.dispatchData.next(data);
}
}

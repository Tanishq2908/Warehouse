import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-view-adda',
  templateUrl: './view-adda.component.html',
  styleUrls: ['./view-adda.component.scss']
})
export class ViewAddaComponent {
  showSpinner:boolean = true;
  addaData:any;
  editAddaData:any = "";
  
  constructor(private commonService: CommonService){  }

  async ngOnInit(){
    this.addaData = await this.commonService.getDataFn1({}, "adda", "get-addas");
    this.showSpinner = false;
  }
  
  sendAddaAddMaterialdata(data:any){
    this.commonService.addMaterialData.next(data);
  }

  getSelectedData(rowData:any) {
    console.log("rowData ", rowData);   
    // this.sendAddaAddMaterialdata(rowData);
    this.editAddaData = rowData?.data;

  }

  dataFromAddAdda(data: any) {
    console.log(data);
    this.showSpinner = true;
    this.ngOnInit();    
  }

}

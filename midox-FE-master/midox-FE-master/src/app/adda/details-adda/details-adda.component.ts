import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details-adda',
  templateUrl: './details-adda.component.html',
  styleUrls: ['./details-adda.component.scss']
})

export class DetailsAddaComponent {
  showSpinner:boolean = true;
  detailAddaData:any;
  addaPatternsData:any;
  addaMaterialData:any;
  brandId:any;
  addaId:any;
  
  dialogTitle:string = "Adda";
  editAddaMaterialData:any = "";
  editAddaPatternData:any = "";
  
  constructor(private commonService: CommonService, private route: ActivatedRoute){  }

  async ngOnInit(){    
    await this.route.params.subscribe(async (params) => {
      this.addaId = params['addaId'];
      this.detailAddaData = await this.commonService.getDataFn1({"addaId":this.addaId}, "adda", "get-addas");
      this.brandId = this.detailAddaData[0].brandDetails.brandId;
      this.addaMaterialData = [...this.detailAddaData[0].addaMaterials];
      this.addaPatternsData = [...this.detailAddaData[0].addaPatterns];
      console.log("addaMaterialData ",this.addaMaterialData);
      console.log("addaPatternsData ",this.addaPatternsData);
      this.showSpinner = false;      
    });
    
  }

  
  getSelectedData(rowData:any) {
    console.log("rowData ", rowData);   
    // this.sendAddaAddMaterialdata(rowData);
    this.editAddaMaterialData = rowData?.data;

  }

  getSelectedData1(rowData:any) {
    console.log("rowData ", rowData);   
    // this.sendAddaAddMaterialdata(rowData);
    this.editAddaPatternData = rowData?.data;

  }

  // addMaterialFn(){
  //   console.log("addMaterialFn called");    
  // }

  // addPaternFn(){
  //   console.log("addPaternFn called");    
  // }
  
  async deleteMaterial(data1: any){
    console.log(data1.addaMaterialId);    
    this.showSpinner = true; 
    let temp = await this.commonService.deleteDataFn1({"addaMaterialId": data1.addaMaterialId}, "adda", "delete-material", this.dialogTitle);
    console.log(temp);
    if(temp){
      this.ngOnInit();
    }
    else{
      this.showSpinner = false;      
    }    
  }

  async deletePattern(data2: any){  
    this.showSpinner = true; 
    let temp = await this.commonService.deleteDataFn1({"patternId": data2.patternId}, "adda", "delete-pattern", this.dialogTitle);
    console.log(temp);
    if(temp){
      this.ngOnInit();
    }
    else{
      this.showSpinner = false;      
    }
  }

  // editMaterial(data3:any){
  //   console.log("Edit ",data3);
    
  // }

  // editPattern(data4:any){
  //   console.log("Edit ",data4);
    
  // }

  
  dataFromAddaMaterial(data: any) {
    console.log(data);
    this.showSpinner = true;
    this.ngOnInit();    
  }

  dataFromAddaPattern(data: any) {
    console.log(data);
    this.showSpinner = true;
    this.ngOnInit();    
  }


}

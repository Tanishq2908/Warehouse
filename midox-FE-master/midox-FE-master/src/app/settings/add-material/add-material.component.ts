import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { MsgDialogComponent } from 'src/app/shared/msg-dialog/msg-dialog.component';

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.scss']
})
export class AddMaterialComponent { 
  materialForm: FormGroup;
  materials: any = [];
  editedMaterialIndex: number | null = null;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  
  key: string = "MID_MAT";
  dialogTitle: string = "Material";
  dialogMessage!: string;  
  editObject:any = {};

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.materialForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  async ngOnInit(){
    // this.getMaterial();    
    this.materials = await this.common.getDataFn(this.key);
    this.showSpinner = false;
  }

  async onSubmit() {
    if (this.materialForm.invalid) {
      return;
    }   
    this.showSpinner = true; 
    this.deleteBtnDisabled = false;
    let inputVal = this.materialForm.value.name;
    console.log("inputVal ", inputVal);
    if(this.editedMaterialIndex !== null){
      //For update
      console.log("Update");
      console.log("editObject ", this.editObject);
      let obj = {    
        "entityCd": "",
        "parentEntityCd": null,
        "masterCd": "MID_MAT",
        "displayValue": "",
        "entityId": 0
      }
      obj.entityCd = this.editObject?.entityCd;
      obj.entityId = this.editObject?.entityId;
      obj.displayValue = inputVal;
      // this.editMaterial(obj); 
      this.materials = await this.common.editDataFn(obj,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    else{
      let obj = {    
        "parentEntityCd": null,
        "masterCd": "MID_MAT",
        "displayValue": ""
      }
      obj.displayValue = inputVal;
      let data = [obj]
      console.log(data);  
      // this.addMaterial(data);     

      // Post API call
      this.materials = await this.common.addDataFn(data,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    // this.showSpinner = true;    
    this.editedMaterialIndex = null;
    this.materialForm.reset();
  }

  edit(data: any, index: number) {
    this.deleteBtnDisabled = true; 
    this.editObject = data;
    this.editedMaterialIndex = index;
    this.materialForm.patchValue({
      name: data.displayValue
    });
  }

  async delete(apiData: any) {    
    this.showSpinner = true; 
    let entityCd = apiData?.entityCd;
    // this.deleteMaterial(entityCd);

    // Delete API call
    this.materials = await this.common.deleteDataFn(entityCd,this.dialogTitle,this.key);
    this.showSpinner = false;
  }  

  //API call

  // getMaterial(){
  //   console.log("API Call");    
  //   // this.common.getAllSettingsData("MID_MAT").subscribe((responseData:any)=>{
  //   //   let response = responseData?.body;
  //   //   if (responseData.status === 200) {
  //   //     this.materials = response;
  //   //     console.log(response);        
  //   //   }
  //   //   else{
  //   //     console.log("Error code: ",responseData?.status);        
  //   //   }
  //   //   this.showSpinner = false;
  //   // });
  // }
  
  // Delete
  
  // deleteMaterial(entityCd:any){
  //   console.log("API Call");    
  //   this.common.deleteAllSettingsData(entityCd).subscribe(async (responseData:any)=>{
  //     // let response = responseData?.body;
  //     console.log(responseData);        
  //     if (responseData.status === 200) {
  //       // this.getMaterial();    
        
  //       //Get API Calling
  //       this.materials = await this.common.getDataFn("MID_MAT");
  //       this.showSpinner = false;
  //       this.dialogMessage = 'Material delete successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Material failed to delete.';        
  //     }
  //     this.showSpinner = false; 
      
  //     // To open modal
  //     this.common.openDialog(this.dialogTitle,this.dialogMessage);
  //   });
  // }

  // Add
  // addMaterial(data:any){
  //   console.log("Post API Call");
  //   this.common.addAllSettingsData(data).subscribe(async (responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 201) {
  //       console.log(response);       
  //       // this.getMaterial();     

  //       //Get API calling
  //       this.materials = await this.common.getDataFn("MID_MAT");
  //       this.showSpinner = false;        
  //       this.dialogMessage = 'Material saved successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);    
  //       this.dialogMessage = 'Material failed to save.'; 
  //     }      
  //     this.showSpinner = false;  

  //     // To open modal
  //     this.common.openDialog(this.dialogTitle,this.dialogMessage);
  //   });
  // }

  // Edit
  // editMaterial(data:any){
  //   console.log("Edit API Call");
  //   this.common.editAllSettingsData(data).subscribe(async (responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 200) {
  //       console.log(response);       
  //       // this.getMaterial();   

  //       //Get API Calling
  //       this.materials = await this.common.getDataFn("MID_MAT");
  //       this.showSpinner = false;
  //       this.dialogMessage = 'Material update successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Material failed to update.';        
  //     }
  //     this.showSpinner = false;  

  //     // To open modal
  //     this.common.openDialog(this.dialogTitle,this.dialogMessage);
  //   });
  // }

}

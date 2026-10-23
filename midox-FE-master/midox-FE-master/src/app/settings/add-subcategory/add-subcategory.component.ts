import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-subcategory',
  templateUrl: './add-subcategory.component.html',
  styleUrls: ['./add-subcategory.component.scss']
})
export class AddSubcategoryComponent {

  subCategoryForm: FormGroup;
  subCategoryArray: any[] = [];
  editedSubCategoryIndex: number | null = null;
  deleteBtnDisabled: boolean = false;
  dropDownValue:any = [];
  showSpinner:boolean = true;
  showSpinnerTable:boolean = true;
  
  dialogTitle: string = "Sub Category";
  dialogMessage!: string;  
  editObject:any = {};
  key:string = "MID_SUB";
  key2:string = "MID_MAT";

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.subCategoryForm = this.formBuilder.group({
      material: ['', Validators.required],
      name: ['', Validators.required]
    });
  }

  async ngOnInit(){
    // this.getMaterial();
    
    this.dropDownValue = await this.common.getDataFn(this.key2);
    this.showSpinner = false;
    this.subCategoryArray = await this.common.getDataFn(this.key);
    // this.getSubCategory();    
    this.showSpinnerTable = false;
  }

  async onSubmit() {
    if (this.subCategoryForm.invalid) {
      return;
    }    
    this.showSpinner = true;
    const selectControl = this.subCategoryForm.get('material');
    selectControl?.enable();
    console.log(this.subCategoryForm.value);    
    
    this.deleteBtnDisabled = false;
    let inputVal = this.subCategoryForm?.value?.name;
    let materialVal = this.subCategoryForm?.value?.material;
    console.log("inputVal ", inputVal);
    if(this.editedSubCategoryIndex !== null){
      //For update
      console.log("Update");
      console.log("editObject ", this.editObject);
      let obj = {    
        "entityCd": "UNIT_KG8",
        "parentEntityCd": null,
        "masterCd": "MID_SUB",
        "displayValue": "Kg8",
        "entityId": 0
      }
      obj.entityCd = this.editObject?.entityCd;
      obj.parentEntityCd = this.editObject?.parentEntityCd;
      obj.entityId = this.editObject?.entityId;
      obj.displayValue = inputVal;
      // console.log("Obj ", obj);
      
      // this.editSubCategory(obj);
      
      this.subCategoryArray = await this.common.editDataFn(obj,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    else{
      // let currTime = Date.now();
      let obj = {    
        "parentEntityCd": "",
        "masterCd": "MID_SUB",
        "displayValue": ""
      }
      // obj.entityCd = "SUB_"+currTime;
      obj.parentEntityCd = materialVal;
      obj.displayValue = inputVal;
      let data = [obj]
      console.log(data);    

      // this.addSubCategory(data);      
      // Post API call
      this.subCategoryArray = await this.common.addDataFn(data,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    // this.showSpinner = true;
    
    this.editedSubCategoryIndex = null;
    this.subCategoryForm.reset();
  }

  edit(data: any, index: number) {
    this.deleteBtnDisabled = true;
    this.editObject = data;
    this.editedSubCategoryIndex = index;
    this.subCategoryForm.patchValue({
      material: data.parentEntityCd,
      name: data.displayValue
    });
    
    const selectControl = this.subCategoryForm.get('material');
    selectControl?.disable();
  }

  async delete(apiData: any) {
    
    this.showSpinner = true; 
    let entityCd = apiData?.entityCd;
    // this.deleteSubCategory(entityCd);
    
    // Delete API call
    this.subCategoryArray = await this.common.deleteDataFn(entityCd,this.dialogTitle,this.key);
    this.showSpinner = false;
  }

  //API Call Get material
  // getMaterial(){
  //   console.log("API Call");    
  //   this.common.getAllSettingsData("MID_MAT").subscribe((responseData:any)=>{
  //     let response = responseData?.body;
  //     if (responseData.status === 200) {
  //       this.dropDownValue = response;        
  //       console.log(response);        
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);        
  //     }
  //     this.showSpinner = false;
  //   });
  // }

  //API Call Get sub category
  // getSubCategory(){
  //   console.log("API Call");    
  //   this.common.getAllSettingsData("MID_SUB").subscribe((responseData:any)=>{
  //     let response = responseData?.body;
  //     if (responseData.status === 200) {
  //       this.subCategoryArray = response;        
  //       console.log(response);        
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);        
  //     }
  //     this.showSpinnerTable = false;
  //   });
  // }
  
  // Delete
  // deleteSubCategory(entityCd:any){
  //   console.log("API Call");    
  //   this.common.deleteAllSettingsData(entityCd).subscribe((responseData:any)=>{
  //     // let response = responseData?.body;
  //     console.log(responseData);        
  //     if (responseData.status === 200) {
  //       this.getSubCategory();
  //       this.dialogMessage = 'Sub Category delete successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Sub Category failed to delete.';        
  //     }
  //     this.showSpinner = false; 

  //     // To open modal
  //     this.common.openDialog(this.dialogTitle,this.dialogMessage);
  //   });
  // }

  // Add
  // addSubCategory(data:any){
  //   console.log("Post API Call");
  //   this.common.addAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 201) {
  //       console.log(response);       
  //       this.getSubCategory();    
        
  //       this.dialogMessage = 'Sub Category saved successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);    
  //       this.dialogMessage = 'Sub Category failed to save.'; 
  //     }      
  //     this.showSpinner = false;  

  //     // To open modal
  //     this.common.openDialog(this.dialogTitle,this.dialogMessage);
  //   });
  // }

  // Edit
  // editSubCategory(data:any){
  //   console.log("Edit API Call");
  //   this.common.editAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 200) {
  //       console.log(response);       
  //       this.getSubCategory();   
  //       this.dialogMessage = 'Sub Category update successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Sub Category failed to update.';        
  //     }
  //     this.showSpinner = false;  

  //     // To open modal
  //     this.common.openDialog(this.dialogTitle,this.dialogMessage);
  //   });
  // }

}

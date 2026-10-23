import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { MsgDialogComponent } from 'src/app/shared/msg-dialog/msg-dialog.component';

@Component({
  selector: 'app-add-measurement',
  templateUrl: './add-measurement.component.html',
  styleUrls: ['./add-measurement.component.scss']
})
export class AddMeasurementComponent {
  
  measurementTypeForm: FormGroup;
  measurementTypeData: any[] = [];
  measurementTypeArray: any[] = [];
  editedMeasurementTypeIndex: number | null = null;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  editObject:any = {};
  
  dialogTitle: string = "Measurement Unit";
  dialogMessage!: string;
  key: string = "MID_UNIT";


  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.measurementTypeForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  async ngOnInit(){
    // this.getMeasrurementType();
     
    this.measurementTypeArray = await this.common.getDataFn(this.key);
    this.showSpinner = false;
  }

  async onSubmit() {
    if (this.measurementTypeForm.invalid) {
      return;
    }
    this.showSpinner = true;    
    this.deleteBtnDisabled = false;
    let inputVal = this.measurementTypeForm.value.name;
    console.log("inputVal ", inputVal);
    if(this.editedMeasurementTypeIndex !== null){
      //For update
      console.log("Update");
      console.log("editObject ", this.editObject);
      let obj = {    
        "entityCd": "UNIT_KG8",
        "parentEntityCd": null,
        "masterCd": "MID_UNIT",
        "displayValue": "Kg8",
        "entityId": 0
      }
      obj.entityCd = this.editObject?.entityCd;
      obj.entityId = this.editObject?.entityId;
      obj.displayValue = inputVal;
      // console.log("Obj ", obj);
      
      // this.editMeasurementType(obj);
      
      this.measurementTypeArray = await this.common.editDataFn(obj,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    else{
      // let currTime = Date.now();
      let obj = {    
        "parentEntityCd": null,
        "masterCd": "MID_UNIT",
        "displayValue": "Kg8"
      }
      // obj.entityCd = "UNIT_"+currTime;
      obj.displayValue = inputVal;
      let data = [obj]
      console.log(data);    

      // this.addMeasurementType(data);
      
      // Post API call
      this.measurementTypeArray = await this.common.addDataFn(data,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    // this.showSpinner = true;
    
    this.editedMeasurementTypeIndex = null;
    this.measurementTypeForm.reset();
  }

  edit(data: any, index: number) {
    this.deleteBtnDisabled = true;
    this.editObject = data;
    this.editedMeasurementTypeIndex = index;
    this.measurementTypeForm.patchValue({
      name: data.displayValue
    });
  }

  async delete(apiData: any) {
    // this.measurementTypeData.splice(index, 1);
      this.showSpinner = true; 
    let entityCd = apiData?.entityCd;
    // this.deleteMeasurementType(entityCd);
    
    // Delete API call
    this.measurementTypeArray = await this.common.deleteDataFn(entityCd,this.dialogTitle,this.key);
    this.showSpinner = false;
  }

  //API Call

  // Get
  // getMeasrurementType(){    
  //   this.common.getAllSettingsData("MID_UNIT").subscribe((responseData:any)=>{
  //     let response = responseData?.body;
  //     if (responseData.status === 200) {
  //       this.measurementTypeArray = response;
  //       console.log(response);    
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);        
  //     }
  //     this.showSpinner = false;
  //   });
  // }

  // Delete
  // deleteMeasurementType(entityCd:any){
  //   console.log("API Call");    
  //   this.common.deleteAllSettingsData(entityCd).subscribe((responseData:any)=>{
  //     // let response = responseData?.body;
  //     console.log(responseData);        
  //     if (responseData.status === 200) {
  //       // this.materials = response;
  //       // console.log(response);        
        
  //       this.getMeasrurementType();
  //       this.dialogTitle = 'Measurement Unit';
  //       this.dialogMessage = 'Measurement unit delete successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogTitle = 'Measurement Unit';
  //       this.dialogMessage = 'Measurement unit failed to delete.';        
  //     }
  //     this.showSpinner = false; 
  //     this.openDialog();
  //   });
  // }

  // Add
  // addMeasurementType(data:any){
  //   console.log("Post API Call");
  //   this.common.addAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 201) {
  //       console.log(response);       
  //       this.getMeasrurementType();    
        
  //       this.dialogTitle = 'Measurement Unit';
  //       this.dialogMessage = 'Measurement unit saved successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);      
        
  //       this.dialogTitle = 'Measurement Unit';
  //       this.dialogMessage = 'Measurement unit failed to save.'; 
  //     }      
  //     this.showSpinner = false;  
  //     this.openDialog();
  //   });
  // }

  // Edit
  // editMeasurementType(data:any){
  //   console.log("Edit API Call");
  //   this.common.editAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 200) {
  //       console.log(response);       
  //       this.getMeasrurementType();   
        
  //       this.dialogTitle = 'Measurement Unit';
  //       this.dialogMessage = 'Measurement unit update successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogTitle = 'Measurement Unit';
  //       this.dialogMessage = 'Measurement unit failed to update.';        
  //     }
  //     this.showSpinner = false;  
  //     this.openDialog();
  //   });
  // }

  //Modal 
  // openDialog(): void {
  //   const dialogRef = this.dialog.open(MsgDialogComponent, {
  //     width: '400px',
  //     data: { title: this.dialogTitle, message: this.dialogMessage }
  //   });

  //   dialogRef.afterClosed().subscribe((result:any) => {
  //     console.log('The dialog was closed');
  //   });
  // }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { MsgDialogComponent } from 'src/app/shared/msg-dialog/msg-dialog.component';

@Component({
  selector: 'app-add-color',
  templateUrl: './add-color.component.html',
  styleUrls: ['./add-color.component.scss']
})
export class AddColorComponent {
  colorForm!: FormGroup;
  // processData: any[] = [];
  colorArray: any[] = [];
  editedColorIndex: number | null = null;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  
  key: string = "MID_COL";
  dialogTitle: string = "Color";
  dialogMessage!: string;   
  editObject:any = {};

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.colorForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  async ngOnInit(){
    // this.getColor();     
    this.colorArray = await this.common.getDataFn(this.key);
    this.showSpinner = false;
  }
  
  async onSubmit() {
    if (this.colorForm.invalid) {
      return;
    }    
    this.showSpinner = true;
    
    this.deleteBtnDisabled = false;
    let inputVal = this.colorForm.value.name;
    console.log("inputVal ", inputVal);
    if(this.editedColorIndex !== null){
      //For update
      console.log("Update");
      console.log("editObject ", this.editObject);
      let obj = {    
        "entityCd": "UNIT_KG8",
        "parentEntityCd": null,
        "masterCd": "MID_COL",
        "displayValue": "Kg8",
        "entityId": 0
      }
      obj.entityCd = this.editObject?.entityCd;
      obj.entityId = this.editObject?.entityId;
      obj.displayValue = inputVal;
      // console.log("Obj ", obj);
      
      // this.editColor(obj);      
      this.colorArray = await this.common.editDataFn(obj,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    else{
      // let currTime = Date.now();
      let obj = {    
        "parentEntityCd": null,
        "masterCd": "MID_COL",
        "displayValue": "Kg8"
      }
      // obj.entityCd = "COL_"+currTime;
      obj.displayValue = inputVal;
      let data = [obj]
      console.log(data);    

      // this.addColor(data);
      
      // Post API call
      this.colorArray = await this.common.addDataFn(data,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    // this.showSpinner = true;
    
    this.editedColorIndex = null;
    this.colorForm.reset();
  }

  edit(data: any, index: number) {
    this.deleteBtnDisabled = true;
    this.editObject = data;
    this.editedColorIndex = index;
    this.colorForm.patchValue({
      name: data.displayValue
    });
  }

  async delete(apiData: any) {    
    this.showSpinner = true; 
    let entityCd = apiData?.entityCd;
    // this.deleteColor(entityCd);
    
    // Delete API call
    this.colorArray = await this.common.deleteDataFn(entityCd,this.dialogTitle,this.key);
    this.showSpinner = false;
  }

  //API Call
  // getColor(){
  //   console.log("API Call");
    
  //   this.common.getAllSettingsData("MID_COL").subscribe((responseData:any)=>{
  //     let response = responseData?.body;
  //     if (responseData.status === 200) {
  //       this.colorArray = response;
  //       console.log(response);        
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);        
  //     }
  //     this.showSpinner = false;
  //   });
  // }
  
  // Delete
  // deleteColor(entityCd:any){
  //   console.log("API Call");    
  //   this.common.deleteAllSettingsData(entityCd).subscribe((responseData:any)=>{
  //     // let response = responseData?.body;
  //     console.log(responseData);        
  //     if (responseData.status === 200) {
  //       this.getColor();
  //       this.dialogMessage = 'Colour delete successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Colour failed to delete.';        
  //     }
  //     this.showSpinner = false; 
  //     this.openDialog();
  //   });
  // }

  // Add
  // addColor(data:any){
  //   console.log("Post API Call");
  //   this.common.addAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 201) {
  //       console.log(response);       
  //       this.getColor();    
        
  //       this.dialogMessage = 'Colour saved successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);    
  //       this.dialogMessage = 'Colour failed to save.'; 
  //     }      
  //     this.showSpinner = false;  
  //     this.openDialog();
  //   });
  // }

  // Edit
  // editColor(data:any){
  //   console.log("Edit API Call");
  //   this.common.editAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 200) {
  //       console.log(response);       
  //       this.getColor();   
  //       this.dialogMessage = 'Colour update successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Colour failed to update.';        
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

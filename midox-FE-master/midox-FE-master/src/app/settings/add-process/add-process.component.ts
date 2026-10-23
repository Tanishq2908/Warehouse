import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { MsgDialogComponent } from 'src/app/shared/msg-dialog/msg-dialog.component';

@Component({
  selector: 'app-add-process',
  templateUrl: './add-process.component.html',
  styleUrls: ['./add-process.component.scss']
})
export class AddProcessComponent {

  processForm: FormGroup;
  processData: any[] = [];
  processArray: any[] = [];
  editedProcessIndex: number | null = null;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  
  dialogTitle: string = "Process";
  key: string = "MID_PROC";
  dialogMessage!: string;   
  editObject:any = {};

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.processForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  async ngOnInit(){
    // this.getProcess(); 
     
    this.processArray = await this.common.getDataFn(this.key);
    this.showSpinner = false;
  }
  
  async onSubmit() {
    if (this.processForm.invalid) {
      return;
    }    
    this.showSpinner = true;
    this.deleteBtnDisabled = false;
    let inputVal = this.processForm.value.name;
    console.log("inputVal ", inputVal);
    if(this.editedProcessIndex !== null){
      //For update
      console.log("Update");
      console.log("editObject ", this.editObject);
      let obj = {    
        "entityCd": "UNIT_KG8",
        "parentEntityCd": null,
        "masterCd": "MID_PROC",
        "displayValue": "Kg8",
        "entityId": 0
      }
      obj.entityCd = this.editObject?.entityCd;
      obj.entityId = this.editObject?.entityId;
      obj.displayValue = inputVal;
      // console.log("Obj ", obj);
      
      // this.editProcess(obj);
      
      this.processArray = await this.common.editDataFn(obj,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    else{
      // let currTime = Date.now();
      let obj = {    
        "parentEntityCd": null,
        "masterCd": "MID_PROC",
        "displayValue": "Kg8"
      }
      // obj.entityCd = "PROC_"+currTime;
      obj.displayValue = inputVal;
      let data = [obj]
      console.log(data);    

      // this.addProcess(data);
      
      // Post API call
      this.processArray = await this.common.addDataFn(data,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    // this.showSpinner = true;
    
    this.editedProcessIndex = null;
    this.processForm.reset();
  }

  edit(data: any, index: number) {
    this.deleteBtnDisabled = true;
    this.editObject = data;
    this.editedProcessIndex = index;
    this.processForm.patchValue({
      name: data.displayValue
    });
  }

  async delete(apiData: any) {    
    this.showSpinner = true; 
    let entityCd = apiData?.entityCd;
    // this.deleteProcess(entityCd);
    
    // Delete API call
    this.processArray = await this.common.deleteDataFn(entityCd,this.dialogTitle,this.key);
    this.showSpinner = false;
  }

  //API Call
  // getProcess(){
  //   console.log("API Call");
    
  //   this.common.getAllSettingsData("MID_PROC").subscribe((responseData:any)=>{
  //     let response = responseData?.body;
  //     if (responseData.status === 200) {
  //       this.processArray = response;
  //       console.log(response);        
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);        
  //     }
  //     this.showSpinner = false;
  //   });
  // }
  
  // Delete
  // deleteProcess(entityCd:any){
  //   console.log("API Call");    
  //   this.common.deleteAllSettingsData(entityCd).subscribe((responseData:any)=>{
  //     // let response = responseData?.body;
  //     console.log(responseData);        
  //     if (responseData.status === 200) {
  //       this.getProcess();
  //       this.dialogMessage = 'Process delete successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Process failed to delete.';        
  //     }
  //     this.showSpinner = false; 
  //     this.openDialog();
  //   });
  // }

  // Add
  // addProcess(data:any){
  //   console.log("Post API Call");
  //   this.common.addAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 201) {
  //       console.log(response);       
  //       this.getProcess();    
        
  //       this.dialogMessage = 'Process saved successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);    
  //       this.dialogMessage = 'Process failed to save.'; 
  //     }      
  //     this.showSpinner = false;  
  //     this.openDialog();
  //   });
  // }

  // Edit
  // editProcess(data:any){
  //   console.log("Edit API Call");
  //   this.common.editAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 200) {
  //       console.log(response);       
  //       this.getProcess();   
  //       this.dialogMessage = 'Process update successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Process failed to update.';        
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

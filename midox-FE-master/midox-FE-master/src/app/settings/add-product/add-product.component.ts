import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { MsgDialogComponent } from 'src/app/shared/msg-dialog/msg-dialog.component';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent {

  productForm: FormGroup;
  productData: any[] = [];
  productArray: any[] = [];
  editedProductIndex: number | null = null;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  
  dialogTitle: string = "Product";
  key: string = "MID_PROD";
  dialogMessage!: string;  
  editObject:any = {};

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  async ngOnInit(){
    // this.getProduct();
     
    this.productArray = await this.common.getDataFn(this.key);
    this.showSpinner = false;
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      return;
    }    
    this.showSpinner = true;
    this.deleteBtnDisabled = false;
    let inputVal = this.productForm.value.name;
    console.log("inputVal ", inputVal);
    if(this.editedProductIndex !== null){
      //For update
      console.log("Update");
      console.log("editObject ", this.editObject);
      let obj = {    
        "entityCd": "UNIT_KG8",
        "parentEntityCd": null,
        "masterCd": "MID_PROD",
        "displayValue": "Kg8",
        "entityId": 0
      }
      obj.entityCd = this.editObject?.entityCd;
      obj.entityId = this.editObject?.entityId;
      obj.displayValue = inputVal;
      // console.log("Obj ", obj);
      
      // this.editProduct(obj);
      
      this.productArray = await this.common.editDataFn(obj,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    else{
      // let currTime = Date.now();
      let obj = {    
        "parentEntityCd": null,
        "masterCd": "MID_PROD",
        "displayValue": "Kg8"
      }
      // obj.entityCd = "PROD_"+currTime;
      obj.displayValue = inputVal;
      let data = [obj]
      console.log(data);    

      // this.addProduct(data);
      
      // Post API call
      this.productArray = await this.common.addDataFn(data,this.dialogTitle,this.key);
      this.showSpinner = false;
    }
    // this.showSpinner = true;
    
    this.editedProductIndex = null;
    this.productForm.reset();
  }

  edit(data: any, index: number) {
    this.deleteBtnDisabled = true;    
    this.editObject = data;
    this.editedProductIndex = index;
    this.productForm.patchValue({
      name: data.displayValue
    });
  }

  async delete(apiData: any) {
    // this.productData.splice(index, 1);
    
    this.showSpinner = true; 
    let entityCd = apiData?.entityCd;
    // this.deleteProduct(entityCd);
    
    // Delete API call
    this.productArray = await this.common.deleteDataFn(entityCd,this.dialogTitle,this.key);
    this.showSpinner = false;
  }

  //API Call
  // getProduct(){
  //   console.log("API Call");
    
  //   this.common.getAllSettingsData("MID_PROD").subscribe((responseData:any)=>{
  //     let response = responseData?.body;
  //     if (responseData.status === 200) {
  //       this.productArray = response;
  //       console.log(response);       
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);         
  //     }
  //     this.showSpinner = false;
  //   });
  // }

  // Delete
  // deleteProduct(entityCd:any){
  //   console.log("API Call");    
  //   this.common.deleteAllSettingsData(entityCd).subscribe((responseData:any)=>{
  //     // let response = responseData?.body;
  //     console.log(responseData);        
  //     if (responseData.status === 200) {
  //       this.getProduct();
  //       this.dialogMessage = 'Product delete successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Product failed to delete.';        
  //     }
  //     this.showSpinner = false; 
  //     this.openDialog();
  //   });
  // }

  // Add
  // addProduct(data:any){
  //   console.log("Post API Call");
  //   this.common.addAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 201) {
  //       console.log(response);       
  //       this.getProduct();    
        
  //       this.dialogMessage = 'Product saved successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);    
  //       this.dialogMessage = 'Product failed to save.'; 
  //     }      
  //     this.showSpinner = false;  
  //     this.openDialog();
  //   });
  // }

  // Edit
  // editProduct(data:any){
  //   console.log("Edit API Call");
  //   this.common.editAllSettingsData(data).subscribe((responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 200) {
  //       console.log(response);       
  //       this.getProduct();   
  //       this.dialogMessage = 'Product update successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status); 
  //       this.dialogMessage = 'Product failed to update.';        
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

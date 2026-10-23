import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.scss']
})
export class AddSupplierComponent {
  suppliers: any[] = [];
  dropDownValue:any = ["ACTIVE","INACTIVE"]
  supplierForm!: FormGroup;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  editedMaterialIndex: number | null = null;
  dialogTitle: string = "Supplier";
  dialogMessage!: string;  
  supplierId:any = "";

  constructor(private fb: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.initForm();
  }

  initForm(): void {
    this.supplierForm = this.fb.group({
      supplierName: ['', [Validators.required, Validators.minLength(3)]],
      contactPerson: ['', [Validators.required, Validators.minLength(3)]],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10)]],
      supplierUID: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]{15}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  async ngOnInit(){
    this.getSupplier({});
  }  

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      return;
    }
    
    this.showSpinner = true;
    console.log('Form values:', this.supplierForm.value);    
    
    if(this.editedMaterialIndex !== null){
      //For update
      let tempObj = this.supplierForm?.value;
      tempObj.supplierId = this.supplierId;
      console.log(tempObj);
      this.addEditSupplierApi(tempObj,"supplier","edit");     
    }
    else{
      // For add -  Post API call
      this.addEditSupplierApi(this.supplierForm?.value, "supplier", "add");      
    }
    
    this.deleteBtnDisabled = false;
    this.editedMaterialIndex = null;
    this.supplierForm.reset();
  }

  getSupplier(data:any){
    this.common.addSupplierOrBrandSettingsData(data,"supplier","get-suppliers").subscribe(async (responseData:any)=>{
      let response = responseData?.body;   
      if (responseData.status === 200) {
        console.log(response);     
        this.suppliers = response;
      }
      else{
        console.log("Error code: ",responseData?.status);  
      }      
      this.showSpinner = false;  
    });
  }

  addEditSupplierApi(data:any, key1:string, key2: string){
    this.common.addSupplierOrBrandSettingsData(data,key1,key2).subscribe(async (responseData:any)=>{
      let response = responseData?.body;   
      if (responseData.status === 201) {
        console.log(response);    
        this.getSupplier({});    
        this.dialogMessage = `Supplier ${key2} successfully.`; 
      }
      else{
        console.log("Error code: ",responseData?.status);    
        this.dialogMessage = `Supplier failed to ${key2}.`; 
      }      
      this.showSpinner = false;  
      // To open modal
      this.common.openDialog(this.dialogTitle,this.dialogMessage);
    });
  }

  edit(supplier: any, index:number): void {    
    this.deleteBtnDisabled = true;
    this.editedMaterialIndex = index;
    console.log("supplier ",supplier);
    this.supplierId = supplier?.supplierId;
    
    this.supplierForm.patchValue({
      supplierName: supplier.supplierName,
      contactPerson: supplier.contactPerson,
      contactNo: supplier.contactNo,
      supplierUID: supplier.supplierUID,
      email: supplier.email,
      address: supplier.address,
      status: supplier.status,
      description: supplier.description
    });
  }

  // addSupplier(data:any){
  //   this.common.addSupplierOrBrandSettingsData(data,"supplier","add").subscribe(async (responseData:any)=>{
  //     let response = responseData?.body;   
  //     if (responseData.status === 201) {
  //       console.log(response);    
  //       this.getSupplier({});    
  //       this.dialogMessage = 'Supplier saved successfully.'; 
  //     }
  //     else{
  //       console.log("Error code: ",responseData?.status);    
  //       this.dialogMessage = 'Supplier failed to save.'; 
  //     }      
  //     this.showSpinner = false;  
  //     // To open modal
  //     this.common.openDialog(this.dialogTitle,this.dialogMessage);
  //   });
  // }

  

  // deleteSupplier(supplier: any): void {
  //   // Implement the delete functionality here
  //   console.log('Deleting supplier:', supplier);
  //   const index = this.suppliers.indexOf(supplier);
  //   if (index !== -1) {
  //     this.suppliers.splice(index, 1);
  //   }
  // }

}

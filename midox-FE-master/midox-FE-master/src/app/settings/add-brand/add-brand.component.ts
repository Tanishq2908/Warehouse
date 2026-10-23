import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-brand',
  templateUrl: './add-brand.component.html',
  styleUrls: ['./add-brand.component.scss']
})

export class AddBrandComponent {
  brands: any[] = [];
  dropDownValue:any = ["ACTIVE","INACTIVE"];
  brandForm!: FormGroup;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  editedMaterialIndex: number | null = null;
  dialogTitle: string = "Brand";
  dialogMessage!: string;  
  brandId:any = "";

  constructor(private fb: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.initForm();
  }

  initForm(): void {
    this.brandForm = this.fb.group({
      brandName: ['', [Validators.required, Validators.minLength(3)]],
      contactPerson: ['', [Validators.required, Validators.minLength(3)]],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10)]],
      brandUID: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]{15}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  async ngOnInit(){
    this.getBrand({});
  }  

  onSubmit(): void {
    if (this.brandForm.invalid) {
      return;
    }
    
    this.showSpinner = true;
    console.log('Form values:', this.brandForm.value);    
    
    if(this.editedMaterialIndex !== null){
      //For update
      let tempObj = this.brandForm?.value;
      tempObj.brandId = this.brandId;
      console.log(tempObj);
      this.addEditBrandApi(tempObj,"brand","edit");     
    }
    else{
      // For add -  Post API call
      this.addEditBrandApi(this.brandForm?.value, "brand", "add");      
    }
    
    this.deleteBtnDisabled = false;
    this.editedMaterialIndex = null;
    this.brandForm.reset();
  }

  getBrand(data:any){
    this.common.addSupplierOrBrandSettingsData(data,"brand","get-brands").subscribe(async (responseData:any)=>{
      let response = responseData?.body;   
      if (responseData.status === 200) {
        console.log(response);     
        this.brands = response;
      }
      else{
        console.log("Error code: ",responseData?.status);  
      }      
      this.showSpinner = false;  
    });
  }

  addEditBrandApi(data:any, key1:string, key2: string){
    this.common.addSupplierOrBrandSettingsData(data,key1,key2).subscribe(async (responseData:any)=>{
      let response = responseData?.body;   
      if (responseData.status === 201) {
        console.log(response);    
        this.getBrand({});    
        this.dialogMessage = `${this.dialogTitle} ${key2} successfully.`; 
      }
      else{
        console.log("Error code: ",responseData?.status);    
        this.dialogMessage = `${this.dialogTitle} failed to ${key2}.`; 
      }      
      this.showSpinner = false;  
      // To open modal
      this.common.openDialog(this.dialogTitle,this.dialogMessage);
    });
  }

  edit(editData: any, index:number): void {    
    this.deleteBtnDisabled = true;
    this.editedMaterialIndex = index;
    console.log("brand ",editData);
    this.brandId = editData?.brandId;
    
    this.brandForm.patchValue({
      brandName: editData.brandName,
      contactPerson: editData.contactPerson,
      contactNo: editData.contactNo,
      brandUID: editData.brandUID,
      email: editData.email,
      address: editData.address,
      status: editData.status,
      description: editData.description
    });
  }

}

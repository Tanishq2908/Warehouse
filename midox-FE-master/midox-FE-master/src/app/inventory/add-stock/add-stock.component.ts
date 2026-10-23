import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash'; 
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { MsgDialogComponent } from 'src/app/shared/msg-dialog/msg-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.scss']
})
export class AddStockComponent implements OnInit {
  showSpinner:boolean = false;
  userForm:any = FormGroup;  
  addStocksList:any = [];
  //supplierData:any=["Midox","Ciana"];
  //materialData:any=["Cloths","Accessories"];
  //subCategoryData:any=["PC hosiery sinkar fabric","CO hosiery Matty fabric","Cotton hosiery sinkar fabric"];
  showClothData:boolean = true;
  // subCategoryClothData:any=["Sinkar fabric","Matty fabric","Wool","Cotton"];
  // subCategoryAccessoryData:any=["Button","Dhaga"];
  // measurementTypeData:any=["KG","Meter"];
  // colorFabricCodeData:any=["m-1516","C-2303"];
  editStockForm:number|null = null;
  dialogTitle!: string;
  dialogMessage!: string;

  supplierData:any[] = [{name: 'Midox', id: '1'}];
  materialData!:any[];
  //subCategoryData!:any[];
  colorFabricCodeData!:any[];
  measurementTypeData!:any[];
  subCategoryClothData!:any[];
  subCategoryAccessoryData!:any[];

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog, public route: Router) { }

  ngOnInit() {
    this.getAllSettingData();
    this.userForm = this.formBuilder.group({
      billNumber: ['', [Validators.required, Validators.minLength(3)]],
      packingSlipNumber: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      currentFullTimestamp: [''],
      supplier: ['', Validators.required],
      material: ['', Validators.required],
      subCategory: ['', Validators.required],
      colorFabricCode: ['', Validators.required],
      measurementType: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      amount: ['', Validators.required],
    });
  }

  getAllSettingData(){
    this.common.getAllSettingsData("MID_MAT").subscribe((responseData)=>{
      let response = responseData.body;
      if (responseData.status === 200) {
        this.materialData = response;
      }
    });
    this.common.getAllSettingsData("MID_SUB").subscribe((responseData)=>{
      let response = responseData.body;
      if (responseData.status === 200) {
        this.subCategoryAccessoryData = response?.filter((x:any)=>x.parentEntityCd == "MAT_ACC");
        this.subCategoryClothData = response?.filter((x:any)=>x.parentEntityCd == "MAT_CLOTH");
      }
    });
    this.common.getAllSettingsData("MID_CFC").subscribe((responseData)=>{
      let response = responseData.body;
      if (responseData.status === 200) {
        this.colorFabricCodeData = response;
      }
    });
    this.common.getAllSettingsData("MID_UNIT").subscribe((responseData)=>{
      let response = responseData.body;
      if (responseData.status === 200) {
        this.measurementTypeData = response;
      }
    });
    this.common.getAllSupplierListData({}).subscribe((responseData)=>{
      let response = responseData.body;
      if (responseData.status === 200) {
        this.supplierData = response;
      }
    });
    
  }

  onSubmit() {    
    if (this.userForm.invalid) {
      return;
    }
    
    // const currentFullTimestamp = new Date();
    // this.userForm.patchValue({ currentFullTimestamp });
    
    console.log('Form values:', this.userForm.value);
    this.userForm.reset();
  }

  addStocks(data:any){
    this.toEnableDisableColorFabric(true);

    const currentFullTimestamp = new Date();
    data.currentFullTimestamp = currentFullTimestamp;
    if (this.editStockForm !== null &&  this.addStocksList.length) {
      this.addStocksList.splice(this.editStockForm, 1)
    }
    this.addStocksList.push(data);

    console.log("Add stock data ",this.addStocksList);
    this.userForm.reset();
    let dataObj = {
      billNumber: data.billNumber,
      packingSlipNumber: data.packingSlipNumber,
      date: data.date,
      supplier: data.supplier
    }
    this.userForm.patchValue(dataObj);
    this.editStockForm = null;
  }

  setDataInStockForm(data:any, i:any){
    this.editStockForm = i;
    let dataObj = {
      material: data.material,
      subCategory: data.subCategory,
      colorFabricCode: data.colorFabricCode,
      measurementType: data.measurementType,
      quantity: data.quantity,
      amount: data.amount
    }
    this.userForm.patchValue(dataObj);
  }

  materialBtnClick(material:any){
    console.log(material);
    
    const selectedMaterialValue = material.value as string;    
    if(selectedMaterialValue == 'MAT_CLOTH'){
      this.showClothData = true;
      this.toEnableDisableColorFabric(true);
    }
    else if(selectedMaterialValue == 'add-material'){
      this.route.navigate(['./settings/add-material']);
    }
    else{
      this.showClothData = false;
      this.toEnableDisableColorFabric(false);
    } 
  }

  deleteStock(index: number) {
    this.addStocksList.splice(index, 1);
  } 

  submitForm(){
    this.showSpinner = true;
    this.userForm.reset();
    console.log("Form value : ", this.addStocksList);    

    // // Extracting the common keys and the remaining fields
    // const commonKeys = ['billNumber', 'date', 'packingSlipNumber', 'supplier'];
    // const extractedData:any = {
    //     common: {},
    //     data: []
    // };
    let newDataList:any = [];
    this.addStocksList.forEach((item:any) => {
        let newObj:any = {}
        // const commonData:any = {};
        // const remainingData:any = {};
        newObj.stock = {
          "materialCd": item.material,
          "subcategoryCd": item.subCategory,
          "colorFabricCd": item.colorFabricCode,
          "unit": item.measurementType
        };
        newObj.stockHistory = {
          "billNo" : item.billNumber,
          "quantity" : item.quantity?.toString(),
          "amount" : item.amount?.toString(),
          "supplierId" : item.supplier,
          "billDate" : moment(item.date).format('YYYY-MM-DD')
        };

        newDataList.push(newObj);

        // Object.entries(item).forEach(([key, value]) => {
        //     if (commonKeys.includes(key)) {
        //         commonData[key] = value;
        //     } else {
        //         remainingData[key] = value;
        //     }
        // });

    //     extractedData.common = commonData;
    //     extractedData.data.push(remainingData);
     });

    // console.log("Final Data : ",extractedData);
    
    

    console.log("newDataList", newDataList);
      
    this.common.addStocks(newDataList).subscribe((responseData)=>{
      let response = responseData.body;
      this.showSpinner = false;
      if (responseData.status === 201) {
        this.dialogTitle = 'Stock';
        this.dialogMessage = 'Stock added successfully.';
      }else{
        this.dialogTitle = 'Stock';
        this.dialogMessage = 'Stock details failed to add.';
      }
      this.openDialog();
    });
    this.toEnableDisableColorFabric(true);
    this.addStocksList = [];
  }

  toEnableDisableColorFabric(flag:boolean){
    // Disable the select control based on a condition
    const selectControl = this.userForm.get('colorFabricCode');
    if(flag){
      selectControl.enable();
    }
    else{
      selectControl.disable();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MsgDialogComponent, {
      width: '400px',
      data: { title: this.dialogTitle, message: this.dialogMessage }
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      console.log('The dialog was closed');
    });
  }

  fnForRedirectSettings(data1:any){ 
    const pageURL = data1.value as string;  
    console.log(pageURL);    
    if(pageURL == "add-color-fabric" || pageURL == "add-supplier" || pageURL == "add-subcategory" || pageURL == "add-measurement-type" ){      
      this.route.navigate([`./settings/${pageURL}`]);
    }
  }
}

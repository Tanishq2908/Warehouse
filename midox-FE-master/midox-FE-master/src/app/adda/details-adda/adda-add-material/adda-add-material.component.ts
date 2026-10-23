import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {NgFor, AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonService } from 'src/app/services/common.service';
import { ViewChild } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-adda-add-material',
  templateUrl: './adda-add-material.component.html',
  styleUrls: ['./adda-add-material.component.scss']
})
export class AddaAddMaterialComponent {
  showSpinner:boolean = true;
  myControl = new FormControl('');
  options: any[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<any[]>;
  stockDataObj:any;
  stockDataFull:any;
  maxQuantiy:any;
  maxQuantityunit:any;
  addaId:any;
  dialogTitle:string = "Adda Material";
  addaMaterialId:string = "";
  addaMaterialTitle:string = "Add Adda Material";
  
  //To get data from parent for edit
  @Input() forEditAddaMaterial:any = '';
  
  // To send data from child to parent
  @Output() forDetailAddReloadMaterial = new EventEmitter<any>();
  
  addaMaterialForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog,  private route: ActivatedRoute) {
    this.addaMaterialForm = this.formBuilder.group({
      addaId: ['', Validators.required],
      stockId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
    });
  }
  
  async ngOnInit(){    
    await this.route.params.subscribe(async (params) => {
      this.addaId = params['addaId'];
    })
    
    this.stockDataFull = await this.common.getDataFn1({}, "stock", "get-stocks");
    this.options = [...this.stockDataFull];
    
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
      );
      this.showSpinner = false;
  }
  
  async onSubmit() {
    if (this.addaMaterialForm.invalid) {
      return;
    }  
    this.showSpinner = true; 
  if(this.forEditAddaMaterial){
    let tempObj = {...this.addaMaterialForm.value};
    tempObj.addaMaterialId = this.addaMaterialId;
    console.log("Edit ",tempObj);    
    let temp = await this.common.addDataFn1(tempObj, "adda", "update-material", "get-addas", this.dialogTitle);
    }
    else{
      console.log("Add ",this.addaMaterialForm.value);
      let temp = await this.common.addDataFn1(this.addaMaterialForm?.value, "adda", "add-material", "get-addas", this.dialogTitle);
    }    
    this.resetForm();
    this.showSpinner = false;
    this.forDetailAddReloadMaterial.emit(true);
    this.ngOnInit();
    document.getElementById("addAddaMaterialBtn")?.click();    
  }

  
  ngOnChanges(){
    console.log("forEditAddaMaterial ",this.forEditAddaMaterial);    
    this.resetForm();
    // this.initForm();
    this.ngOnInit();

    if(this.forEditAddaMaterial){
      this.addaMaterialTitle = "Edit Adda Material";
      console.log("Edit"); 
      this.addaMaterialId = this.forEditAddaMaterial.addaMaterialId; 
      this.myControl.setValue(this.forEditAddaMaterial.stockDetails.stockName); 
      this.myControl.disable();    
      // this.addaMaterialForm.get('stockId')?.disable();
      //   this.addaId = this.forEditAdda?.addaId;
      //   // this.addAddaForm.patchValue(this.forEditAdda);
      this.addaMaterialForm.patchValue({
        addaId: this.forEditAddaMaterial.addaId,
        stockId: this.forEditAddaMaterial.stockDetails.stockId,
        quantity: this.forEditAddaMaterial.quantity,
      });
      this.maxQuantiy = this.forEditAddaMaterial.stockDetails.availableQuantity;
      this.maxQuantityunit = this.forEditAddaMaterial.stockDetails.unit.displayValue;
    }
    else{
      this.myControl.enable();    
      console.log("Add");
      this.addaMaterialTitle = "Add Adda Material";
    }
  }

  private _filter(value: any): any {
    console.log(value);
    let filterValue:any;
    // if(value.stockName){
    //   filterValue = value.stockName.toLowerCase();
    // }
    // else{
    //   filterValue = value.toLowerCase();
    // }
    filterValue = value.toLowerCase();

    return this.options.filter((val:any) => val?.stockName?.toLowerCase().includes(filterValue));
  }

  optionSelected(event: any): void {
    const selectedOptionValue = event.option.value;
    console.log('Selected Option Value:', selectedOptionValue);
    this.stockDataObj = this.stockDataFull.find((option: any) => option.stockName === selectedOptionValue);
    console.log('Selected Option:', this.stockDataObj);
    this.maxQuantiy = this.stockDataObj.availableQuantity;
    this.maxQuantityunit = this.stockDataObj.unit.displayValue;
    this.addaMaterialForm?.get('stockId')?.patchValue(this.stockDataObj.stockId);  
    this.addaMaterialForm?.get('addaId')?.patchValue(this.addaId);  
  }
  
  resetForm(){    
    // this.addaMaterialForm.get('stockId')?.enable();
    this.addaMaterialForm.reset();
    this.myControl.reset();
    this.maxQuantiy = -1;
    this.maxQuantityunit = null;
  }

}

import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-adda-add-pattern',
  templateUrl: './adda-add-pattern.component.html',
  styleUrls: ['./adda-add-pattern.component.scss']
})
export class AddaAddPatternComponent {
  showSpinner:boolean = true;  
  patternAddaAddForm!: FormGroup;
  colorArray: any[] = [];
  sizeArray: any[] = [];
  key: string = "MID_COL";
  key1: string = "MID_SIZE";
  addaId:any;
  dialogTitle:string = "Adda Pattern";
  addaPatternTitle:string = "Add Adda Pattern";
  patternId:string = "";

  // To send data from child to parent
  @Output() forDetailAddReloadPattern = new EventEmitter<any>();
  
  //To get data from parent for edit
  @Input() forEditAddaPattern:any = '';
  
  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog,  private route: ActivatedRoute) {  }

  async ngOnInit(){
    
    await this.route.params.subscribe(async (params) => {
      this.addaId = params['addaId'];
    })
    console.log("Adda ID ", this.addaId);
    

    this.patternAddaAddForm = this.formBuilder.group({
      // addaId: [this.addaId],
      addaId: [''],
      size: ['', Validators.required],
      color: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      bundleSize: ['', [Validators.required, Validators.min(1)]],
    });
    
    this.colorArray = await this.common.getDataFn(this.key);
    this.sizeArray = await this.common.getDataFn(this.key1);
    console.log("Color array ", this.colorArray);
    
    this.showSpinner = false; 
  }

  async onSubmit() {
    if (this.patternAddaAddForm.invalid) {
      return;
    }  
    // console.log(this.patternAddaAddForm.value);
    
    this.showSpinner = true; 
    if(this.forEditAddaPattern){
      let tempObj = {...this.patternAddaAddForm.value};
      tempObj.patternId = this.patternId;
      console.log("Edit ",tempObj);    
      let temp = await this.common.addDataFn1(tempObj, "adda", "update-pattern", "get-addas", this.dialogTitle);
    }
    else{
      this.patternAddaAddForm.controls['addaId'].patchValue(this.addaId);
      console.log("Add ",this.patternAddaAddForm.value);
      let temp = await this.common.addDataFn1(this.patternAddaAddForm?.value, "adda", "add-pattern", "get-addas", this.dialogTitle);
    }    
    this.resetForm();
    this.showSpinner = false;
    this.forDetailAddReloadPattern.emit(true);
    // this.ngOnInit();
    document.getElementById("addAddaPatternBtn")?.click();    
  }

  ngOnChanges(){
    console.log("forEditAddaPattern ",this.forEditAddaPattern);    
    this.resetForm();
    // this.initForm();
    // this.ngOnInit();

    if(this.forEditAddaPattern){
      this.addaPatternTitle = "Edit Adda Pattern";
      console.log("Edit"); 
      this.patternId = this.forEditAddaPattern.patternId; 
      // this.addaMaterialForm.get('stockId')?.disable();
      this.patternAddaAddForm.patchValue({
        addaId: this.addaId,
        size: this.forEditAddaPattern.size.entityCd,
        color: this.forEditAddaPattern.color.entityCd,
        quantity: this.forEditAddaPattern.quantity,
        bundleSize: this.forEditAddaPattern.bundleSize,
      });
    }
    else{
      console.log("Add");
      this.addaPatternTitle = "Add Adda Pattern";
    }
  }

  resetForm(){
    this.patternAddaAddForm?.reset();
  }
}

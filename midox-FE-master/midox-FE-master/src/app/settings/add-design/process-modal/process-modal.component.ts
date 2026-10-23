import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-process-modal',
  templateUrl: './process-modal.component.html',
  styleUrls: ['./process-modal.component.scss']
})
export class ProcessModalComponent {
  @Input() modalValue:any = [];
  

  processModalForm: FormGroup;
  processModalData: any = [];
  editedProcessModalIndex: number | null = null;
  deleteBtnDisabled: boolean = false;
  showSpinner: boolean = true;
  addAPI: boolean = false;
  
  processDropdownValues: any = [];
  dropDownValue:any = ["ACTIVE","INACTIVE"];
  dialogTitle:string = "Process";
  selectedOption:any = "";

  //Send data to parent
  @Output() newItemEvent = new EventEmitter<boolean>();

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) {
    this.processModalForm = this.formBuilder.group({
      processCd: ['', Validators.required],
      ratePerPeice: ['', Validators.required],
      details: ['', [Validators.required, Validators.minLength(3)]],
      status: ['', Validators.required],
      priority: ['', Validators.required],
    });    
  }  

  ngOnChanges(){      
    console.log("modalValue ",this.modalValue.processes);
    this.processModalData = {};
    this.processModalData = Object.assign({}, this.modalValue);
    this.processModalData = this.processModalData.processes;
    let n = this.processModalData?.length;
    if(n == 0){
      this.addAPI = true;
    }
    else{
      this.addAPI = false;
    }
    console.log("addAPI : ", this.addAPI);  
      for(let i=0; i<n; i++){
        if(this.processModalData[i]?.processCd?.displayValue){
          this.processModalData[i].processCdDisplayValue = this.processModalData[i].processCd.displayValue;
          this.processModalData[i].processCd = this.processModalData[i].processCd.entityCd;
          this.processModalData[i].createdBy = this.processModalData[i].createdBy.empId;
          this.processModalData[i].updatedBy = this.processModalData[i].updatedBy.empId;
        }
      }  
    console.log("Process data ",this.processModalData);
  }

  ngOnInit(){
    this.getProcess();
  }

  onSubmit() {
    if (this.processModalForm.invalid) {
      return;
    }
    
    const selectControl = this.processModalForm.get('processCd');
    selectControl?.enable();

    this.deleteBtnDisabled = false;
    const processCd = this.processModalForm.controls['processCd'].value;
    const ratePerPeice = this.processModalForm.controls['ratePerPeice'].value;
    const details = this.processModalForm.controls['details'].value;
    const status = this.processModalForm.controls['status'].value;
    const priority = this.processModalForm.controls['priority'].value;
    
    if (this.editedProcessModalIndex !== null) {
      //Update
      this.processModalData[this.editedProcessModalIndex].processCd = processCd;
      this.processModalData[this.editedProcessModalIndex].ratePerPeice = ratePerPeice;
      this.processModalData[this.editedProcessModalIndex].details = details;
      this.processModalData[this.editedProcessModalIndex].status = status;
      this.processModalData[this.editedProcessModalIndex].priority = priority;
      this.editedProcessModalIndex = null;
      console.log("Update ",this.processModalData);
      
    } else {
      let val:any = { 
        processCd: processCd, 
        ratePerPeice:ratePerPeice, 
        details:details,
        status:status,
        priority:priority,
      };
      val.processCdDisplayValue = this.selectedOption?.displayValue;
      this.processModalData.push(val);
      console.log("Add ",this.processModalData);
    }
    this.processModalForm.reset();
  }

  onOptionSelected(selectElement: HTMLSelectElement) {
    let selectedIndex = selectElement.selectedIndex-1;
    this.selectedOption = this.processDropdownValues[selectedIndex];
    console.log('Selected Option Label:', this.selectedOption.displayValue);
  }

  edit(data: any, index: number) {
    console.log("data ",data);
    
    this.deleteBtnDisabled = true;
    this.editedProcessModalIndex = index;
    this.processModalForm.patchValue(data);
    const selectControl = this.processModalForm.get('processCd');
    selectControl?.disable();
  }

  delete(index: number) {
    this.processModalData.splice(index, 1);
  }

  //API Call
  async apiCallSaveData(){
    this.newItemEvent.emit(true);
    document.getElementById("closeModalButton")?.click();
    
    let finalData = {designId:this.modalValue?.designId, processes:this.processModalData};
    console.log("final processModalData: ",finalData);
    
    if(this.addAPI){
      // Add
      console.log("add");      
      let temp = await this.common.addDataFn1(finalData, "design", "add-processes", "get-designs", this.dialogTitle);
      console.log("Process ",temp);
    }
    else{
      // Update
      console.log("Update");
      let temp = await this.common.addDataFn1(finalData, "design", "update-processes", "get-designs", this.dialogTitle);
      console.log("Process ",temp);
    }
    this.newItemEvent.emit(false);
  }

  getProcess(){    
    this.common.getAllSettingsData("MID_PROC").subscribe((responseData:any)=>{
      let response = responseData?.body;
      if (responseData.status === 200) {
        this.processDropdownValues = response;
        console.log(response);        
      }
      else{
        console.log("Error code: ",responseData?.status);        
      }
      this.showSpinner = false;
    });
  }

}

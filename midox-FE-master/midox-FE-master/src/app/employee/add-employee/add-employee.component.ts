import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {

  employeeForm:any = FormGroup;
  genderValue:any = ["MALE","FEMALE", "OTHER"];
  statusValue:any = ["EMP_ACTIVE","EMP_INACTIVE"];
  designationValue:any = ["WORKER","SUPERVISOR","MANAGER","ADMIN"];  
  employeeId:any = "";
  employeeData:any = [];
  showSpinner:boolean = true;
  dialogTitle:string = "Employee";
  editedMaterialIndex: number | null = null;

  constructor(private formBuilder: FormBuilder, private common: CommonService, public dialog: MatDialog) { }

  async ngOnInit() {
    this.employeeForm = this.formBuilder.group({
      empName: ['', [Validators.required, Validators.minLength(3)]],
      joiningDate: ['', Validators.required],
      empDOB: ['', Validators.required],
      gender: ['', Validators.required],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required],
      status: ['', Validators.required],
      identificationNo: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      designation: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required],
    });

    // API call to get all employees
    this.employeeData = await this.common.getDataFn1({}, "employee", "get-employees");
    this.showSpinner = false;
  }

  async onSubmit() {
    if (this.employeeForm.invalid) {
      return;
    }
    console.log('Emp Form values:', this.employeeForm.value);
    this.showSpinner = true;
    if(this.editedMaterialIndex !== null){
      //For update
      let tempObj = this.employeeForm?.value;
      tempObj.empId = this.employeeId;
      console.log(tempObj);
      
      let temp = await this.common.addDataFn1(this.employeeForm?.value, "employee", "edit", "get-employees", this.dialogTitle);
      if(temp){
        this.employeeData = temp;
      }
      this.showSpinner = false;
    }
    else{
      //For add
      let temp = await this.common.addDataFn1(this.employeeForm?.value, "employee", "save", "get-employees", this.dialogTitle);
      if(temp){
        this.employeeData = temp;
      }
      this.showSpinner = false;
    }
    this.editedMaterialIndex = null;
    this.employeeForm.reset(); 
    
    document.getElementById("addEmployeeAccordian")?.click();  
  }

  edit(data: any, index:number): void {    
    // this.deleteBtnDisabled = true;
    
    document.getElementById("addEmployeeAccordian")?.click();
    this.editedMaterialIndex = index;
    this.employeeId = data?.empId;
    console.log(data);
    
    
    this.employeeForm.patchValue({
      empName: data.empName,
      joiningDate: data.joiningDate,
      empDOB: data.empDOB,
      gender: data.gender,
      contactNo: data.contactNo,
      address: data.address,
      status: data.status,
      identificationNo: data.identificationNo,
      designation: data.designation,
      email: data.email,
      description: data.description
    });
  }
 
}

import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.scss']
})
export class AddMaterialComponent {
  form: FormGroup;
  data: any[] = [];
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['material', 'subCategory', 'colorFabricCode', 'quantity', 'actions'];
  editButton: boolean = false;

  showSpinner:boolean = true;
  addMaterialDetails: any = [];
  constructor(private commonService: CommonService, private formBuilder: FormBuilder){ 
    commonService.addMaterialData.subscribe((val:any) => {
      this.addMaterialDetails = val;
      console.log(this.addMaterialDetails);
      
    });

    this.form = this.formBuilder.group({
      material: ['', Validators.required],
      subCategory: ['', Validators.required],
      colorFabricCode: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]]
    });
    this.dataSource = new MatTableDataSource(this.data);
  }


  onSubmit() {
    if (this.form.valid) {
      this.editButton = false;
      this.data.push(this.form.value);
      console.log(this.data);
      this.dataSource.data = this.data;
      this.form.reset();
    }
  }

  edit(index: number) {
    this.editButton = true;
    const item = this.data[index];
    this.form.patchValue(item);
    this.data.splice(index, 1);
    this.dataSource.data = this.data;
  }

  delete(index: number) {
    this.data.splice(index, 1);
    this.dataSource.data = this.data;
  }

  submitForm(){
    console.log(this.data);
    
  }

}

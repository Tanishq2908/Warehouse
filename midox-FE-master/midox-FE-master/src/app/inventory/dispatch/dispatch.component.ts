import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss']
})
export class DispatchComponent implements OnInit {

  dispatchInventoryForm:any = FormGroup;

  brandNamesData:any=["One","Two","Three","Four","Five"]; 
  productData:any=["One","Two","Three","Four","Five"]; 
  designNumberData:any=["One","Two","Three","Four","Five"]; 

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.dispatchInventoryForm = this.formBuilder.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      brand: ['', Validators.required],
      designNumber: ['', Validators.required],
      product: ['', Validators.required],
      currentFullTimestamp: [''],
    });
  }

  onSubmit() {
    if (this.dispatchInventoryForm.invalid) {
      return;
    }
    const currentFullTimestamp = new Date();
    this.dispatchInventoryForm.patchValue({ currentFullTimestamp });
    
    console.log('Dispatch Inventory Form values:', this.dispatchInventoryForm.value);
  }

}

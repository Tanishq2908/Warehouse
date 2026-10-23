import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-payment-employee',
  templateUrl: './payment-employee.component.html',
  styleUrls: ['./payment-employee.component.scss']
})
export class PaymentEmployeeComponent {
  showSpinner:boolean = true;
  employeePaymentDetails: any = [];
  constructor(private commonService: CommonService){ 
    commonService.employeePaymentData.subscribe((val:any) => {
      this.employeePaymentDetails = val;
      console.log(this.employeePaymentDetails);
      
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { MsgDialogComponent } from 'src/app/shared/msg-dialog/msg-dialog.component';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bundle',
  templateUrl: './bundle.component.html',
  styleUrls: ['./bundle.component.scss']
})
export class BundleComponent {
  // constructor(public dialog: MatDialog) {}
  dialogTitle: string = "Employee Assign";
  showSpinner: boolean = true;
  showTable: boolean = false;
  employeeData: any = [];
  detailAddaData: any;
  
  statusDropDownValue: any = [
    { displayValue: "To be started", entityCd: "PROC_STAT_TBS" },
    { displayValue: "In Progress", entityCd: "PROC_STAT_INP" },
    { displayValue: "Hold", entityCd: "PROC_STAT_HOLD" },
    { displayValue: "Finished", entityCd: "PROC_STAT_FIN" },
  ];
  
  filteredOptionsEmployee!: Observable<any[]>;
  myControlEmployee = new FormControl('');
  optionsEmployee: any[] = ['One', 'Two', 'Three'];
  bundleAddaData: any;

  
  filteredOptionsAdda!: Observable<any[]>;
  myControlAdda = new FormControl('');
  optionsAdda: any[] = ['One', 'Two', 'Three'];
  
  constructor(private commonService: CommonService) { }

  async ngOnInit(){
    
    // this.bundleAddaData = await this.commonService.getDataFn1({ "patternId": patternId }, "bundle", "get-bundles");
    // let temp = await this.commonService.getDataFn1({ "addaId": 3 }, "bundle", "get-bundles");
    // console.log(temp);
    
    
    this.detailAddaData = await this.commonService.getDataFn1({}, "adda", "get-addas");
    this.optionsAdda = [...this.detailAddaData];
    this.filteredOptionsAdda = this.myControlAdda.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAdda(value || '')),
    );
      this.showSpinner = false;
      // this.getBundleData(3);
  }

  async getBundleData(addaId:any){
    this.showSpinner = true;
    this.showTable = false;
    this.bundleAddaData = await this.commonService.getDataFn1({ "addaId": addaId }, "bundle", "get-bundles");
    this.employeeData = await this.commonService.getDataFn1({}, "employee", "get-employees");
      this.optionsEmployee = [...this.employeeData];
      this.filteredOptionsEmployee = this.myControlEmployee.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || '')),
      );
      this.showTable = true;
      this.showSpinner = false;
  }

  private _filter(value: any): any {
    console.log(value);
    let filterValue: any;
    filterValue = value.toLowerCase();
    return this.optionsEmployee.filter((val: any) => val?.empName?.toLowerCase().includes(filterValue));
  }

  private _filterAdda(value: any): any {
    console.log(value);
    let filterValue: any;
    filterValue = value.toLowerCase();
    return this.optionsAdda.filter((val: any) => val?.addaNo?.toLowerCase().includes(filterValue));
  }

  
  async optionSelectedAdda(event: any) {
    let selectedOptionValue = event.option.value;
    
    let addaObj = this.detailAddaData.find((option: any) => option.addaNo === selectedOptionValue);
    let addaId = addaObj.addaId;
    console.log('addaId:', addaId);
    this.getBundleData(addaId);

  }

  async optionSelectedEmployee(event: any, data: any) {
    const selectedOptionValue = event.option.value;
    console.log('Selected Option Value:', selectedOptionValue);
    let employeeObj = this.employeeData.find((option: any) => option.empName === selectedOptionValue);
    let currentEmployeeId = employeeObj.empId;
    let bundleId = data.bundleId;
    let tempObj = { "bundleId": bundleId, "currentEmployeeId": currentEmployeeId }
    console.log("tempObj ", tempObj);
    this.showSpinner = true;
    this.myControlEmployee.reset();
    let temp = await this.commonService.addDataFn1(tempObj, "bundle", "assign-employee", "get-bundles", this.dialogTitle);
    this.ngOnInit();


    // this.maxQuantiy = this.stockDataObj.availableQuantity;
    // this.addaMaterialForm?.get('stockId')?.patchValue(this.stockDataObj.stockId);  
    // this.addaMaterialForm?.get('addaId')?.patchValue(this.addaId);  
  }

  async statusChangefn(val: any, data: any) {
    // console.log(val.target.value);
    this.showSpinner = true;
    let tempObj = { "bundleId": data.bundleId, "currentProcessStatus": val.target.value };
    console.log(tempObj);

    let temp = await this.commonService.addDataFn1(tempObj, "bundle", "update-status", "get-bundles", this.dialogTitle);
    this.ngOnInit();


  }

  
  exportPdf(data: any): void {
    let detail = data?.data;
    console.log("PDF detail ", detail);
    console.log("PDF detail ", this.detailAddaData);
    const docDefinition: any = {
      pageOrientation: "portrait",
      pageMargins: [40, 30, 20, 20],
      pageSize: "A6",
      //   header: {
      //     margin: 25.5,
      //     columns: [
      //         {
      //             image: logo,
      //             height: 106.4,
      //             width: 540
      //             // alignment: 'center'
      //         }
      //     ]
      // },

      footer: function (currentPage: any, pageCount: any) {
        return [{ text: 'Page ' + currentPage.toString() + ' of ' + pageCount, alignment: 'center', fontSize: 9 }];
      },

      content: [
        { text: "JC-2713", style: "header" },
        {

          canvas: [
            { type: 'line', x1: 0, y1: -7, x2: 220, y2: -7, lineWidth: 1 }, //Bottom line
          ]
        },
        {
          style: "row",
          text: [{ text: "Employee", bold: true }, { text: " :   " }, { text: detail?.currentEmployeeId?.empName }],

        },
        {
          style: "row",
          text: [{ text: "Job Assigned", bold: true }, { text: " :   " }, { text: detail?.currentProcessCd?.displayValue }],

        },
        {
          style: "row",
          text: [{ text: "Adda No.", bold: true }, { text: " :   " }, { text: this.detailAddaData[0]?.addaNo }],

        },
        {
          style: "row",
          text: [{ text: "Item", bold: true }, { text: " :   " }, { text: this.detailAddaData[0]?.productCd.displayValue }],

        },
        {
          style: "row",
          text: [{ text: "Product", bold: true }, { text: " :   " }, { text: this.detailAddaData[0]?.productCd.displayValue }],

        },
        {
          style: "row",
          text: [{ text: "Size", bold: true }, { text: " :   " }, { text: detail?.bundleName }],

        },
        {
          style: "row",
          text: [{ text: "Bundle", bold: true }, { text: " :   " }, { text: detail?.bundleName }],

        },
        {
          style: "row",
          text: [{ text: "Design", bold: true }, { text: " :   " }, { text: this.detailAddaData[0]?.designNo }],

        },
        {
          style: "row",
          text: [{ text: "Quantity", bold: true }, { text: " :   " }, { text: detail?.quantity }],

        },
        {
          style: "row",
          text: [{ text: "Wage to Provide", bold: true }, { text: " :   " }, { text: detail?.currentProcessCd?.displayValue }],

        },
        {
          style: "row",
          text: [{ text: "Rate", bold: true }, { text: " :   " }, { text: detail?.quantity }],

        },
        {
          style: "row",
          text: [{ text: "Job Flow Number", bold: true }, { text: " :   " }, { text: detail?.currentProcessCd?.displayValue }],

        },
        {
          style: "row",
          text: [{ text: "Total", bold: true }, { text: " :   " }, { text: detail?.quantity * detail?.quantity }], //rate *  qty

        },
        {
          text: "Job Details",
          style: "subheader"
        },
        {

          canvas: [
            { type: 'line', x1: 0, y1: -7, x2: 220, y2: -7, lineWidth: 1 }, //Bottom line
          ]
        },
        {
          style: "row",
          text: [{ text: "Product Job", bold: true }, { text: " :   " }, { text: detail?.currentProcessCd?.displayValue }],

        },
        {
          style: "row",
          text: [{ text: "Status", bold: true }, { text: " :   " }, { text: detail?.status?.displayValue }],

        },
        {
          style: "row",
          text: [{ text: "Last Modified By", bold: true }, { text: " :   " }, { text: `${detail?.updatedBy?.empName} ${detail?.updatedAt}`}],

        }
      ],

      styles: {
        header: {
          fontSize: 13,
          bold: true,
          margin: [0, 0, 0, 8]
        },
        subheader: {
          fontSize: 13,
          bold: true,
          margin: [0, 15, 0, 8],
          fillColor: '#cccccc'
        },
        row: {
          margin: [2, 6, 0, 0],
          fontSize: 9
        }
      }
    };
    pdfMake.createPdf(docDefinition).open();
  }
}

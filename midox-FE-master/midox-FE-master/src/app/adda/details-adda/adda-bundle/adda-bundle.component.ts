import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-adda-bundle',
  templateUrl: './adda-bundle.component.html',
  styleUrls: ['./adda-bundle.component.scss']
})
export class AddaBundleComponent {
  showSpinner: boolean = true;
  bundleAddaData!: any[];
  employeeData: any = [];
  processData: any = [];
  detailAddaData: any;

  filteredOptionsEmployee!: Observable<any[]>;
  myControlEmployee = new FormControl('');
  optionsEmployee: any[] = ['One', 'Two', 'Three'];
  dialogTitle: string = "Employee Assign";
  statusDropDownValue: any = [
    { displayValue: "To be started", entityCd: "PROC_STAT_TBS" },
    { displayValue: "In Progress", entityCd: "PROC_STAT_INP" },
    { displayValue: "Hold", entityCd: "PROC_STAT_HOLD" },
    { displayValue: "Finished", entityCd: "PROC_STAT_FIN" },
  ];

  statusForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private commonService: CommonService, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.showSpinner = true;
    this.statusForm = this.formBuilder.group({
      status: ['PROC_STAT_TBS', Validators.required]
    });
    await this.route.params.subscribe(async (params) => {
      const patternId = params['patternId'];
      const brandId = params['brandId'];
      const addaId = params['addaId'];
      console.log('Received ID:', patternId);

      this.detailAddaData = await this.commonService.getDataFn1({ "addaId": addaId }, "adda", "get-addas");
      this.bundleAddaData = await this.commonService.getDataFn1({ "patternId": patternId }, "bundle", "get-bundles");
      this.employeeData = await this.commonService.getDataFn1({}, "employee", "get-employees");
      this.processData = await this.commonService.getDataFn1({ "brandId": brandId }, "design", "get-designs");
      this.processData = this.processData[0].processes;
      console.log("processData ", this.processData);


      this.optionsEmployee = [...this.employeeData];
      this.filteredOptionsEmployee = this.myControlEmployee.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || '')),
      );

      this.showSpinner = false;

      // this.statusForm.get('status')?.disable(); 
    });
  }

  private _filter(value: any): any {
    console.log(value);
    let filterValue: any;
    filterValue = value.toLowerCase();
    return this.optionsEmployee.filter((val: any) => val?.empName?.toLowerCase().includes(filterValue));
  }

  async statusChangefn(val: any, data: any) {
    // console.log(val.target.value);
    this.showSpinner = true;
    let tempObj = { "bundleId": data.bundleId, "currentProcessStatus": val.target.value };
    console.log(tempObj);

    this.statusForm.reset();
    let temp = await this.commonService.addDataFn1(tempObj, "bundle", "update-status", "get-bundles", this.dialogTitle);
    this.ngOnInit();


  }

  // async onSubmit() {
  //   if (this.statusForm.invalid) {
  //     return;
  //   }
  //   // this.showSpinner = true;
  //   console.log('statusForm Form values:', this.statusForm.value);

  // }

  async optionSelectedEmployee(event: any, data: any) {
    const selectedOptionValue = event.option.value;
    console.log('Selected Option Value:', selectedOptionValue);
    let employeeObj = this.employeeData.find((option: any) => option.empName === selectedOptionValue);
    // console.log('Selected Option:', employeeObj);
    let currentEmployeeId = employeeObj.empId;
    // console.log("Row data ", data);
    let bundleId = data.bundleId;
    let tempObj = { "bundleId": bundleId, "currentEmployeeId": currentEmployeeId }
    // console.log("currentEmployeeId ",currentEmployeeId);
    // console.log("bundleId ",bundleId);
    console.log("tempObj ", tempObj);
    this.showSpinner = true;
    this.myControlEmployee.reset();
    let temp = await this.commonService.addDataFn1(tempObj, "bundle", "assign-employee", "get-bundles", this.dialogTitle);
    this.ngOnInit();


    // this.maxQuantiy = this.stockDataObj.availableQuantity;
    // this.addaMaterialForm?.get('stockId')?.patchValue(this.stockDataObj.stockId);  
    // this.addaMaterialForm?.get('addaId')?.patchValue(this.addaId);  
  }

  printStickerFn() {
    console.log("All Bundle : ", this.bundleAddaData);
    let contentArr:any = [];
    this.bundleAddaData.forEach((data:any, index:number) => {
      let firstRow = {
        columns: [
          { text: [{ text: "DATE", bold: true }, { text: " : " }, { text: moment(data?.createdAt).format('DD/MM/YYYY'), bold: true }],},
          { text: [{ text: "ADDA NO.", bold: true }, { text: " : " }, { text: "2974", bold: true }],},
          { text: [{ text: "SR NO.", bold: true }, { text: " : " }, { text: index+1, bold: true }],margin:[10,0,0,0]},
        ],
        style: "row"
      };

      let secondRow = {
        columns: [
          { text: [{ text: "BUNDLE", bold: true }, { text: " : " }, { text: data?.bundleName, bold: true }],},
          { text: [{ text: "PRODUCT", bold: true }, { text: " : " }, { text: data?.currentProcessCd?.displayValue, bold: true }]},
          { text: [{ text: "QTY", bold: true }, { text: " : " }, { text: data?.quantity, bold: true }],margin:[10,0,0,0]},
        ],
        style: "row"
      };

      let thirdRow = {
        columns: [
          { text: [{ text: "COLOR", bold: true }, { text: " : " }, { text: "RED", bold: true }],},
          { text: [{ text: "DESIGN NO.", bold: true }, { text: " : " }, { text: "1047", bold: true }],},
          { text: [{ text: "SIZE", bold: true }, { text: " : " }, { text: "S", bold: true }],margin:[10,0,0,0]},
        ],
        style: "row"
      };

      let fourthRow = { text: [{ text: "ST. PROS.", bold: true, fontSize: 10 }], style: "row"};

      let fifthRow = {
        style: 'table',
        table: {
          //headerRows: 1,
          body: [
            [{ text: 'Z', style: 'tableHeader' }, { text: 'F', style: 'tableHeader' }, { text: 'Z', style: 'tableHeader' }],
            [{ text: 'L', style: 'tableHeader' }, { text: 'F', style: 'tableHeader' }, { text: 'Z', style: 'tableHeader' }],
          ]
        },
        layout: 'noBorders'
      };

      let pageBreak = {text: '', pageBreak: 'after'};

      contentArr.push(firstRow);
      contentArr.push(secondRow);
      contentArr.push(thirdRow);
      contentArr.push(fourthRow);
      contentArr.push(fifthRow);
      this.bundleAddaData.length - 1 != index ? contentArr.push(pageBreak) : "";

    });
    const docDefinition: any = {
      //pageOrientation: "portrait",
      pageMargins: [10, 12, 10, 12],
      pageSize: {
        width: 340,
        height: 170
      },
      content: contentArr,
      /*content: [
        {
          columns: [
            { text: [{ text: "DATE", bold: true }, { text: " : " }, { text: "22-09-2023", bold: true }],},
            { text: [{ text: "ADDA NO.", bold: true }, { text: " : " }, { text: "2974", bold: true }],},
            { text: [{ text: "SR NO.", bold: true }, { text: " : " }, { text: "1", bold: true }],},
          ],
          style: "row"
        },
        {
          columns: [
            { text: [{ text: "BUNDLE NO.", bold: true }, { text: " : " }, { text: "545434", bold: true }],},
            { text: [{ text: "PRODUCT", bold: true }, { text: " : " }, { text: "T-SHIRT H/S", bold: true }],},
            { text: [{ text: "QTY", bold: true }, { text: " : " }, { text: "40", bold: true }],},
          ],
          style: "row"
        },
        {
          columns: [
            { text: [{ text: "COLOR", bold: true }, { text: " : " }, { text: "22-09-2023", bold: true }],},
            { text: [{ text: "DESIGN NO.", bold: true }, { text: " : " }, { text: "1047", bold: true }],},
            { text: [{ text: "SIZE", bold: true }, { text: " : " }, { text: "S", bold: true }],},
          ],
          style: "row"
        },
        { text: [{ text: "ST. PROS.", bold: true, fontSize: 10 }], style: "row"},
        {
          style: 'table',
          table: {
            //headerRows: 1,
            body: [
              [{ text: 'Z', style: 'tableHeader' }, { text: 'F', style: 'tableHeader' }, { text: 'Z', style: 'tableHeader' }],
              [{ text: 'L', style: 'tableHeader' }, { text: 'F', style: 'tableHeader' }, { text: 'Z', style: 'tableHeader' }],
            ]
          },
          layout: 'noBorders'
        },
        // {text: '', pageBreak: 'after'},
      ],*/
      styles: {
        row: { margin: [2, 2, 0, 8], fontSize: 8.5},
        table: { margin: [0, 0, 0, 10], bold: true },
        tableHeader: { margin: [60, 0, 30, 8]},
      }
    };
    pdfMake.createPdf(docDefinition).open();
  }
  exportPdf(data: any): void {
    let detail = data?.data;
    console.log("PDF detail ", detail);
    console.log("PDF detail ", this.detailAddaData);
    console.log("processData ", this.processData);
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

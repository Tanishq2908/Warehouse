import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule} from '@angular/material/menu';
import { NgChartsModule } from 'ng2-charts';
import { MatIconModule } from '@angular/material/icon';
// import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DxDataGridModule } from 'devextreme-angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {NgFor, AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgChartsModule,
    MatMenuModule,
    MatIconModule,
    // BrowserModule,
    DxDataGridModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule, 
    MatNativeDateModule, 
    MatDatepickerModule,
    MatDialogModule,
    HttpClientModule,
    // BrowserAnimationsModule,
    FormsModule,
    
    MatAutocompleteModule,
    NgFor,
    AsyncPipe,
  ],
  exports: [
    CommonModule,
    NgChartsModule,
    MatMenuModule,
    MatIconModule,
    // BrowserModule,
    DxDataGridModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatNativeDateModule, 
    MatDatepickerModule,
    MatDialogModule,
    HttpClientModule,
    MatAutocompleteModule
  ]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { AddMaterialComponent } from './add-material/add-material.component';
import { AddSubcategoryComponent } from './add-subcategory/add-subcategory.component';
import { AddProductComponent } from './add-product/add-product.component';
import { AddColorfabricComponent } from './add-colorfabric/add-colorfabric.component';
import { AddProcessComponent } from './add-process/add-process.component';
import { AddDesignComponent } from './add-design/add-design.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { AddMeasurementComponent } from './add-measurement/add-measurement.component';
import { AddBrandComponent } from './add-brand/add-brand.component';
import { SignupComponent } from '../signup/signup.component';
import { AddColorComponent } from './add-color/add-color.component';

const routes: Routes = [
  { path: '',
    component:  SettingsPageComponent,
    children:[
      { path:'', redirectTo:'add-material', pathMatch:'full'},
      { path: 'add-material', component:  AddMaterialComponent}, 
      { path: 'add-subcategory', component:  AddSubcategoryComponent}, 
      { path: 'add-product', component:  AddProductComponent}, 
      { path: 'add-color', component:  AddColorComponent}, 
      { path: 'add-color-fabric', component:  AddColorfabricComponent}, 
      { path: 'add-process', component:  AddProcessComponent}, 
      { path: 'add-design', component:  AddDesignComponent}, 
      { path: 'add-supplier', component:  AddSupplierComponent}, 
      { path: 'add-measurement-type', component:  AddMeasurementComponent}, 
      { path: 'add-brand', component:  AddBrandComponent}, 
      { path: 'sign-up', component:  SignupComponent}, 
    ]
  }
];
// const routes: Routes = [
//   { path: '', component:  SettingsPageComponent},
//   { path: 'add-material', component:  AddMaterialComponent}, 
//   { path: 'add-subcategory', component:  AddSubcategoryComponent}, 
//   { path: 'add-product', component:  AddProductComponent}, 
//   { path: 'add-color-fabric', component:  AddColorfabricComponent}, 
//   { path: 'add-process', component:  AddProcessComponent}, 
//   { path: 'add-design', component:  AddDesignComponent}, 
//   { path: 'add-supplier', component:  AddSupplierComponent}, 
//   { path: 'add-measurement-type', component:  AddMeasurementComponent}, 
//   { path: 'add-brand', component:  AddBrandComponent}, 
// ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }

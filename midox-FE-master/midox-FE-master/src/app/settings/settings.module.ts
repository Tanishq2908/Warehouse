import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared/shared.module';

import { SettingsRoutingModule } from './settings-routing.module';
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
import { ProcessModalComponent } from './add-design/process-modal/process-modal.component';
import { AddColorComponent } from './add-color/add-color.component';


@NgModule({
  declarations: [
    SettingsPageComponent,
    AddMaterialComponent,
    AddSubcategoryComponent,
    AddProductComponent,
    AddColorfabricComponent,
    AddProcessComponent,
    AddDesignComponent,
    AddSupplierComponent,
    AddMeasurementComponent,
    AddBrandComponent,
    ProcessModalComponent,
    AddColorComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule
  ]
})
export class SettingsModule { }

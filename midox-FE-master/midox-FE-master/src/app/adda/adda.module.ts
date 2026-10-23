import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared/shared.module'; 

import { AddaRoutingModule } from './adda-routing.module';
import { AddAddaComponent } from './add-adda/add-adda.component';
import { ViewAddaComponent } from './view-adda/view-adda.component';
import { AddMaterialComponent } from './add-material/add-material.component';
import { AddPatternComponent } from './add-pattern/add-pattern.component';
import { BundleComponent } from './bundle/bundle.component';
import { JobCardComponent } from './job-card/job-card.component';
import { StickerComponent } from './sticker/sticker.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DetailsAddaComponent } from './details-adda/details-adda.component';
import { AddaAddMaterialComponent } from './details-adda/adda-add-material/adda-add-material.component';
import { AddaAddPatternComponent } from './details-adda/adda-add-pattern/adda-add-pattern.component';
import { AddaBundleComponent } from './details-adda/adda-bundle/adda-bundle.component';


@NgModule({
  declarations: [
    AddAddaComponent,
    ViewAddaComponent,
    AddMaterialComponent,
    AddPatternComponent,
    BundleComponent,
    JobCardComponent,
    StickerComponent,
    DetailsAddaComponent,
    AddaAddMaterialComponent,
    AddaAddPatternComponent,
    AddaBundleComponent
  ],
  imports: [
    CommonModule,
    AddaRoutingModule,
    SharedModule
  ],
})
export class AddaModule { }

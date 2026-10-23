import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAddaComponent } from './add-adda/add-adda.component';
import { AddMaterialComponent } from './add-material/add-material.component';
import { AddPatternComponent } from './add-pattern/add-pattern.component';
import { BundleComponent } from './bundle/bundle.component';
import { JobCardComponent } from './job-card/job-card.component';
import { StickerComponent } from './sticker/sticker.component';
import { ViewAddaComponent } from './view-adda/view-adda.component';
import { DetailsAddaComponent } from './details-adda/details-adda.component';
import { AddaBundleComponent } from './details-adda/adda-bundle/adda-bundle.component';

const routes: Routes = [
  {path: '', redirectTo: 'add-adda', pathMatch: 'full'},
  { path: 'add-adda', component:  AddAddaComponent},
  { path: 'add-material', component:  AddMaterialComponent},
  { path: 'add-pattern', component:  AddPatternComponent},
  { path: 'bundle', component:  BundleComponent},
  { path: 'job-card', component:  JobCardComponent},
  { path: 'sticker', component:  StickerComponent},
  { path: 'view-adda', component:  ViewAddaComponent},
  // { path: 'details-adda', component:  DetailsAddaComponent},
  { path: 'details-adda/:addaId', component:  DetailsAddaComponent},
  { path: 'bundle-adda/:addaId/:patternId/:brandId', component:  AddaBundleComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddaRoutingModule { }

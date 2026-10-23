import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddStockComponent } from './add-stock/add-stock.component';
import { DispatchComponent } from './dispatch/dispatch.component';
import { DispatchHistoryComponent } from './dispatch-history/dispatch-history.component';
import { FinishGoodsComponent } from './finish-goods/finish-goods.component';
import { StockHistoryComponent } from './stock-history/stock-history.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  {path: '', redirectTo: 'add-stock', pathMatch: 'full'},
  { path: 'add-stock', component:  AddStockComponent},
  { path: 'dispatch', component:  DispatchComponent},
  { path: 'dispatch-history', component:  DispatchHistoryComponent},
  { path: 'finish-goods', component:  FinishGoodsComponent},
  { path: 'stock-history', component:  StockHistoryComponent},
  { path: 'view', component:  ViewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryRoutingModule } from './inventory-routing.module';
import { AddStockComponent } from './add-stock/add-stock.component';
import { ViewComponent } from './view/view.component';
import { StockHistoryComponent } from './stock-history/stock-history.component';
import { FinishGoodsComponent } from './finish-goods/finish-goods.component';
import { DispatchComponent } from './dispatch/dispatch.component';
import { DispatchHistoryComponent } from './dispatch-history/dispatch-history.component';
import { SharedModule } from '../shared/shared/shared.module';


@NgModule({
  declarations: [
    AddStockComponent,
    ViewComponent,
    StockHistoryComponent,
    FinishGoodsComponent,
    DispatchComponent,
    DispatchHistoryComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule
  ]
})
export class InventoryModule { }

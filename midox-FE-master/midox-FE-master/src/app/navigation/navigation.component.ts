import { Component } from '@angular/core';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  constructor(private common: CommonService){
  }
  stockHistoryClick(){
    this.common.isStockHistoryClick.next(true);
  }
}

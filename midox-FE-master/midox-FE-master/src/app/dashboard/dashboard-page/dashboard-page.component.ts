import { Component, ViewChild, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartDataset, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  showSpinner:boolean = true;

  ngOnInit(){
    setTimeout(() => {
      this.showSpinner = false
    }, 2000);
  }
  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top'
      },
      datalabels: {
        color: '#fff',
        formatter: (value:any, ctx:any) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [ [ 'Flopped' , '(3000)'], [ 'Booked' , '2000']],
    datasets: [ {
      data: [ 300, 500 ],
      //borderColor: '#36A2EB',
      backgroundColor: ['#919ee5', '#3F51B5'],
    } ]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ DatalabelsPlugin ];

  // events
  public chartClicked({ event, active }: { event: ChartEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: ChartEvent, active: {}[] }): void {
    console.log(event, active);
  }

  //bar chart
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        min: 10
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: 'end',
        align: 'end'
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [
    DatalabelsPlugin
  ];
  public barChartData: ChartData<'bar'> = {
    labels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
    datasets: [
      { 
        data: [ 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56 ],
        backgroundColor: [
          '#3F51B5'
        ],
      },
      
    ],
    
  };
  public barBundleChartData: ChartData<'bar'> = {
    labels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
    datasets: [
      { 
        data: [ 51, 26, 20, 18, 16, 51, 26, 20, 18, 16, 18, 22],
        backgroundColor: [
          '#3F51B5'
        ],
      },
      
    ],
    
  };
  
  public barChartLabels: any[] = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

  public barStackedChartData: ChartDataset[] = [
    { data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56], label: 'Series A', stack: 'a', backgroundColor: ['#919ee5'] },
    { data: [28, 48, 40, 19, 65, 59, 80, 81, 56, 86, 27, 90], label: 'Series B', stack: 'a' , backgroundColor: ['#3F51B5'],}
  ];
  
}

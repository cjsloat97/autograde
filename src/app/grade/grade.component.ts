import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.css']
})
export class GradeComponent implements OnInit {
  
  headElements = ['Topic', 'QQ1', 'QQ2', 'QQ3','QQ4','QQ5','QQ6','QQ7',
    'QQ8','QQ9','QQ10','QQ11','QQ12','QQ13','QQ14','QQ15'];

  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A', fill : false },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B', fill : false },
    { data: [18, 48, 77, 90, 100, 27, 40], label: 'Series C', fill : false }
  ];
  public lineChartLabels: Label[] = ['QQ1', 'QQ2', 'QQ3','QQ4','QQ5','QQ6','QQ7',
    'QQ8','QQ9','QQ10','QQ11','QQ12','QQ13','QQ14','QQ15'];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {}
      ]
    },
    annotation: {
      annotations: [
        {},
      ],
    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;


  topics = ['Fraction Operations','Fraction-Decimal-Percent',
    'Rounding','Add Integers','Subtract Integers','Multiply Integers',
    'Divide Integers','Unit Rate','Equivalent Ratios','Percent','Evalute Expressions'
    ,'Algebra-Words Translation','Simplify Expressions','1-Step Equations','2-Step  Equations']

  student : any = {grade : []};
  admin = false;
  reg = false;

  constructor(private auth : AuthService, private route: ActivatedRoute,
     private router : Router, private user: UserService) { }
  ngOnInit() {
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message != "admin"){
          this.reg = true;
          this.user.getSomeData().subscribe(data =>{
            this.student = data;
          })
        }else if(data.message == "admin"){
          this.admin = true;
          var id = this.route.snapshot.paramMap.get("id")
          this.user.getUserData(id).subscribe(data =>{
            this.student = data;
          })
        }
      }
    })
  }

}

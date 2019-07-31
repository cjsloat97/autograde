import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ChartDataSets, ChartOptions ,LinearTickOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.css']
})
export class GradeComponent implements OnInit {

  student : any = {grade : [[10,20,30],[10,30,40],[12]]};
  grades : any = this.student.grade

  topics = ['Fraction Operations','Fraction-Decimal-Percent',
    'Rounding','Add Integers','Subtract Integers','Multiply Integers',
    'Divide Integers','Unit Rate','Equivalent Ratios','Percent','Evalute Expressions'
    ,'Algebra-Words Translation','Simplify Expressions','1-Step Equations','2-Step  Equations']
  
  headElements = ['Topic', 'QQ1', 'QQ2', 'QQ3','QQ4','QQ5','QQ6','QQ7',
    'QQ8','QQ9','QQ10','QQ11','QQ12','QQ13','QQ14','QQ15'];

  public lineChartData: ChartDataSets[] = [
    { data: this.grades[0],lineTension: 0, label: this.topics[0], fill : false }
  ];

  xAxisTickOptions: LinearTickOptions = {
    min: 0,
    stepSize: 25,
    max : 100
  };

  public lineChartLabels: Label[] = ['QQ1', 'QQ2', 'QQ3','QQ4','QQ5','QQ6','QQ7',
    'QQ8','QQ9','QQ10','QQ11','QQ12','QQ13','QQ14','QQ15'];
  
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [{
        ticks: this.xAxisTickOptions
        }]
    },
    annotation: {
      annotations: [{},],
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

  @ViewChild(BaseChartDirective, { static: true }) public chart: BaseChartDirective;
  

  admin = false;
  reg = false;

  constructor(private auth : AuthService, private route: ActivatedRoute,
     private router : Router, private user: UserService) { }

  updateGraph(){
    this.lineChartData = [
      { data: this.grades[0],lineTension: 0, label: this.topics[0], fill : false },
      { data: this.grades[1],lineTension: 0, label: this.topics[1], fill : false },
      { data: this.grades[2],lineTension: 0, label: this.topics[2], fill : false },
      { data: this.grades[3],lineTension: 0, label: this.topics[3], fill : false },
      { data: this.grades[4],lineTension: 0, label: this.topics[4], fill : false },
      { data: this.grades[5],lineTension: 0, label: this.topics[5], fill : false },
      { data: this.grades[6],lineTension: 0, label: this.topics[6], fill : false },
      { data: this.grades[7],lineTension: 0, label: this.topics[7], fill : false },
      { data: this.grades[8],lineTension: 0, label: this.topics[8], fill : false },
      { data: this.grades[9],lineTension: 0, label: this.topics[9], fill : false },
      { data: this.grades[10],lineTension: 0, label: this.topics[10], fill : false },
      { data: this.grades[11],lineTension: 0, label: this.topics[11], fill : false },
      { data: this.grades[12],lineTension: 0, label: this.topics[12], fill : false },
      { data: this.grades[13],lineTension: 0, label: this.topics[13], fill : false },
      { data: this.grades[14],lineTension: 0, label: this.topics[14], fill : false }
    ];
    this.chart.chart.update()
  }

  first(){
    this.grades = this.student.grade
    this.updateGraph()
  }

  correct(){
    this.grades = this.student.correct
    this.updateGraph()
  }

  ngOnInit() {
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message != "admin"){
          this.reg = true;
          this.user.getUser().subscribe(data =>{
            this.student = data;
            this.grades = this.student.grade
            this.updateGraph()
          })
        }else if(data.message == "admin"){
          this.admin = true;
          var id = this.route.snapshot.paramMap.get("id")
          this.user.getUserData(id).subscribe(data =>{
            this.student = data;
            this.grades = this.student.grade
            this.updateGraph()
          })
        }
      }
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.css']
})
export class GradeComponent implements OnInit {

  headElements = ['Topic', 'QQ1', 'QQ2', 'QQ3','QQ4','QQ5','QQ6','QQ7',
    'QQ8','QQ9','QQ10','QQ11','QQ12','QQ13','QQ14','QQ15'];

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

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

  student : any = {grade : []};
  admin = false;
  reg = false;

  constructor(private auth : AuthService, private route: ActivatedRoute, private router : Router, private user: UserService) { }
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

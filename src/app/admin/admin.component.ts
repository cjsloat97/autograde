import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {
  students : any = [{ id: 0, name :"Placeholder", grade : 0}];

  constructor(private auth : AuthService, private router : Router, private user: UserService) { }

  ngOnInit() { //On init, check to make sure user is admin, then get all students info
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message == "admin"){
          this.user.getSomeData().subscribe(data =>{
            this.students = data
          })
        }else{
          this.router.navigate(['login'])
        }
      }
    })
  }
  
}

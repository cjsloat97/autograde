import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  student : any = { id: 0, name :"Placeholder", grade : 0};

  constructor(private auth : AuthService, private router : Router, private user: UserService) { }

  ngOnInit() { //Just makes sure user is logged in
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message != "admin"){
          this.user.getUser().subscribe(data =>{
            this.student = data;
          })
        }else{
          this.router.navigate(['login'])
        }
      }
    })
  }
}

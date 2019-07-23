import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service'
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private Auth: AuthService,
     private router: Router,
     private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: [''],
      password: ['']
  });
  }

  get f() { return this.loginForm.controls; }

  //Function responsible for setting up data for post request in
    //order to log in
  onSubmit() {
    const username = this.f.username.value
    const password = this.f.password.value
    this.Auth.getUserDetails(username, password).subscribe(data =>{
      if (data.success){
        if (data.message == "admin"){
          this.router.navigate(['admin'])
        }else{
          this.router.navigate(['user'])
        }
      }else{
        window.alert(data.message)
      }
    })
  }

}

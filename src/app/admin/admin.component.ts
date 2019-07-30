import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { FormGroup ,FormBuilder  } from '@angular/forms';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {
  registerForm: FormGroup;
  students : any = [{ id: 0, name :"Placeholder", grade : 0}];
  headElements = ['Name','ID','Quiz','',''];
  period : any;
  periodID : any;

  constructor(private auth : AuthService,
     private router : Router,
     private formBuilder: FormBuilder,
      private user: UserService) { }

  ngOnInit() { //On init, check to make sure user is admin, then get all students info
    this.registerForm = this.formBuilder.group({
      name: [''],
      period: ['']
    });
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message == "admin"){
          this.user.getUser().subscribe(data =>{
            this.period = data.period.answers
            this.students = data.students
            this.periodID = this.period[0]
          })
        }else{
          this.router.navigate(['login'])
        }
      }
    })
  }

  get f() { return this.registerForm.controls; }

  onSubmit(){
    const name = this.f.name.value
    const period = this.f.period.value
    console.log(period)
    this.user.register(name,period).subscribe(() =>
     this.updateList());
  }

  registerUser(event) {
    const target = event.target
    const username = "blank"
    const period = target.querySelector('#period').value
    this.user.register(username,period).subscribe(() =>
      this.updateList());
  }

  removeStudent(userID){
    this.user.delete(userID).subscribe(() =>
      this.updateList());
  }

  updateList(){
    this.user.getUser().subscribe(data =>{
      this.students = data.students
    })
  }

  lastPeriod(){
    var index = this.period.indexOf(this.periodID)
    index -= 1
    if (index == -1){
      index = this.period.length - 1
    }
    this.periodID = this.period[index]
  }

  nextPeriod(){
    var index = this.period.indexOf(this.periodID)
    index += 1
    if (index == this.period.length){
      index = 0
    }
    this.periodID = this.period[index]
  }

  advanceDay(){
    this.user.advance().subscribe(data =>{
      window.alert(data.message)
      this.updateList();  
    })

  }
  
}

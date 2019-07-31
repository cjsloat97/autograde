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
  periodList : any;
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
            this.periodList = data.period.answers
            this.students = data.students
            this.periodID = this.periodList[0]
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
    var period = this.f.period.value
    if(!period){
      period = this.periodList[0]
    }
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
    var index = this.periodList.indexOf(this.periodID)
    index -= 1
    if (index == -1){
      index = this.periodList.length - 1
    }
    this.periodID = this.periodList[index]
  }

  nextPeriod(){
    var index = this.periodList.indexOf(this.periodID)
    index += 1
    if (index == this.periodList.length){
      index = 0
    }
    this.periodID = this.periodList[index]
  }

  advanceDay(){
    this.user.advance().subscribe(data =>{
      window.alert(data.message)
      this.updateList();  
    })

  }
  
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { TestService } from '../test.service';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  
  //Placeholders
  answers:any ={};
  submitted = false
  grade = 0;

  currTest:any = { 
      id : 0,
      test: [{id : "ans.q1" ,question: "Placeholder", a : 1, b : 2, c : 3, d : 4}],
      correct : "a"
    }

  constructor(private auth : AuthService, private router : Router, private user: UserService, private test : TestService) { }

  ngOnInit() { //Makes sure users are logged
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message != "admin"){
          this.test.retrieveTest().subscribe(data =>{
            this.currTest = data;
          })
        }else{
          this.router.navigate(['login'])
        }
      }
    })
  }

  onSubmit(){ //Need some data formatting before submitting
    var submitData = [];
    var i;
    for (i = 1; i < 5; i++) { 
      submitData.push(this.answers[i])
    }
    this.test.submitToGrade(submitData,this.currTest.id).subscribe(data =>
      this.grade = data.grade)

    this.submitted = true;
  }

}

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
  quiz = "00";
  corrected = false;
  next = false;
  submitted = false;
  grade = 0;
  queue : Array<String>;

  currTest:any = { 
      id : 0,
      test: [{id : "ans.q1" ,question: "Placeholder", a : 1, b : 2, c : 3, d : 4}],
      correct : "a"
    }

  constructor(private auth : AuthService, private router : Router, private user: UserService, private test : TestService) { }

  ngOnInit() { //Makes sure users are logged
    this.updateTest();
  }

  updateTest(){
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message != "admin"){
          this.queue = data.queue;
          if (data.queue.length != 0){ 
            this.quiz = data.queue[0][0] + ',' + data.queue[0][1];
          }else{
            this.quiz = data.quiz[0] + ',' + data.quiz[1];
          }
        }else{
          this.router.navigate(['login'])
        }
      }
    })
  }

  onNext(){
    this.updateTest();
    if (this.queue.length != 0){
      this.next = false;
      this.corrected = false;
      this.submitted = false;
      this.grade = 0;
      window.alert("You are behind, the next quiz will be displayed")
    }else{
      window.alert("You are all caught up!")
    }
  }

  onSubmit(event){ //Need some data formatting before submitting
    event.preventDefault()
    const target = event.target
    var answers = [target.querySelector('#q1').value,target.querySelector('#q2').value,target.querySelector('#q3').value,target.querySelector('#q4').value]
    this.test.submitToGrade(answers,this.quiz).subscribe(data =>{
      if(data.grade == true){
        this.grade = 100
        this.next = true
      }else{
        this.grade = data.grade
        if(this.grade == 100)
          this.next = true
        this.corrected = data.corrected
      }
    })

    this.submitted = true;
  }

}

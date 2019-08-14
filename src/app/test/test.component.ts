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
  quiz = "0,0";
  corrected = false;
  next = false;
  submitted = false;
  grade = 0;
  queue: Array<String>;
  firstTime = false;
  oldAverage : Number;

  currTest: any = {
    id: 0,
    test: [{ id: "ans.q1", question: "Placeholder", a: 1, b: 2, c: 3, d: 4 }],
    correct: "a"
  }

  constructor(private auth: AuthService, private router: Router, private user: UserService, private test: TestService) { }

  ngOnInit() { //Makes sure users are logged
    this.updateTest();
  }

  updateTest() {
    this.auth.checkLogged().subscribe(data => {
      if (data.success === false) {
        this.router.navigate(['login'])
      } else {
        if (data.message != "admin") {
          this.queue = data.queue;
          if (data.queue.length != 0) {
            this.quiz = data.queue[0][0] + ',' + data.queue[0][1];
          } else {
            this.quiz = data.quiz[0] + ',' + data.quiz[1];
          }
          this.oldAverage = data.average
          var idParse = this.quiz.split(",")
          var testCat = parseInt(idParse[0]); //Which topic
          var testNum = parseInt(idParse[1]); //Which number
          if(!data.grades[testCat][testNum] == null){
            this.firstTime = true;
          }else{
            this.firstTime = false;
          }
        } else {
          this.router.navigate(['login'])
        }
      }
    })
  }

  onNext() {
    this.updateTest();
    if (this.queue.length != 0) {
      this.next = false;
      this.corrected = false;
      this.submitted = false;
      this.grade = 0;
      window.alert("You are behind, the next quiz will be displayed")
    } else {
      window.alert("You are all caught up!")
      this.router.navigate(['grade'])
    }
  }

  onSubmit(event) { //Need some data formatting before submitting
    event.preventDefault()
    if (confirm("Are you sure to submit?")) {
      this.firstTime = false
      const target = event.target
      var answers = [target.querySelector('#q1').value, target.querySelector('#q2').value, target.querySelector('#q3').value, target.querySelector('#q4').value]
      this.test.submitToGrade(answers, this.quiz).subscribe(data => {
        if (data.grade == true) {
          this.grade = 100
          this.next = true
          window.alert("You have already achieved a perfect score on this quiz") 
        } else {
          this.grade = data.grade
          if (this.grade == 100)
            this.next = true
          this.corrected = data.corrected
          window.alert("Your average has changed from" + this.oldAverage + "->" + data.average)
        }
      })
      this.submitted = true;
      this.updateTest();
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  //Check server.js on all service files for more

  constructor(private http: HttpClient) { }

  retrieveTest() { //Gets the test
    return this.http.get<any>('/test',
    {withCredentials: true})
  }

  submitToGrade(answers, testID) {//Gets teh grade
    return this.http.post<any>('/grader',{
      answers,
      testID
    },
    {withCredentials : true})
  }
  
}

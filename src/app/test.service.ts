import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//const url = ''
const url = 'http://localhost:5000'

@Injectable({
  providedIn: 'root'
})
export class TestService {

  //Check server.js on all service files for more

  constructor(private http: HttpClient) { }

  
  submitToGrade(answers, testID) {//Gets teh grade
    return this.http.post<any>(url + '/api/grader',{
      answers,
      testID
    },
    {withCredentials : true})
  }
  
}

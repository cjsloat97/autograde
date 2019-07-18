import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


//const url = ''
const url = 'http://localhost:5000'

@Injectable({
  providedIn: 'root'
})

//Check server.js on all service files for more

export class AuthService {

  constructor(private http: HttpClient) { }
  //Makes sure the user is logged in
  checkLogged(){
    return this.http.get<any>(url + '/api/check', {withCredentials: true});
  }


  getUserDetails(username, password) {
    // post these details to API server, return user info if correct
    return this.http.post<any>(url + '/api/login',{
      username,
      password
    },{withCredentials: true})
  }
}

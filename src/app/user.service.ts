import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


const url = ''
//const url = 'http://localhost:5000'

@Injectable({
  providedIn: 'root'
})

//Check server.js on all service files for more

export class UserService {

  constructor(private http: HttpClient) { }

  getUser() { //Get all users or specific user based on cookie
    return this.http.get<any>(url + '/api/database',
    {withCredentials: true})
  }

  getUserData(userID) { //Get data of user based on userID
    return this.http.get<any>(url + '/api/database/' + userID,
    {withCredentials: true})
  }

  register(username,period) {
    return this.http.post(url + '/api/database',{
      username,
      period
    },
    {withCredentials: true})
  }

  delete(userID) {
    return this.http.delete(url + '/api/database/' + userID,
    {withCredentials: true})
  }

  advance() {
    return this.http.post<any>(url + '/api/advance',
    {},
    {withCredentials: true})
  }
}

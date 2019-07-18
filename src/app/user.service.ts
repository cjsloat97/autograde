import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


//const url = ''
const url = 'http://localhost:5000'

@Injectable({
  providedIn: 'root'
})

//Check server.js on all service files for more

export class UserService {

  constructor(private http: HttpClient) { }

  getSomeData() { //Better name
    return this.http.get(url + '/api/database',
    {withCredentials: true})
  }

  register(username) {
    return this.http.post(url + '/api/database',{
      username
    },
    {withCredentials: true})
  }

  delete(userID) {
    return this.http.delete(url + '/api/database/' + userID,
    {withCredentials: true})
  }

  advance() {
    return this.http.post<any>(url + '/api/advance/',
    {},
    {withCredentials: true})
  }
}

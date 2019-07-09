import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})

//Check server.js on all service files for more

export class UserService {

  constructor(private http: HttpClient) { }

  getSomeData() { //Better name
    return this.http.get('/database',
    {withCredentials: true})
  }
}

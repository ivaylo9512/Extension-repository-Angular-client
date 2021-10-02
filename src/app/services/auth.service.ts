import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn : boolean
  isAdmin : boolean
  id : number
  username : string

  constructor(private httpClient : HttpClient, private router : Router) { 
    if(localStorage.getItem('user') && localStorage.getItem('Authorization')){
      const user = JSON.parse(localStorage.getItem('user'))
      this.isLoggedIn = true
      this.isAdmin = user.role === 'ROLE_ADMIN'
      this.id = user.id
      this.username = user.username
    }else{
      this.isLoggedIn = false
      this.isAdmin = false
      this.id = 0
    }
  }

  login(username : string, password : string) : Observable<HttpResponse<User>> {
    return this.httpClient.post<User>('/api/users/login', {
      username,
      password,
    },{
      observe: 'response'
    })
  }

  logout() {
    localStorage.removeItem('Authorization')
    localStorage.removeItem('user')
    this.isLoggedIn = false
    this.isAdmin = false
    this.router.navigate(['login'])
  }
  
  setUserDetails(user){
    this.isLoggedIn = true
    this.isAdmin = user.role === 'ROLE_ADMIN'
    this.username = user.username
    this.id = user.id
  }
}


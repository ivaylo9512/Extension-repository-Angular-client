import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'

export interface User{
  id : number,
  username : string,
  extensions : any[],
  active : boolean,
  rating : number,
  extensionsRated : number,
  profileImage : string,
  country : string,
  info : string,
  totalExtensions : number
}

export interface Settings{
  id: number,
  rate: number,
  wait: number,
  git_token: string,
  git_username: string
}

interface Page {
  data: User[],
  totalResults: number
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient : HttpClient) { }

  getUser(id : number){
    return this.httpClient.get<User>(`/api/users/findById/${id}`)
  }

  findAll(pageSize : number, name : string, isActive? : boolean, lastName? : string){
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('name', name);

      if(isActive != undefined){
        params = params.set('isActive', isActive.toString())
      }

      if(lastName){
        params = params.set('lastName', lastName)
      }

    return this.httpClient.get<Page>(`/api/users/auth/findAll`, { params })
  }

  getGithubSettings(){
    return this.httpClient.get<Settings>('/api/github/auth/getSettings')
  }

  setGithubSettings(github){
    return this.httpClient.post('/api/github/auth', github)
  }

  setActive(id : number, isActive : boolean){
    return this.httpClient.patch<User>(`/api/users/auth/setActive/${id}/${isActive}`, null)
  }

  changePassword(password : string, repeatPassword : string){
    this.httpClient.patch('/api/users/auth/changePassword',{
      password,
      repeatPassword
    })
  }

  register(formData : FormData) {
    return this.httpClient.post<User>('/api/users/register', formData)
  }
}

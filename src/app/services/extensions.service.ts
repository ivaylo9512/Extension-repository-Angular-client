import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Extension {
  id: number,
  name: string,
  version: string,
  description: string,
  timesDownloaded: number,
  isPending: boolean,
  isFeatured: boolean,
  ownerName: string,
  ownerId: number,
  gitHubLink: string,
  githubId: number,
  lastCommit: string,
  uploadDate: string,
  openIssues: number,
  pullRequests: number,
  lastSuccessfulPullOfData: string,
  lastFailedAttemptToCollectData: string,
  lastErrorMessage: string,
  fileLocation: string,
  imageLocation: string,
  coverLocation: string,
  tags: string[],
  rating: number,
  timesRated: number,
  currentUserRatingValue: number
}

interface Page {
  data: Extension[],
  totalResults: number
}

@Injectable({
  providedIn: 'root'
})

export class ExtensionsService {
  currentExtension : Extension
  
  constructor(private httpClient : HttpClient) { 
    this.currentExtension = undefined
  }

  findUserExtensions(pageSize : number, lastId? : number){
    return this.httpClient.get<Page>(`/api/extensions/auth/findUserExtensions/${pageSize}/${lastId ? lastId : ''}`)
  }
  findPendings(pageSize : number, lastId? : number){
    return this.httpClient.get<Page>(`/api/extensions/auth/findPending/true/${pageSize}/${lastId ? lastId : ''}`)
  }
  findByTag(name : string, pageSize : number, lastId? : number){
    return this.httpClient.get<any>(`/api/extensions/findByTag/${name}/${pageSize}/${lastId ? lastId : ''}`)
  }
  getFeatured(){
    return this.httpClient.get<Extension[]>('/api/extensions/featured')
  }
  getExtension(id : number){
    return this.httpClient.get<Extension>(`/api/extensions/${id}`)
  }

  editExtension(id : number, formData){
    return this.httpClient.post<Extension>(`/api/extensions/auth/edit`, formData)
  }
  createExtension(formData){
    return this.httpClient.post<Extension>('/api/extensions/auth/create', formData)
  }
  checkName(name : string){
    const params = new HttpParams().set('name', name)
    return this.httpClient.get('/api/extensions/checkName', {params})
  }
  checkGithub(gitHub : string){
    const params = new HttpParams().set('link', gitHub)
    return this.httpClient.get('/api/github/getRepoDetails', {params})
  }
  getExtensions(name : string, criteria : string, page : string, perPage : string){
    const params = new  HttpParams().set('name', name).set('orderBy', criteria).set('page', page).set('perPage', perPage)
    return this.httpClient.get<any>('/api/extensions/filter', {params})                                          
  }
  setFeatureState(id : number, state : string){
    return this.httpClient.patch<Extension>(`/api/extensions/auth/${id}/featured/${state}`, null)
  }
  setPublishState(id : number, state : string){
    return this.httpClient.patch<Extension>(`/api/extensions/auth/${id}/status/${state}`, null)
  }
  deleteExtension(id : number){
    return this.httpClient.delete(`/api/extensions/auth/${id}`)
  }
  refreshGitHub(id : number){
    return this.httpClient.patch(`/api/github/auth/${id}/fetch`,null)
  }
  rateExtension(id : number, rating : string){
    return this.httpClient.patch(`/api/rating/auth/rate/${id}/${rating}`, {})
  }
}

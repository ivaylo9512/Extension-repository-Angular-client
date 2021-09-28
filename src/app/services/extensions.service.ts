import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Extension {
  id: number,
  name: string,
  version: string,
  description: string,
  timesDownloaded: number,
  pending: boolean,
  featured: boolean,
  ownerName: string,
  ownerId: number,
  uploadDate: string,
  fileLocation: string,
  imageLocation: string,
  coverLocation: string,
  tags: string[],
  rating: number,
  timesRated: number,
  currentUserRatingValue: number,
  github: Github
}

export interface Github {
  id : number;
  pullRequests : number;
  openIssues : number;
  user : string;
  repo : string;
  failMessage : string;
  lastCommit : string;
  lastSuccess : string;
  lastFail : string;
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

  totalExtensions : Extension[]
  currentExtensions : Extension[]
  nameQuery : string
  component : string

  config = {
    itemsPerPage: 8,
    currentPage: 1,
    totalItems: null
  }
  
  constructor(private httpClient : HttpClient) { 
  }

  getNextExtensions(page : number){
    switch(this.component){
      case 'ProfileComponent' :
      case 'HomeComponent' :
        this.getNextUserExtensions(page)
      case 'PendingsComponent' :
        this.getNextPending
    }
  }

  resetExtensions() {
    this.config.currentPage = 1
    this.config.totalItems = 0
    this.totalExtensions = null
    this.currentExtensions = null
    this.nameQuery = null
  }

  getUserExtensions(){
    this.findUserExtensions(this.config.itemsPerPage).subscribe(page => {
      this.totalExtensions = this.currentExtensions = page.data
      this.config.totalItems = page.totalResults
    })
  }

  getPending() {
    this.findPendings(this.config.itemsPerPage).subscribe(page => {
      this.totalExtensions = this.currentExtensions = page.data
      this.config.totalItems = page.totalResults
    })
  }

  getNextPending(page: number){
    const length = this.totalExtensions.length
    const itemsPerPage = this.config.itemsPerPage;
    this.onPageChange(this.findPendings(itemsPerPage * (page - length / itemsPerPage), this.totalExtensions[length - 1].id), page);
  }

  getNextUserExtensions(page : number){
    const length = this.totalExtensions.length
    const itemsPerPage = this.config.itemsPerPage;
    this.onPageChange(this.findUserExtensions(itemsPerPage * (page - length / itemsPerPage), this.totalExtensions[length - 1].id), page)
  }

  onPageChange(request : Observable<Page>, page : number) {
    const length = this.totalExtensions.length
    const itemsPerPage = this.config.itemsPerPage;

    if(length <= (page - 1) * itemsPerPage){
      request.subscribe(pageData => {
        this.setExtensions(pageData, page)
      })
    }else{
      this.currentExtensions = this.totalExtensions.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      this.config.currentPage = page;
    }
  }

  setExtensions(pageData : Page, page : number){
    this.config.totalItems = this.totalExtensions.length + pageData.totalResults
    this.totalExtensions.push(...pageData.data)
    this.currentExtensions = this.totalExtensions.slice((page - 1) * this.config.itemsPerPage, page * this.config.itemsPerPage)
    this.config.currentPage = page;
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
  findExtensions(name : string, criteria : string, page : string, perPage : string){
    const params = new  HttpParams().set('name', name).set('orderBy', criteria).set('page', page).set('perPage', perPage)
    return this.httpClient.get<any>('/api/extensions/filter', {params})                                          
  }
  setFeatured(id : number, state : boolean){
    return this.httpClient.patch<Extension>(`/api/extensions/auth/${id}/featured/${state}`, null)
  }
  setPending(id : number, state : boolean){
    return this.httpClient.patch<Extension>(`/api/extensions/auth/${id}/status/${state}`, null)
  }
  deleteExtension(id : number){
    return this.httpClient.delete(`/api/extensions/auth/${id}`)
  }
  refreshGitHub(id : number){
    return this.httpClient.patch<Github>(`/api/github/auth/${id}/fetch`,null)
  }
  rateExtension(id : number, rating : number){
    return this.httpClient.patch<number>(`/api/rating/auth/rate/${id}/${rating}`, {})
  }
}

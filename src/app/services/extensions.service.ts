import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type Extension = {
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

export type Github = {
  id : number
  pullRequests : number
  openIssues : number
  user : string
  repo : string
  failMessage : string
  lastCommit : string
  lastSuccess : string
  lastFail : string
}

type Page = {
  data: Extension[],
  totalResults: number
}

type PageConfig = {
  itemsPerPage: number,
  currentPage: number,
  page? : number,
  nextPage? : number,
  subscription? : Subject<void>,
  totalItems?: number,
  isLoading : boolean
}

@Injectable({
  providedIn: 'root'
})

export class ExtensionsService {
  currentExtension : Extension

  totalExtensions : Extension[]
  currentExtensions : Extension[]
  nameQuery : string
  orderBy : string
  component : string

  config : PageConfig= {
    itemsPerPage: 8,
    currentPage: 1,
    totalItems: null,
    nextPage: null,
    subscription: null,
    isLoading: false
  }
  
  constructor(private httpClient : HttpClient) { 
  }

  getNextExtensions(page : number, subscription : Subject<void>){
    this.config.nextPage = page
    this.config.subscription = subscription
  
    let request = (() : (pageSize : number) => Observable<Page> => { switch(this.component){
      case 'ProfileComponent' : return this.findUserExtensions
      case 'HomeComponent' : return this.findUserExtensions
      case 'PendingsComponent' : return this.findAllByPendings
      case 'TagsComponent' : return this.findAllByTag
      case 'DiscoverComponent' : return this.decideAllOrderBy()
    }})()
    
    this.onPageChange(request)
  }

  resetExtensions() {
    this.config.currentPage = null
    this.config.totalItems = null
    this.totalExtensions = []
    this.currentExtensions = []
    this.nameQuery = null
    this.config.isLoading = false
  }

  getUserExtensions(subscription : Subject<void>){
    this.findUserExtensions(this.config.itemsPerPage).pipe(takeUntil(subscription)).subscribe(page => {
      this.totalExtensions = this.currentExtensions = page.data
      this.config.totalItems = page.totalResults
    })
  }

  getAll(subscription : Subject<void>){
    this.decideAllOrderBy()(this.config.itemsPerPage).pipe(takeUntil(subscription)).subscribe(page => {
      this.totalExtensions = this.currentExtensions = page.data
      this.config.totalItems = page.totalResults
    })
  }

  getPending(subscription : Subject<void>) {
    this.findAllByPendings(this.config.itemsPerPage).pipe(takeUntil(subscription)).subscribe(page => {
      this.totalExtensions = this.currentExtensions = page.data
      this.config.totalItems = page.totalResults
    })
  }

  getByTag(subscription : Subject<void>){
    this.findAllByTag(this.config.itemsPerPage).pipe(takeUntil(subscription)).subscribe(page => {
      this.totalExtensions = this.currentExtensions = page.data
      this.config.totalItems = page.totalResults
    })
  }

  decideAllOrderBy = () : (pageSize : number) => Observable<Page> => {
    switch(this.orderBy){
      case 'name' : return this.findAllByName
      case 'commits' : return this.findAllByCommitDate
      case 'downloads' : return this.findAllByDownloads
      case 'date' : return this.findAllByUploadDate
    }
  }

  onPageChange(request : (pageSize : number) => Observable<Page>) {
    const page = this.config.nextPage
    const length = this.totalExtensions.length
    const itemsPerPage = this.config.itemsPerPage

    if(length <= (page - 1) * itemsPerPage){
      this.config.isLoading = true
      this.currentExtensions = []
      request(itemsPerPage * (page - length / itemsPerPage)).pipe(takeUntil(this.config.subscription)).subscribe(pageData => {
        this.setExtensions(pageData)
      })
    }else{
      this.currentExtensions = this.totalExtensions.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      this.config.currentPage = page
    }
  }

  setExtensions(pageData : Page){
    const page = this.config.nextPage

    this.config.totalItems = this.totalExtensions.length + pageData.totalResults
    this.totalExtensions.push(...pageData.data)
    this.currentExtensions = this.totalExtensions.slice((page - 1) * this.config.itemsPerPage, page * this.config.itemsPerPage)
    
    this.config.currentPage = page
    this.config.isLoading = false
  }

  findUserExtensions = (pageSize : number) : Observable<Page> => {
    let lastIdParam = this.config.totalItems ? this.totalExtensions[this.totalExtensions.length - 1].id : ''
    
    return this.httpClient.get<Page>(`/api/extensions/auth/findUserExtensions/${pageSize}/${lastIdParam}`)
  }
  findAllByPendings = (pageSize : number) : Observable<Page> => {
    let lastIdParam = this.config.totalItems ? this.totalExtensions[this.totalExtensions.length - 1].id : ''
    return this.httpClient.get<Page>(`/api/extensions/auth/findPending/true/${pageSize}/${lastIdParam}`)
  }
  findAllByTag = (pageSize : number) : Observable<Page> => {
    let lastIdParam = this.config.totalItems ? this.totalExtensions[this.totalExtensions.length - 1].id : ''
    return this.httpClient.get<Page>(`/api/extensions/findByTag/${this.nameQuery}/${pageSize}/${lastIdParam}`)
  }
  findAllByName = (pageSize : number) : Observable<Page> => {
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())

    if(this.nameQuery){
      params = params.set('name', this.nameQuery)
    }
    if(this.config.totalItems){
      params = params.set('lastName', this.totalExtensions[this.totalExtensions.length - 1].name)
    }

    return this.httpClient.get<Page>('/api/extensions/findAllByName', { params })
  }
  findAllByCommitDate = (pageSize : number) : Observable<Page> => {
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())

    if(this.nameQuery){
      params = params.set('name', this.nameQuery)
    }

    if(this.config.totalItems){
      params = params
        .set('lastDate', this.totalExtensions[this.totalExtensions.length - 1].github.lastCommit)
        .set('lastId', this.totalExtensions[this.totalExtensions.length - 1].id.toString())
    }

    return this.httpClient.get<Page>('/api/extensions/findAllByCommitDate', { params })
  }
  findAllByUploadDate = (pageSize : number) : Observable<Page> => {
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())

    if(this.nameQuery){
      params = params.set('name', this.nameQuery)
    }

    if(this.config.totalItems){
      params = params
        .set('lastDate', this.totalExtensions[this.totalExtensions.length - 1].uploadDate)
        .set('lastId', this.totalExtensions[this.totalExtensions.length - 1].id.toString())
    }

    return this.httpClient.get<Page>('/api/extensions/findAllByUploadDate', { params })
  }
  findAllByDownloads = (pageSize : number) : Observable<Page> => {
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())

    if(this.nameQuery){
      params = params.set('name', this.nameQuery)
    }

    if(this.config.totalItems){
      params = params
        .set('lastDownloadCount', this.totalExtensions[this.totalExtensions.length - 1].timesDownloaded.toString())
        .set('lastId', this.totalExtensions[this.totalExtensions.length - 1].id.toString())
    }

    return this.httpClient.get<Page>('/api/extensions/findAllByDownloadCount', { params })
  }
  getFeatured() : Observable<Extension[]>{
    return this.httpClient.get<Extension[]>('/api/extensions/featured')
  }
  getExtension(id : number) : Observable<Extension>{
    return this.httpClient.get<Extension>(`/api/extensions/${id}`)
  }
  editExtension(id : number, extensionForm : FormData) : Observable<Extension>{
    return this.httpClient.post<Extension>(`/api/extensions/auth/edit`, extensionForm)
  }
  createExtension(extensionForm : FormData) : Observable<Extension> {
    return this.httpClient.post<Extension>('/api/extensions/auth/create', extensionForm)
  }
  checkName(name : string) : Observable<boolean>{
    const params = new HttpParams().set('name', name)
    return this.httpClient.get<boolean>('/api/extensions/checkName', {params})
  }
  checkGithub(gitHub : string){
    const params = new HttpParams().set('link', gitHub)
    return this.httpClient.get('/api/github/getRepoDetails', {params})
  }
  setFeatured(id : number, state : boolean) : Observable<Extension>{
    return this.httpClient.patch<Extension>(`/api/extensions/auth/${id}/featured/${state}`, null)
  }
  setPending(id : number, state : boolean) : Observable<Extension>{
    return this.httpClient.patch<Extension>(`/api/extensions/auth/${id}/status/${state}`, null)
  }
  deleteExtension(id : number){
    return this.httpClient.delete(`/api/extensions/auth/${id}`)
  }
  refreshGitHub(id : number) : Observable<Github> {
    return this.httpClient.patch<Github>(`/api/github/auth/${id}/fetch`,null)
  }
  rateExtension(id : number, rating : number) : Observable<number> {
    return this.httpClient.patch<number>(`/api/rating/auth/rate/${id}/${rating}`, {})
  }
}

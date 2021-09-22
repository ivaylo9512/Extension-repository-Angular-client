import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { UserService } from '../services/user.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  @ViewChildren('userDescriptions') userDescriptions : QueryList<any>

  githubSettings : FormGroup

  config = {
    itemsPerPage: 15,
    currentPage: 1,
    totalItems: null
  }
  github : any
  users : any[]
  foundUsers : any[]
  search: FormControl
  baseUrl: string

  constructor(private userService : UserService, private fb: FormBuilder) {
    this.users = undefined
    this.foundUsers = undefined
    this.github = undefined
    this.search = new FormControl()
    this.baseUrl = environment.baseUrl

    this.githubSettings = this.fb.group({
      username: [''],
      token: [''],
      wait: [''],
      rate: ['']
    });
  }

  ngOnInit() {
    this.getUsers('all')
    this.getGithubSettings()

    this.search.valueChanges.pipe(debounceTime(200)).subscribe(result => this.findUsers(result))
    
  }

  findUsers(result : string){
    this.users = this.foundUsers.filter(user => user.username.toLowerCase().startsWith(result.toLowerCase()))
    this.config.totalItems = this.users.length
  }

  setGithubSettings(){
    this.userService.setGithubSettings(this.githubSettings.value).subscribe(data => this.githubSettings.setValue(data))
  }

  getGithubSettings(){
    this.userService.getGithubSettings().subscribe(data => {
      const {id, ...githubSettings} = data
      this.githubSettings.setValue(githubSettings)
    })
  }

  changeCriteria(value){
    this.getUsers(value.target.value)
  }

  getUsers(state : string){
    this.userService.getAllByState(state).subscribe(data =>{
      this.users = data
      this.foundUsers = data
      this.config.totalItems = data.length
    })
  }

  setState(user, e){
    e.stopPropagation()
    const state = user.isActive ? 'block' : 'enable'
    this.userService.setState(user.id, state).subscribe(data =>{
      user.isActive = data.isActive
    })
  }
  
  ngAfterViewInit() {
    this.userDescriptions.changes.subscribe(descriptions => {
      descriptions.toArray().forEach(description => {
      
        let height = description.nativeElement.offsetHeight
        let scrollHeight = description.nativeElement.scrollHeight
        let text = description.nativeElement.innerHTML + '...'
      
        while(height < scrollHeight){
          let words = text.split(' ')
          words.pop()
          words.pop()
          text = words.join(' ') + '...'
          
          description.nativeElement.innerHTML = text
          height = description.nativeElement.offsetHeight
          scrollHeight = description.nativeElement.scrollHeight
        }
      })
    })
  }
  
}

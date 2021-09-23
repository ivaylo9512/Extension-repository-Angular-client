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
    itemsPerPage: 16,
    currentPage: 1,
    totalItems: null
  }

  github : any
  totalUsers : any[]
  users : any[]
  search: FormControl
  baseUrl: string
  isActive?: boolean

  constructor(private userService : UserService, private fb: FormBuilder) {
    this.search = new FormControl('')
    this.baseUrl = environment.baseUrl

    this.githubSettings = this.fb.group({
      username: [''],
      token: [''],
      wait: [''],
      rate: ['']
    });
  }

  ngOnInit() {
    this.getUsers()
    this.getGithubSettings()

    this.search.valueChanges.pipe(debounceTime(200)).subscribe(result => this.getUsers())
    
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

  changeCriteria(value? : boolean){
    this.isActive = value;
    this.getUsers()
  }

  changePage(page: number){
    const length = this.totalUsers.length
    const itemsPerPage = this.config.itemsPerPage;
    const users = this.totalUsers;

    if(length <= (page - 1) * itemsPerPage){
      this.userService.findAll(itemsPerPage * (page - length / itemsPerPage), this.search.value, this.isActive, users[length - 1].username).subscribe(pageData => {
        this.config.totalItems = users.length + pageData.totalResults
        users.push(...pageData.data)
        this.users = users.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        this.config.currentPage = page;
      })
    }else{
      this.users = users.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      this.config.currentPage = page;
    }
  }

  getUsers(){
    this.userService.findAll(this.config.itemsPerPage, this.search.value, this.isActive).subscribe(page =>{
      this.users = page.data
      this.totalUsers = page.data
      this.config.totalItems = page.totalResults
    })
  }

  setActive(user, e){
    e.stopPropagation()
    this.userService.setActive(user.id, !user.active).subscribe(data =>{
      user.active = data.active
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

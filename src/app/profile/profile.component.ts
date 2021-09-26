import { Component, OnInit, ViewChildren, ElementRef, QueryList, ViewChild, ChangeDetectorRef, HostListener} from '@angular/core';
import { UserService, User } from '../services/user.service'
import { ExtensionsService, Extension } from '../services/extensions.service'
import { ActivatedRoute } from '@angular/router';
import { MouseWheelDirective } from '../helpers/mouse-wheel.directive';
import { environment } from '../../environments/environment';
import { ProfileAnimationService } from '../services/profile.animation.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  @ViewChild(MouseWheelDirective) wheelDirective: MouseWheelDirective
 
  onResize() {
    this.handleExtensionsDescription(this.extensionDescriptions)
    this.handleUserInfo(this.userInfo)
  }

  loggedUser: any
  user: User
  extensions: Extension[]
  admin: boolean
  homeComponent: boolean
  baseUrl: string

  @ViewChildren('extensionDescriptions') extensionDescriptions: QueryList<any>
  @ViewChildren('userInfo') userInfo: QueryList<any>
  @ViewChild('extensionsContainer') extensionsContainer: ElementRef
  @ViewChild('profileSection') profileSection: ElementRef
  
  homeAnimation = {
    diplay : false,
    animate : false

  }
  config = {
    itemsPerPage: 8,
    currentPage: 1,
    totalItems: null
  }

  constructor(private userService: UserService, private extensionsService: ExtensionsService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private profileAnimationService: ProfileAnimationService) {
    this.baseUrl = environment.baseUrl
  }

  ngOnInit() {
    this.homeComponent = this.route.component['name'] == 'HomeComponent'
    if(!this.homeComponent){
      this.getUser(+this.route.snapshot.paramMap.get('id'));
    }else{
      this.loggedUser = JSON.parse(localStorage.getItem('user'))
      if(this.loggedUser){
        this.getUser(this.loggedUser['id'])
      }
    }
  }

  fixOverflow(node){  
    let height = node.nativeElement.offsetHeight
    let scrollHeight = node.nativeElement.scrollHeight
    let text = node.nativeElement.innerHTML + '...'
  
    while(height < scrollHeight){
      let words = text.split(' ')
      words.pop()
      words.pop()
      text = words.join(' ') + '...'
      
      node.nativeElement.innerHTML = text
      height = node.nativeElement.offsetHeight
      scrollHeight = node.nativeElement.scrollHeight
    }
  }
  
  ngAfterViewInit() {
    this.wheelDirective.profileComponent.profileHeight = this.profileSection.nativeElement.offsetHeight
    this.extensionDescriptions.changes.subscribe(descriptions => {
      this.handleExtensionsDescription(descriptions.toArray())
    })
    this.userInfo.changes.subscribe(info => 
      this.handleUserInfo(info.toArray())
    )
    this.cdRef.detectChanges()
  }

  handleExtensionsDescription(descriptions){
    this.extensionsContainer.nativeElement.style.display = "block"
    descriptions.forEach((description, i) => {
      description.nativeElement.innerHTML = this.extensions[i].description
      this.fixOverflow(description)
    })
    if(this.homeComponent && !this.profileAnimationService.isDisplayed){
      this.extensionsContainer.nativeElement.style.display = "none"        
    }
  }

  handleUserInfo(info){
    info.forEach(description => { 
      description.nativeElement.innerHTML = this.user.info
      this.fixOverflow(description)
    })
  }

  getUser(id: number){
    this.userService.getUser(id).subscribe(data => {
      this.user = data
      this.user.rating = +this.user.rating.toFixed(2)
      
      this.extensionsService.findUserExtensions(this.config.itemsPerPage).subscribe(page => {
        this.extensions = page.data
        this.user.extensions = page.data
        this.config.totalItems = page.totalResults
      })
    })
  }

  changePage(page: number){
    const length = this.user.extensions.length
    const itemsPerPage = this.config.itemsPerPage;
    const userExtensions = this.user.extensions;

    if(length <= (page - 1) * itemsPerPage){
      this.extensionsService.findUserExtensions(itemsPerPage * (page - length / itemsPerPage), userExtensions[length - 1].id).subscribe(pageData => {
        this.config.totalItems = userExtensions.length + pageData.totalResults
        userExtensions.push(...pageData.data)
        this.extensions = userExtensions.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        this.config.currentPage = page;
      })
    }else{
      this.extensions = userExtensions.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      this.config.currentPage = page;
    }
  }
}

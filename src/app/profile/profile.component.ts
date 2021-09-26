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

  constructor(private userService: UserService, private extensionsService: ExtensionsService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private profileAnimationService: ProfileAnimationService) {
    this.baseUrl = environment.baseUrl
    this.extensionsService.config.itemsPerPage = 8
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
    this.userInfo.changes.subscribe(info => 
      this.handleUserInfo(info.toArray())
    )
    this.cdRef.detectChanges()
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
      
      this.extensionsService.getUserExtensions()
    })
  }
}

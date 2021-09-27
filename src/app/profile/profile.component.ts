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
  @ViewChild(MouseWheelDirective) wheelDirective: MouseWheelDirective
 
  @HostListener('window:resize', ['$event'])
  onResize() {
      this.handleUserInfo()
  }

  loggedUser: any
  user: User
  extensions: Extension[]
  admin: boolean
  baseUrl: string
  isInfoToggled: boolean
  changeInterval : any

  @ViewChildren('extensionDescriptions') extensionDescriptions: QueryList<any>
  @ViewChildren('userInfo') userInfo: QueryList<any>
  @ViewChild('extensionsContainer') extensionsContainer: ElementRef
  @ViewChild('profileSection') profileSection: ElementRef

  constructor(private userService: UserService, private extensionsService: ExtensionsService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private profileAnimationService: ProfileAnimationService) {
    this.baseUrl = environment.baseUrl
    this.extensionsService.config.itemsPerPage = 8
  }

  ngOnInit() {
    const component = this.route.component['name']
    this.extensionsService.component = component
    
    if(component != 'HomeComponent'){
      this.getUser(+this.route.snapshot.paramMap.get('id'));
      this.profileAnimationService.isAnimated = true
      this.profileAnimationService.isDisplayed = true
    }else{
      this.loggedUser = JSON.parse(localStorage.getItem('user'))
      this.profileAnimationService.isAnimated = false
      if(this.loggedUser){
        this.getUser(this.loggedUser['id'])
      }
    }
  }

  ngOnDestroy() {
    this.profileAnimationService.isAnimated = undefined
    this.profileAnimationService.isDisplayed = false
    this.extensionsService.resetExtensions()
  }

  ngAfterViewInit() {
    this.wheelDirective.profileComponent.profileHeight = this.profileSection.nativeElement.offsetHeight
    this.cdRef.detectChanges()
    this.userInfo.changes.subscribe(info => 
      this.handleUserInfo()
    )
  }

  fixOverflow(node){  
    let height = node.offsetHeight
    let scrollHeight = node.scrollHeight
    let text = node.textContent + '...'
  
    while(height < scrollHeight){
      let words = text.split(' ')
      words.pop()
      words.pop()
      text = words.join(' ') + '...'
      
      node.textContent = text
      height = node.offsetHeight
      scrollHeight = node.scrollHeight
    }
  }

  toggleInfo(){
    this.isInfoToggled = !this.isInfoToggled
    this.handleUserInfo()
  }

  handleUserInfo(){
    const node = this.userInfo.last.nativeElement
    node.textContent = this.user.info

    if(window.innerWidth > 1200){
      clearInterval(this.changeInterval)

      if(this.isInfoToggled){
        return
      }

      if(node.style.height != 'auto'){
        this.fixOverflow(node)
        return
      }

      this.changeInterval = setInterval(() => {
        if(node.style.height != 'auto'){
          this.fixOverflow(node)
          clearInterval(this.changeInterval)
        }
      }, 50)
    }
  }

  getUser(id: number){
    this.userService.getUser(id).subscribe(data => {
      this.user = data
      this.user.rating = +this.user.rating.toFixed(2)
      
      this.extensionsService.getUserExtensions()
    })
  }
}

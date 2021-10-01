import { Component, OnInit, ViewChildren, ElementRef, QueryList, ViewChild, ChangeDetectorRef, HostListener} from '@angular/core';
import { UserService, User } from '../services/user.service'
import { ExtensionsService, Extension } from '../services/extensions.service'
import { ActivatedRoute } from '@angular/router';
import { ProfileScrollDirective } from '../helpers/profile-scroll-directive';
import { environment } from '../../environments/environment';
import { ProfileAnimationService } from '../services/profile.animation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild(ProfileScrollDirective) wheelDirective: ProfileScrollDirective
 
  @HostListener('window:resize', ['$event'])
  onResize() {
      this.handleUserInfo(this.userInfo.last)
  }

  loggedUser: User
  user: User
  extensions: Extension[]
  admin: boolean
  baseUrl: string
  isInfoToggled: boolean
  changeInterval : any
  subscription: Subject<void> = new Subject<void>();

  @ViewChildren('extensionDescriptions') extensionDescriptions: QueryList<any>
  @ViewChildren('userInfo') userInfo: QueryList<ElementRef<HTMLElement>>
  @ViewChild('extensionsContainer') extensionsContainer: ElementRef<HTMLElement>
  @ViewChild('profileSection') profileSection: ElementRef<HTMLElement>

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
      this.profileAnimationService.isDisplayed = false
      if(this.loggedUser){
        this.getUser(this.loggedUser.id)
      }
    }
  }

  ngOnDestroy() {
    this.profileAnimationService.isAnimated = true
    this.profileAnimationService.isDisplayed = true
    clearTimeout(this.profileAnimationService.animationTimeout)
    
    this.subscription.next()
    this.subscription.complete()
  }

  ngAfterViewInit() {
    this.wheelDirective.containerHeight = this.profileSection.nativeElement.offsetHeight
    this.cdRef.detectChanges()
    this.subscribeToUserInfo()
  }

  subscribeToUserInfo(){
    this.userInfo.changes.pipe(takeUntil(this.subscription)).subscribe((info : QueryList<ElementRef<HTMLElement>>)  => 
      this.handleUserInfo(info.last)
    )
  }

  fixOverflow(node : HTMLElement){  
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
    this.handleUserInfo(this.userInfo.last)
  }

  handleUserInfo(userInfo : ElementRef<HTMLElement>){
    const node = userInfo.nativeElement
    node.textContent = this.user.info

    if(window.innerWidth > 1281){
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
    this.userService.getUser(id).pipe(takeUntil(this.subscription)).subscribe(data => {
      this.user = data
      this.user.rating = +this.user.rating.toFixed(2)
      
      this.extensionsService.getUserExtensions(this.subscription)
    })
  }
}

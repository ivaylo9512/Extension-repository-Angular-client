import { Directive,OnInit, HostListener,  ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ProfileAnimationService } from '../services/profile.animation.service';

@Directive({ selector: '[mouseWheel]' })
export class MouseWheelDirective implements OnInit {
  submitComponent = {
    currentSection: 'coverSection',
    isFinished: undefined,
    extensionSection: undefined
  }
  profileComponent = {
    profileHeight: 0,
  }
  extensionComponent = {
    currentSection: 'coverSection',
    isCoverPresent: true,
    extensionSection: undefined,
    slidingContainer: undefined
  }

  touchStartY: number
  scrollDir: number
  scrolledAmount: number
  isMobile: boolean
  currentComponent: string

  @ViewChild('tagsContainer') tagsContainer : ElementRef
  constructor(private authService: AuthService, private route: ActivatedRoute, private profileAnimationService: ProfileAnimationService){
  }

  decideAnimation() {
    switch(this.currentComponent){
      case 'HomeComponent' :
        this.pofileAnimation()
        break
      case 'CreateComponent' :
      case 'EditComponent' :
        this.submitAnimation()
        break
      case 'ExtensionComponent' :
        this.extensionAnimation()
        break
    }
  }

  @HostListener("window:scroll", ['$event'])
  onWindowScroll() {
    this.calculateScrollAmount()
  }

  @HostListener('wheel', ['$event']) 
  onWheel(e) {
    if(!this.isMobile){
      this.scrollDir = e.deltaY > 0 ? 1 : -1
      this.decideAnimation()
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e){
    if(!this.isMobile){
      this.scrollDir = this.touchStartY > e.changedTouches[0].clientY ? 1 : -1
      this.decideAnimation()
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e){
    this.touchStartY = e.touches[0].clientY
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobileScreen()
  }

  calculateScrollAmount(){
    const clientHeight = document.body.clientHeight
    const innerHeight = window.innerHeight
    this.profileAnimationService.circleTransform = -(window.scrollY / this.profileComponent.profileHeight * 100)
    this.scrolledAmount = window.scrollY / (clientHeight - innerHeight) * 100 || 0
  }

  checkIfMobileScreen(){
    if(window.innerWidth < 1281){
      this.isMobile = true

      this.profileAnimationService.isDisplayed = true
      this.profileAnimationService.isAnimated = true

      this.submitComponent.currentSection = 'extensionSection'
      this.submitComponent.isFinished = true
      
      this.extensionComponent.currentSection = 'extensionSection'
    }else{
      this.isMobile = false
    }
  }

  pofileAnimation(){
    if(this.authService.isLoggedIn){
      if(!this.profileAnimationService.isAnimated){
        if(this.scrollDir == 1) {
          this.profileAnimationService.isAnimated = true
          this.profileAnimationService.animationTimeout = setTimeout(() => {
              this.profileAnimationService.isDisplayed = true
          }, 4100);
        }
      }else{
        if (this.scrollDir == -1 && window.scrollY == 0) {
          clearTimeout(this.profileAnimationService.animationTimeout)
          this.profileAnimationService.isAnimated = false
          this.profileAnimationService.isDisplayed = false
        }
      }
    }
  }

  submitAnimation(){
    const extensionOpacity = window.getComputedStyle(this.submitComponent.extensionSection.nativeElement).getPropertyValue('opacity')
      if(this.submitComponent.currentSection == 'coverSection'){
        if (this.scrollDir == 1) {
          this.submitComponent.currentSection = 'extensionSection'
        }

      }else if(this.submitComponent.currentSection == 'extensionSection'){
        if(this.scrollDir == -1 && extensionOpacity == '1'){
          this.submitComponent.currentSection = 'coverSection'
        }
      }
  }

  extensionAnimation(){
    if(!this.isMobile){
      const extensionOpacity = window.getComputedStyle(this.extensionComponent.extensionSection.nativeElement).getPropertyValue('opacity')
      const sliderOpacity = window.getComputedStyle(this.extensionComponent.slidingContainer.nativeElement).getPropertyValue('opacity')

      const currentSection = this.extensionComponent.currentSection
      if(this.extensionComponent.isCoverPresent){
        if(currentSection == 'coverSection'){
          if(this.scrollDir == 1){
            this.extensionComponent.currentSection = 'extensionSection'
          }
          
        }else if(currentSection == 'extensionSection'){
          if(this.scrollDir == -1 && sliderOpacity == '0'){
            this.extensionComponent.currentSection = 'coverSection'
          }
        }

      }
      
      if(currentSection == 'extensionSection'){
        if(this.scrollDir == 1 && extensionOpacity == '1'){
          this.extensionComponent.currentSection = 'infoSection'
        }
      }else if(currentSection == 'infoSection'){
        if(this.scrollDir == -1 ){
          this.extensionComponent.currentSection = 'extensionSection'
        }
      }
    }
  }

  ngOnInit() {
    this.currentComponent = this.route.component['name']
    this.checkIfMobileScreen()
  }
}
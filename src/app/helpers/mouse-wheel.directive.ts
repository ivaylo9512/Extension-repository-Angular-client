import { Directive,OnInit, HostListener,  ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { JSDocCommentStmt } from '@angular/compiler';
import { HeaderService } from './header.service';


@Directive({ selector: '[mouseWheel]' })
export class MouseWheelDirective implements OnInit {
  submitComponent = {
    currentSection: 'coverSection',
    isFinished: undefined,
    extensionSection: undefined
  }
  profileComponent = {
    display: false,
    animate: undefined,
    isFinished: undefined,
    profileHeight: 0,
    circleTransform: 0,
    isHomeView: undefined
  }
  extensionComponent = {
    currentSection: 'coverSection',
    isCoverPresent: true,
    extensionSection: undefined,
    slidingContainer: undefined
  }

  scrolledAmount: number
  isMobile: boolean
  currentComponent: string

  @ViewChild('tagsContainer') tagsContainer : ElementRef
  constructor(private authService: AuthService, private route: ActivatedRoute, private headerService: HeaderService){
  }

  @HostListener('wheel', ['$event']) 
  Wheel(e) {
    switch(this.currentComponent){
      case 'HomeComponent' :
        this.pofileAnimation(e)
        break
      case 'CreateComponent' :
      case 'EditComponent' :
        this.submitAnimation(e)
        break
      case 'ExtensionComponent' :
        this.extensionAnimation(e)
        break
    }
  }
  @HostListener("window:scroll", ['$event'])
  onWindowScroll(e) {
    if(this.profileComponent.isHomeView && this.isMobile){
      this.headerService.setScrollY(scrollY)
    }
    this.calculateScrollAmount()
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobileScreen()
  }

  calculateScrollAmount(){
    const clientHeight = document.body.clientHeight
    const innerHeight = window.innerHeight
    this.profileComponent.circleTransform = -(window.scrollY / this.profileComponent.profileHeight * 100)
    this.scrolledAmount = window.scrollY / (clientHeight - innerHeight) * 100 || 0
  }

  checkIfMobileScreen(){
    if(window.innerWidth < 1200){
      this.headerService.isMobile = true
      this.isMobile = true

      this.profileComponent.display = true
      this.profileComponent.animate = true

      this.submitComponent.currentSection = 'extensionSection'
      this.submitComponent.isFinished = true
      
      this.extensionComponent.currentSection = 'extensionSection'
    }else{
      this.isMobile = false
      this.headerService.isMobile = false
    }
  }

  pofileAnimation(e){
    if(this.authService.isLoggedIn && this.profileComponent.isHomeView && !this.isMobile){
      if(!this.profileComponent.animate){

        if (e.deltaY > 0) {
          this.profileComponent.animate = true

          this.profileComponent.isFinished = setTimeout(() => {
              this.profileComponent.display = true
          }, 4100);
        }
      }else{
        if (e.deltaY < 0 && window.scrollY == 0) {
          clearTimeout(this.profileComponent.isFinished)
          this.profileComponent.animate = false
          this.profileComponent.display = false
        }
      }
    }
  }

  submitAnimation(e){
    const extensionOpacity = window.getComputedStyle(this.submitComponent.extensionSection.nativeElement).getPropertyValue('opacity')
    if(!this.isMobile){
      if(this.submitComponent.currentSection == 'coverSection'){
        if (e.deltaY > 0) {
          this.submitComponent.currentSection = 'extensionSection'
        }

      }else if(this.submitComponent.currentSection == 'extensionSection'){
        if(e.deltaY < 0 && extensionOpacity == '1'){
          this.submitComponent.currentSection = 'coverSection'
        }
      }
    }
  }

  extensionAnimation(e){
    if(!this.isMobile){
      const extensionOpacity = window.getComputedStyle(this.extensionComponent.extensionSection.nativeElement).getPropertyValue('opacity')
      const sliderOpacity = window.getComputedStyle(this.extensionComponent.slidingContainer.nativeElement).getPropertyValue('opacity')

      const currentSection = this.extensionComponent.currentSection
      if(this.extensionComponent.isCoverPresent){
        if(currentSection == 'coverSection'){
          if(e.deltaY > 0){
            this.extensionComponent.currentSection = 'extensionSection'
          }
          
        }else if(currentSection == 'extensionSection'){
          if(e.deltaY < 0 && sliderOpacity == '0'){
            this.extensionComponent.currentSection = 'coverSection'
          }
        }

      }
      
      if(currentSection == 'extensionSection'){
        if(e.deltaY > 0 && extensionOpacity == '1'){
          this.extensionComponent.currentSection = 'infoSection'
        }
      }else if(currentSection == 'infoSection'){
        if(e.deltaY < 0 ){
          this.extensionComponent.currentSection = 'extensionSection'
        }
      }
    }
  }

  ngOnInit() {
    this.currentComponent = this.route.component['name']
    this.headerService.currentComponent = this.currentComponent
  }
}
import { Directive,OnInit, HostListener,  ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ProfileAnimationService } from '../services/profile.animation.service';

@Directive({ selector: '[profileScroll]' })
export class ProfileScrollDirective implements OnInit {
  containerHeight: number
  scrollDir: number
  isMobile: boolean
  touchStartY: number
  multiplier = 1

  @HostListener("window:scroll", ['$event'])
  onWindowScroll() {
    this.profileAnimationService.circleTransform = -(window.scrollY / this.containerHeight * 100) * this.multiplier
  }

  @HostListener('wheel', ['$event']) 
  onWheel(e) {
    if(!this.isMobile && this.authService.isLoggedIn && this.route.component['name'] == 'HomeComponent'){
      this.scrollDir = e.deltaY > 0 ? 1 : -1
      this.pofileAnimation()
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e){
    if(!this.isMobile && this.authService.isLoggedIn && this.route.component['name'] == 'HomeComponent'){
      this.scrollDir = this.touchStartY > e.changedTouches[0].clientY ? 1 : -1
      this.pofileAnimation()
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

  constructor(private authService: AuthService, private route: ActivatedRoute, private profileAnimationService: ProfileAnimationService){
  }

  checkIfMobileScreen(){
    this.isMobile = window.innerWidth < 1281;
    this.profileAnimationService.isDisplayed = this.isMobile || this.route.component['name'] != 'HomeComponent' 
    this.profileAnimationService.isAnimated = this.isMobile || this.route.component['name'] != 'HomeComponent'
  }

  pofileAnimation(){
    if(!this.profileAnimationService.isAnimated && this.scrollDir == 1){
        this.profileAnimationService.isAnimated = true
        this.profileAnimationService.animationTimeout = setTimeout(() => {
            this.profileAnimationService.isDisplayed = true
        }, 4100);
        return
    }

    if (this.profileAnimationService.isAnimated && this.scrollDir == -1 && window.scrollY == 0) {
      clearTimeout(this.profileAnimationService.animationTimeout)
      this.profileAnimationService.isAnimated = false
      this.profileAnimationService.isDisplayed = false
    }
  }
    
  ngOnInit() {
    this.checkIfMobileScreen()
  }
}
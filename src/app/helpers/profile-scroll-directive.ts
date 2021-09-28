import { Directive,OnInit, HostListener,  ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ProfileAnimationService } from '../services/profile.animation.service';

@Directive({ selector: '[profileScroll]' })
export class ProfileScrollDirective implements OnInit {
    scrolledAmount: number
    profileHeight: 0
    scrollDir: number

    @HostListener("window:scroll", ['$event'])
    onWindowScroll() {
      this.calculateScrollAmount()
    }

    constructor(private authService: AuthService, private route: ActivatedRoute, private profileAnimationService: ProfileAnimationService){
    }

    calculateScrollAmount(){
      const clientHeight = document.body.clientHeight
      const innerHeight = window.innerHeight
      this.profileAnimationService.circleTransform = -(window.scrollY / this.profileHeight * 100)
      this.scrolledAmount = window.scrollY / (clientHeight - innerHeight) * 100 || 0
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
    
}
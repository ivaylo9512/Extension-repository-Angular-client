import { Directive,OnInit, HostListener } from '@angular/core';

@Directive({ selector: '[submitScroll]' })
export class SubmitScrollDirective implements OnInit {
  submitComponent = {
    currentSection: 'coverSection',
    isFinished: undefined,
    extensionSection: undefined
  }
  
  isMobile: boolean
  scrollDir: number
  touchStartY: number

  @HostListener('wheel', ['$event']) 
  onWheel(e) {
    if(!this.isMobile){
      this.scrollDir = e.deltaY > 0 ? 1 : -1
      this.submitAnimation()
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e){
    if(!this.isMobile){
      this.scrollDir = this.touchStartY > e.changedTouches[0].clientY ? 1 : -1
      this.submitAnimation()
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
  checkIfMobileScreen(){
    this.isMobile = false
    
    if(window.innerWidth < 1281){
      this.isMobile = true
      this.submitComponent.currentSection = 'extensionSection'
    }

    this.submitComponent.isFinished = this.isMobile
  }
      
  ngOnInit() {
    this.checkIfMobileScreen()
  }
}
import { Directive,OnInit, HostListener, ElementRef } from '@angular/core';

@Directive({ selector: '[extensionScroll]' })
export class ExtensionScrollDirective implements OnInit {
  currentSection = 'coverSection'
  isCoverPresent = true
  extensionSection: ElementRef
  slidingContainer: ElementRef

  scrollDir: number
  isMobile: boolean
  touchStartY: number
  scrolledAmount: number
  
  @HostListener('wheel', ['$event']) 
  onWheel(e) {
    if(!this.isMobile){
      this.scrollDir = e.deltaY > 0 ? 1 : -1
      this.extensionAnimation()
    }
  }

  @HostListener("window:scroll", ['$event'])
  onWindowScroll() {
    this.calculateScrollAmount()
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e){
    if(!this.isMobile){
      this.scrollDir = this.touchStartY > e.changedTouches[0].clientY ? 1 : -1
      this.extensionAnimation()
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

  extensionAnimation(){
    if(!this.isMobile){
      const extensionOpacity = window.getComputedStyle(this.extensionSection.nativeElement).getPropertyValue('opacity')
      const sliderOpacity = window.getComputedStyle(this.slidingContainer.nativeElement).getPropertyValue('opacity')
  
      const currentSection = this.currentSection
      if(this.isCoverPresent){
        if(currentSection == 'coverSection'){
          if(this.scrollDir == 1){
            this.currentSection = 'extensionSection'
          }
          
        }else if(currentSection == 'extensionSection'){
          if(this.scrollDir == -1 && sliderOpacity == '0'){
            this.currentSection = 'coverSection'
          }
        }
      }
      
      if(currentSection == 'extensionSection'){
        if(this.scrollDir == 1 && extensionOpacity == '1'){
          this.currentSection = 'infoSection'
        }
      }else if(currentSection == 'infoSection'){
        if(this.scrollDir == -1 ){
          this.currentSection = 'extensionSection'
        }
      }
    }
  }
 
  calculateScrollAmount(){
    const clientHeight = document.body.clientHeight
    const innerHeight = window.innerHeight
    this.scrolledAmount = window.scrollY / (clientHeight - innerHeight) * 100 || 0
  }

  checkIfMobileScreen(){
    this.isMobile = false
    
    if(window.innerWidth < 1281){
      this.isMobile = true
      this.currentSection = 'extensionSection'
    }
  }

  ngOnInit() {
    this.checkIfMobileScreen()
  }
}
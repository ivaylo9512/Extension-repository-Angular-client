import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileAnimationService {
    scrollYSubject = new BehaviorSubject<number>(0)
    scrollY = this.scrollYSubject.asObservable()
    isDisplayed: boolean
    animationTimeout: any
    isAnimated: boolean
    circleTransform: number
    isMobile: boolean

    constructor(){
        this.circleTransform = 0
    }
    
    setScrollY(scrollY: number){
        this.scrollYSubject.next(scrollY)
    }
}
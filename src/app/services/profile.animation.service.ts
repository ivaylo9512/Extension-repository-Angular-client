import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileAnimationService {
    isDisplayed = true
    isAnimated = true
    circleTransform = 0
    animationTimeout: any
    isMobile: boolean
}
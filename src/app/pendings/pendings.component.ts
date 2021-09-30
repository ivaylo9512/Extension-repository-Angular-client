import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ExtensionsService } from '../services/extensions.service';
import { ProfileScrollDirective } from '../helpers/profile-scroll-directive';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ProfileAnimationService } from '../services/profile.animation.service';

@Component({
  selector: 'app-pendings',
  templateUrl: './pendings.component.html',
  styleUrls: ['./pendings.component.css']
})
export class PendingsComponent implements OnInit {
  @ViewChild(ProfileScrollDirective) wheelDirective: ProfileScrollDirective
  @ViewChild('pendingSection') pendingSection: ElementRef

  routeSubscription: Subscription
  baseUrl: string

  constructor(private extensionsService: ExtensionsService, private cdRef: ChangeDetectorRef, private router: Router, private profileAnimation: ProfileAnimationService) { 
    this.baseUrl = environment.baseUrl
    this.extensionsService.config.itemsPerPage = 16
  }

  ngOnInit() {
    this.extensionsService.getPending()
    this.wheelDirective.containerHeight = this.pendingSection.nativeElement.offsetHeight
  }

  ngOnDestroy() {
    if (this.routeSubscription) {  
      this.routeSubscription.unsubscribe();
   }
   this.wheelDirective.multiplier = 5
  }

  ngAfterViewInit() {
    this.wheelDirective.checkIfMobileScreen()

    this.cdRef.detectChanges()

    this.routeSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.extensionsService.getPending()
      }
    })
  }
}

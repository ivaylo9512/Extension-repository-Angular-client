import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ExtensionsService } from '../services/extensions.service';
import { ProfileScrollDirective } from '../helpers/profile-scroll-directive';
import { Subject, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ProfileAnimationService } from '../services/profile.animation.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pendings',
  templateUrl: './pendings.component.html',
  styleUrls: ['./pendings.component.css']
})
export class PendingsComponent implements OnInit {
  @ViewChild(ProfileScrollDirective) wheelDirective: ProfileScrollDirective
  @ViewChild('pendingSection') pendingSection: ElementRef<HTMLElement>

  baseUrl : string
  subscription : Subject<void> = new Subject<void>()

  constructor(private extensionsService: ExtensionsService, private cdRef: ChangeDetectorRef, private router: Router, private profileAnimation: ProfileAnimationService) { 
    this.baseUrl = environment.baseUrl
    this.extensionsService.config.itemsPerPage = 16
  }

  ngOnInit() {
    this.extensionsService.getPending(this.subscription)
    this.wheelDirective.containerHeight = this.pendingSection.nativeElement.offsetHeight
  }

  ngOnDestroy() {
    this.subscription.next()
    this.subscription.complete()
    this.wheelDirective.multiplier = 5
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges()
    this.subscribeToRouter()
  }

  subscribeToRouter(){
    this.router.events.pipe(takeUntil(this.subscription)).subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.extensionsService.resetExtensions()
        this.extensionsService.getPending(this.subscription)
      }
    })
  }
}

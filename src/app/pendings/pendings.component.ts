import { Component, OnInit, ViewChildren, QueryList, HostListener, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ExtensionsService, Extension } from '../services/extensions.service';
import { MouseWheelDirective } from '../helpers/mouse-wheel.directive';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pendings',
  templateUrl: './pendings.component.html',
  styleUrls: ['./pendings.component.css']
})
export class PendingsComponent implements OnInit {
  @ViewChild(MouseWheelDirective) wheelDirective: MouseWheelDirective

  routeSubscription: Subscription
  baseUrl: string

  constructor(private extensionsService: ExtensionsService, private cdRef: ChangeDetectorRef, private router: Router) { 
    this.baseUrl = environment.baseUrl
    this.extensionsService.config.itemsPerPage = 16
  }

  ngOnInit() {
    this.findPendings()
  }

  ngOnDestroy() {
    if (this.routeSubscription) {  
      this.routeSubscription.unsubscribe();
   }
   this.extensionsService.resetExtensions()
  }

  ngAfterViewInit() {
    this.wheelDirective.checkIfMobileScreen()

    this.cdRef.detectChanges()

    this.routeSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.findPendings()
      }
    })
  }

  findPendings(){
    this.extensionsService.getPending()
  }
}

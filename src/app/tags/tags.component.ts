import { Component, OnInit, ViewChildren, QueryList, HostListener, ViewChild } from '@angular/core';
import { ExtensionsService, Extension } from '../services/extensions.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ExtensionScrollDirective } from '../helpers/extension-scroll.directive';
import { Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['../pendings/pendings.component.css']
})
export class TagsComponent implements OnInit {
  @ViewChild(ExtensionScrollDirective) wheelDirective: ExtensionScrollDirective

  baseUrl : string
  subscription : Subject<void> = new Subject<void>()

  constructor(private extensionsService: ExtensionsService, private route: ActivatedRoute, private router: Router) { 
    this.extensionsService.config.itemsPerPage = 2
    this.baseUrl = environment.baseUrl
  }

  ngOnDestroy() {
    this.subscription.next()
    this.subscription.complete()
    this.extensionsService.resetExtensions()
  }

  ngAfterViewInit() {
    this.subscribeToRoute()
    this.extensionsService.nameQuery = this.route.snapshot.paramMap.get('tag')
    this.extensionsService.getByTag(this.subscription)
  }

  ngOnInit() {
  }
  
  subscribeToRoute(){
    this.router.events.pipe(takeUntil(this.subscription)).subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.extensionsService.nameQuery = this.route.snapshot.paramMap.get('tag')
        this.extensionsService.getByTag(this.subscription)
      }
    })
  }
}

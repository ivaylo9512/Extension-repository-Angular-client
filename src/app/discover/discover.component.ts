import { Component, OnInit, ViewChildren, QueryList, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ExtensionsService } from '../services/extensions.service';
import { FormControl } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ProfileScrollDirective } from '../helpers/profile-scroll-directive';
import { Subject, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from '../../environments/environment';
import { versions } from 'process';
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {
  @ViewChild('discoverSection') discoverSection: ElementRef
  @ViewChild(ProfileScrollDirective) wheelDirective: ProfileScrollDirective

  search: FormControl = new FormControl()
  baseUrl: string
  subscription: Subject<void> = new Subject<void>();

  constructor(private extensionsService: ExtensionsService, private cdRef: ChangeDetectorRef, private router: Router) {
    this.baseUrl = environment.baseUrl
    this.extensionsService.config.itemsPerPage = 16
    this.extensionsService.orderBy = 'name'
  }

  ngOnInit() {
    this.subscribeToForm()
    this.extensionsService.getAll(this.subscription)
  }

  ngOnDestroy() {
    this.resetView()   
  }

  changeCriteria(e){
    this.resetView()
    this.extensionsService.orderBy = e.target.value
    this.extensionsService.getAll(this.subscription)
  }

  subscribeToForm(){
    this.search.valueChanges.pipe(debounceTime(200), takeUntil(this.subscription)).subscribe(result => {
      this.extensionsService.resetExtensions()
      this.extensionsService.nameQuery = result
      this.extensionsService.getAll(this.subscription)
    }) 
  }

  subscribeToRoute(){
    this.router.events.pipe(takeUntil(this.subscription)).subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.resetView()   
        this.extensionsService.getAll(this.subscription)
      }
    })
  }

  resetView(){
    this.subscription.next()
    this.subscription.complete()
    this.subscription = new Subject<void>()
    this.extensionsService.resetExtensions()
    this.extensionsService.nameQuery = ''
    this.search.setValue('')
    this.extensionsService.orderBy = 'name'
    this.subscribeToForm()
    this.subscribeToRoute()
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges()
    this.subscribeToRoute()
  }
}
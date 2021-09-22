import { Component, OnInit, ViewChildren, QueryList, HostListener, ViewChild } from '@angular/core';
import { ExtensionsService, Extension } from '../services/extensions.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MouseWheelDirective } from '../helpers/mouse-wheel.directive';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['../pendings/pendings.component.css']
})
export class TagsComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.fixOverflow(this.extensionDescriptions)
  }

  @ViewChildren('extensionDescriptions') extensionDescriptions: QueryList<any>
  @ViewChild(MouseWheelDirective) wheelDirective: MouseWheelDirective

  totalExtensions: Extension[]
  extensions: Extension[]
  tag: string
  routeSubscription: Subscription
  baseUrl: string

  config = {
    itemsPerPage: 12,
    currentPage: 1,
    totalItems: 0
  }

  constructor(private extensionsService: ExtensionsService, private route: ActivatedRoute, private router: Router) { 
    this.baseUrl = environment.baseUrl
  }

  ngOnInit() {
    this.tag = this.route.snapshot.paramMap.get('tag')
    this.findByTag(this.tag)
  }

  ngOnDestroy() {
    if (this.routeSubscription) {  
      this.routeSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.extensionDescriptions.changes.subscribe(descriptions => {
      this.fixOverflow(descriptions.toArray())
    })

    this.routeSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.tag = this.route.snapshot.paramMap.get('tag')
        this.findByTag(this.tag)
      }
    })
  }

  findByTag(tag: string){
    this.extensionsService.findByTag(tag, this.config.itemsPerPage).subscribe(page =>{
      this.extensions = page.data
      this.totalExtensions = page.data
      this.config.totalItems = page.totalResults
    })
  }

  fixOverflow(descriptions){
    descriptions.forEach((description, i) => {
      description.nativeElement.innerHTML = this.extensions[i].description
      
      let height = description.nativeElement.offsetHeight
      let scrollHeight = description.nativeElement.scrollHeight
      let text = description.nativeElement.innerHTML + '...'
    
      while(height < scrollHeight){
        let words = text.split(' ')
        words.pop()
        words.pop()
        text = words.join(' ') + '...'
        
        description.nativeElement.innerHTML = text
        height = description.nativeElement.offsetHeight
        scrollHeight = description.nativeElement.scrollHeight
      }
    })
  }

  changePage(page){
    const length = this.totalExtensions.length
    const itemsPerPage = this.config.itemsPerPage;

    if(length <= (page - 1) * itemsPerPage){
      this.extensionsService.findByTag(this.tag, itemsPerPage * (page - length / itemsPerPage), this.totalExtensions[length - 1].id).subscribe(pageData => {
        this.config.totalItems = this.totalExtensions.length + pageData.totalResults
        this.totalExtensions.push(...pageData.data)
        this.extensions = this.totalExtensions.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        this.config.currentPage = page;
        this.wheelDirective.calculateScrollAmount()
      })
    }else{
      this.extensions = this.totalExtensions.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      this.config.currentPage = page;
      this.wheelDirective.calculateScrollAmount()
    }
  }
}

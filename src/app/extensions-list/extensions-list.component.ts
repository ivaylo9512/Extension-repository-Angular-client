import { Component, OnInit, ViewChildren, ElementRef, QueryList, ViewChild, ChangeDetectorRef, HostListener, ViewEncapsulation} from '@angular/core';
import { User } from '../services/user.service'
import { ExtensionsService, Extension } from '../services/extensions.service'
import { environment } from '../../environments/environment';
import { ProfileAnimationService } from '../services/profile.animation.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-extensions-list',
  templateUrl: './extensions-list.component.html',
  styleUrls: ['./extensions-list.component.css']
})
export class ExtensionsListComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.handleExtensionsDescription(this.extensionDescriptions)
  }

  baseUrl : string
  subscription : Subject<void> = new Subject<void>();

  @ViewChildren('extensionDescriptions') extensionDescriptions: QueryList<ElementRef<HTMLElement>>
  @ViewChild('extensionsContainer') extensionsContainer: ElementRef<HTMLElement>

  constructor(private extensionsService: ExtensionsService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private profileAnimationService: ProfileAnimationService) {
    this.baseUrl = environment.baseUrl
  }

  ngOnInit() {
    this.extensionsService.resetExtensions()
    this.extensionsService.component = this.route.component['name']
  }

  ngOnDestroy() {
    this.subscription.next()
    this.subscription.complete()
    this.extensionsService.component = undefined
    this.extensionsService.resetExtensions()
  }

  fixOverflow(info : ElementRef<HTMLElement>){ 
    const node = info.nativeElement

    let height = node.offsetHeight
    let scrollHeight = node.scrollHeight
    let text = node.innerHTML + '...'
  
    while(height < scrollHeight){
      let words = text.split(' ')
      words.pop()
      words.pop()
      text = words.join(' ') + '...'
      
      node.innerHTML = text
      height = node.offsetHeight
      scrollHeight = node.scrollHeight
    }
  }
  
  ngAfterViewInit() {
    this.addDescriptionsEvent()
    this.cdRef.detectChanges()
  }

  addDescriptionsEvent(){
    this.extensionDescriptions.changes.pipe(takeUntil(this.subscription)).subscribe((descriptions : QueryList<ElementRef<HTMLElement>>) => {
      this.handleExtensionsDescription(descriptions)
    })
  }

  handleExtensionsDescription(descriptions : QueryList<ElementRef<HTMLElement>>){
    this.extensionsContainer.nativeElement.style.display = "block"

    descriptions.forEach((description, i) => {
      description.nativeElement.textContent = this.extensionsService.totalExtensions[i].description
      this.fixOverflow(description)
    })

    if(this.extensionsService.component == 'HomeComponent' && !this.profileAnimationService.isDisplayed){
      this.extensionsContainer.nativeElement.style.display = "none"        
    }
  }
}

import { Component, OnInit, ViewChildren, QueryList, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Extension, ExtensionsService } from '../services/extensions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ExtensionScrollDirective } from '../helpers/extension-scroll.directive';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.css']
})
export class ExtensionComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.fixOverflow(this.extensionDescription)
  }

  @ViewChildren('extensionDescription') extensionDescription: QueryList<ElementRef<HTMLElement>>
  @ViewChild(ExtensionScrollDirective) wheelDirective: ExtensionScrollDirective
  @ViewChild('extensionSection') extensionSection: ElementRef<HTMLElement>
  @ViewChild("slidingContainer") slidingContainer: ElementRef<HTMLElement>

  extension: Extension
  baseUrl: string
  subscription : Subject<void> = new Subject<void>()

  constructor(private extensionService: ExtensionsService, private router: Router, private authService: AuthService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef ) {
    this.baseUrl = environment.baseUrl
  }

  ngOnInit() {
  }
  
  setExtension(extension : Extension){
    this.extension = extension

    if(!extension.coverLocation){
      this.wheelDirective.currentSection = 'extensionSection'
      this.wheelDirective.isCoverPresent = false
    }    
  }

  decideExtension(){
    const currentExtension = this.extensionService.currentExtension
    currentExtension 
      ? this.setExtension(currentExtension) 
      : this.getExtension(+this.route.snapshot.paramMap.get('id'))
  }

  getExtension(id : number){
    this.extensionService.getExtension(id).pipe(takeUntil(this.subscription)).subscribe(data =>{
      this.extension = data
      this.extensionService.currentExtension = data
    
      if(!data.coverLocation){
        this.wheelDirective.currentSection = 'extensionSection'
        this.wheelDirective.isCoverPresent = false
      }
    })
  }

  subscribeToDescriptions(){
    this.extensionDescription.changes.pipe(takeUntil(this.subscription)).pipe(takeUntil(this.subscription)).subscribe((descriptions : QueryList<ElementRef<HTMLElement>>) => {
      this.fixOverflow(descriptions)
    })
  }

  setFeatureState(){
    this.extensionService.setFeatured(this.extension.id, this.extension.featured!).pipe(takeUntil(this.subscription)).subscribe(data =>{
      this.extension.featured = data['featured']
    })
  }

  deleteExtension(){
    this.extensionService.deleteExtension(this.extension.id).pipe(takeUntil(this.subscription)).subscribe(data =>{
      this.router.navigate(['/home'])   
    })
  }

  setPublishState(){
    this.extensionService.setPending(this.extension.id, this.extension.pending!).pipe(takeUntil(this.subscription)).subscribe(data =>
      this.extension.pending = data['pending']
    )
  }

  refreshGitHub(){
    this.extensionService.refreshGitHub(this.extension.id).subscribe(data => {
      this.extension.github = {
        ...this.extension.github,
        ...data
      }
    })
  }

  rateExtension(userRating : number){
    this.extensionService.rateExtension(this.extension.id, userRating).pipe(takeUntil(this.subscription)).subscribe(extensionRating =>{
      this.extension.rating = extensionRating
      this.extension.currentUserRatingValue = userRating
    })
  }

  ngAfterViewInit() {
    this.wheelDirective.slidingContainer = this.slidingContainer
    this.wheelDirective.extensionSection = this.extensionSection

    this.subscribeToDescriptions()
    this.decideExtension()
    
    this.cdRef.detectChanges()
  }

  ngOnDestroy() {
    this.extensionService.currentExtension = null
  }

  fixOverflow(descriptions : QueryList<ElementRef<HTMLElement>>){
    descriptions.forEach(description => {
      const node = description.nativeElement

      node.textContent = this.extension.description
      let height = node.offsetHeight
      let scrollHeight = node.scrollHeight
      let text = node.textContent + '...'
    
      while(height < scrollHeight){
        let words = text.split(' ')
        words.pop()
        words.pop()
        text = words.join(' ') + '...'
        
        node.textContent = text
        height = node.offsetHeight
        scrollHeight = node.scrollHeight
      }
    })
  }
}

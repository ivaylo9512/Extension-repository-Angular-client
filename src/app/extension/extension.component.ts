import { Component, OnInit, ViewChildren, QueryList, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { ExtensionsService } from '../services/extensions.service';
import { ActivatedRoute, Params, Route, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MouseWheelDirective } from '../helpers/mouse-wheel.directive';

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

  @ViewChildren('extensionDescription') extensionDescription: QueryList<any>
  @ViewChild(MouseWheelDirective) wheelDirective: MouseWheelDirective
  @ViewChild('extensionSection') extensionSection: ElementRef
  @ViewChild("slidingContainer") slidingContainer: ElementRef

  extension: any

  constructor(private extensionService: ExtensionsService, private router: Router, private authService: AuthService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef ) {
    this.extension = []
  }

  ngOnInit() {
  }
  
  setExtension(extension){
    this.extension = extension

    if(!extension.coverLocation){
      this.wheelDirective.extensionComponent.currentSection = 'extensionSection'
      this.wheelDirective.extensionComponent.isCoverPresent = false
    }    
  }

  getExtension(id : number){
    this.extensionService.getExtension(id).subscribe(data =>{
      this.extension = data
      this.extensionService.currentExtension = data
    
      if(!data.coverLocation){
        this.wheelDirective.extensionComponent.currentSection = 'extensionSection'
        this.wheelDirective.extensionComponent.isCoverPresent = false
      }
    })
  }

  setFeatureState(){
    let state : string
    if(this.extension.featured){
      state = 'unfeature'
    }else{
      state = 'feature'
    }
    this.extensionService.setFeatureState(this.extension.id, state).subscribe(data =>{
      this.extension.featured = data['featured']
    })
  }

  deleteExtension(){
    this.extensionService.deleteExtension(this.extension.id).subscribe(data =>{
      this.router.navigate(['/home'])   
    })
  }

  setPublishState(){
    let state : string
    if(this.extension.pending){
      state = 'publish'
    }else{
      state = 'unpublish'
    }
    this.extensionService.setPublishState(this.extension.id,state).subscribe(data =>
      this.extension.pending = data['pending']
    )
  }

  refreshGitHub(){
    this.extensionService.refreshGitHub(this.extension.id).subscribe(data => {
      this.extension.openIssues = data['openIssues']
      this.extension.pullRequests = data['pullRequests']
      this.extension.lastCommit = data['lastCommit']
      this.extension.lastErrorMessage = data['lastErrorMessage']
      this.extension.lastSuccessfulPullOfData = data['lastSuccessfulPullOfData']
      this.extension.lastFailedAttemptToCollectData = data['lastFailedAttemptToCollectData']
    })
  }

  rateExtension(userRating : string){
    this.extensionService.rateExtension(this.extension.id, userRating).subscribe(extensionRating =>{
      this.extension.rating = extensionRating
      this.extension.currentUserRatingValue = userRating
    })
  }

  ngAfterViewInit() {
    this.wheelDirective.extensionComponent.slidingContainer = this.slidingContainer
    this.wheelDirective.extensionComponent.extensionSection = this.extensionSection
    this.extensionDescription.changes.subscribe(descriptions => {
      this.fixOverflow(descriptions.toArray())
    })

    const currentExtension = this.extensionService.currentExtension != undefined && +this.route.snapshot.paramMap.get('id') == this.extensionService.currentExtension.id
    currentExtension ? this.setExtension(this.extensionService.currentExtension) :
      this.getExtension(+this.route.snapshot.paramMap.get('id'))
    
    this.cdRef.detectChanges()
  }

  ngOnDestroy() {
    this.extensionService.currentExtension = undefined
  }

  fixOverflow(descriptions){
    descriptions.forEach(description => {
      description.nativeElement.innerHTML = this.extension.description
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
}

import { Component, OnInit, ViewChildren, ElementRef, QueryList, ViewChild, ChangeDetectorRef, HostListener, ViewEncapsulation} from '@angular/core';
import { User } from '../services/user.service'
import { ExtensionsService, Extension } from '../services/extensions.service'
import { environment } from '../../environments/environment';
import { ProfileAnimationService } from '../services/profile.animation.service';
import { ActivatedRoute } from '@angular/router';

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

  loggedUser: any
  user: User
  extensions: Extension[]
  admin: boolean
  baseUrl: string

  @ViewChildren('extensionDescriptions') extensionDescriptions: QueryList<any>
  @ViewChild('extensionsContainer') extensionsContainer: ElementRef

  constructor(private extensionsService: ExtensionsService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private profileAnimationService: ProfileAnimationService) {
    this.baseUrl = environment.baseUrl
  }

  ngOnInit() {
    this.extensionsService.component = this.route.component['name']
  }

  ngOnDestroy() {
    this.extensionsService.component = undefined
  }

  fixOverflow(node){  
    let height = node.nativeElement.offsetHeight
    let scrollHeight = node.nativeElement.scrollHeight
    let text = node.nativeElement.innerHTML + '...'
  
    while(height < scrollHeight){
      let words = text.split(' ')
      words.pop()
      words.pop()
      text = words.join(' ') + '...'
      
      node.nativeElement.innerHTML = text
      height = node.nativeElement.offsetHeight
      scrollHeight = node.nativeElement.scrollHeight
    }
  }
  
  ngAfterViewInit() {
    this.extensionDescriptions.changes.subscribe(descriptions => {
      this.handleExtensionsDescription(descriptions.toArray())
    })

    this.cdRef.detectChanges()
  }

  handleExtensionsDescription(descriptions){
    this.extensionsContainer.nativeElement.style.display = "block"
    descriptions.forEach((description, i) => {
      description.nativeElement.innerHTML = this.extensionsService.totalExtensions[i].description
      this.fixOverflow(description)
    })
    if(this.extensionsService.component == 'HomeComponent' && !this.profileAnimationService.isDisplayed){
      this.extensionsContainer.nativeElement.style.display = "none"        
    }
  }
}

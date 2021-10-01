import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { Extension, ExtensionsService } from '../services/extensions.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fav-extensions',
  templateUrl: './fav-extensions.component.html',
  styleUrls: ['./fav-extensions.component.css']
})
export class FavExtensionsComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.fixOverflow(this.extensionDescriptions)
  }

  @ViewChild('backgroundsContainer') backgroundsContainer: ElementRef<HTMLElement>
  @ViewChildren('extensionDescriptions') extensionDescriptions: QueryList<ElementRef<HTMLElement>>

  extensions: Extension[]
  currentIndex: number
  initial: boolean
  baseUrl: string
  subscription : Subject<void> = new Subject<void>()

  constructor(private authService: AuthService, private extensionsService: ExtensionsService, private cdRef: ChangeDetectorRef) { 
    this.currentIndex = 0
    this.initial = true
    this.extensions = undefined
    this.baseUrl = environment.baseUrl
  }

  ngOnInit() {
    this.getExtensions()
  }

  getExtensions(){
    this.extensionsService.getFeatured().pipe(takeUntil(this.subscription)).subscribe(data => {
      this.extensions = data
      this.setSlideShow()
    })
  }
  
  setSlideShow(){
    const backgrounds = this.backgroundsContainer.nativeElement.children

    let currentBackground = backgrounds[this.currentIndex]
    let nextBackground = backgrounds[this.currentIndex + 1]

    let selected = false;
    setInterval(() => {
        if(!selected){
            currentBackground = backgrounds[this.currentIndex]
            currentBackground.classList.add('backward')
            currentBackground.classList.remove("current")

            this.currentIndex++
            if(this.currentIndex > backgrounds.length - 1){
              this.currentIndex = 0
            }

            nextBackground = backgrounds[this.currentIndex]
            nextBackground.classList.add('current')

            setTimeout(() => {
                currentBackground.classList.remove('backward');
                currentBackground = nextBackground
            }, 2000)
        }
        selected = false;
    }, 5000)
  }

  ngAfterViewInit() {
    this.subscribeToDescriptions()
  }

  subscribeToDescriptions(){
    this.extensionDescriptions.changes.pipe(takeUntil(this.subscription)).subscribe(descriptions => {
      this.fixOverflow(descriptions.toArray())
      this.cdRef.detectChanges()
    })
  }

  ngOnDestroy(){
    this.subscription.next()
    this.subscription.complete()
  }

  fixOverflow(descriptions : QueryList<ElementRef<HTMLElement>>){
    this.initial = true
    descriptions.forEach((description, i) => {
      const node = description.nativeElement
      const container = node.parentElement.parentElement

      container.style.display = 'block'
      node.textContent = this.extensions[i].description  
       
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

      if(i != this.currentIndex){
        container.style.display = 'none'
      }
    })
    this.initial = false
  }
}

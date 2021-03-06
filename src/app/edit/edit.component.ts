import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { ExtensionsService } from '../services/extensions.service';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MouseWheelDirective } from '../helpers/mouse-wheel.directive';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['../create/create.component.css']
})
export class EditComponent implements OnInit {
  @ViewChild('tagsInputElmnt') tagsInputElmnt: ElementRef
  @ViewChild('tagsContainer') tagsContainer: ElementRef
  @ViewChild(MouseWheelDirective) wheelDirective: MouseWheelDirective
  @ViewChild('extensionSection') extensionSection: ElementRef

  nameInput: FormControl = new FormControl()
  gitHubInput: FormControl = new FormControl()
  versionInput: FormControl = new FormControl()
  descriptionInput: FormControl = new FormControl()
  tagsInput: FormControl = new FormControl()

  file: boolean
  formData: FormData
  extension: any
  logoURL: any
  coverURL: any
  gitHub: any

  gitHubAvailable: boolean
  nameAvailable: boolean
  initialName: string
  initialGitHub: string
  gitHubError: string
  nameError: string
  baseUrl: string
  tags: string[]

  constructor(private extensionService : ExtensionsService, private router : Router, private route : ActivatedRoute, private sanitizer: DomSanitizer, private cdRef: ChangeDetectorRef) {
    this.formData = new FormData()
    this.extension = {}
    this.tags = []
    this.gitHubAvailable = true
    this.nameAvailable = true
    this.logoURL = null
    this.coverURL = null
    this.baseUrl = environment.baseUrl
  }

  ngOnInit() {
    this.getExtension(+this.route.snapshot.paramMap.get('id'))

    this.nameInput.valueChanges.pipe(debounceTime(200)).subscribe(name => {
      this.nameError = null
      this.extension.name = name
      if(name != this.initialName){
        this.nameAvailable = undefined
        this.checkName(name)
      }else{
        this.nameAvailable = true
      }
    })
    this.gitHubInput.valueChanges.pipe(debounceTime(200)).subscribe(gitHub => {
      this.gitHubError = null
      this.gitHub = null
      this.extension.gitHubLink = gitHub
      if(gitHub != this.initialGitHub){
        this.gitHubAvailable = undefined
        
        this.checkGithub(gitHub)
      }else{
        this.gitHubAvailable = true
        this.gitHub = {
          user: this.extension.ownerName,
          pullRequests: this.extension.pullRequests,
          lastCommit: this.extension.lastCommit,
          openIssues: this.extension.openIssues
        }
      }
    })
    this.versionInput.valueChanges.pipe(debounceTime(200)).subscribe(version => {
      this.extension.version = version
    })
    this.descriptionInput.valueChanges.pipe(debounceTime(1000)).subscribe(description => {
      this.extension.description = description
    })
    this.tagsInput.valueChanges.subscribe(tag =>{
      if (/\s/.test(tag)) {
        if(tag.length > 1){
          this.addTag(tag)
        }else{
          this.tagsInputElmnt.nativeElement.value = ''
        }
      }
    })
  }
  
  ngAfterViewInit() {
    this.wheelDirective.checkIfMobileScreen()
    this.wheelDirective.submitComponent.extensionSection = this.extensionSection
    this.cdRef.detectChanges()
  }

  editExtension(){
    if(this.nameAvailable && this.gitHubAvailable){
      const id = this.extension.id
      const name = this.nameInput.value
      const github = this.extension.gitHubLink
      const githubId = this.extension.githubId
      const version = this.extension.version
      const description = this.extension.description
      const tags = this.tags.length > 0 ? this.tags.toString() : undefined
      this.gitHubAvailable = undefined

      const extension = {
        id,
        name,
        version,
        description,
        github,
        githubId,
        tags
      }
      this.formData.set('extension', JSON.stringify(extension))
      
      this.extensionService.editExtension(this.extension.id, this.formData).subscribe(
        data => {
          this.gitHubAvailable = true
          this.extensionService.currentExtension = data
          this.router.navigate(['extension', data.id])      
        })
    }
  }

  checkName(name){
    if(name.length == 0){
      this.nameAvailable = null  
    }else if(name.length > 7){
      this.extensionService.checkName(name).subscribe((available: boolean) => {
        this.nameAvailable = available 
        if(!this.nameAvailable){
          this.nameError = 'Name is unavailable.'
        }else{
          this.extension.name = name
          this.nameAvailable = true
        }
      })
    }else{
      this.nameAvailable = false
      this.nameError = 'Name is less than 7 symbolls'
    }
  }

  checkGithub(gitHub){
    const pattern = /^https:\/\/github\.com\/.+\/.+$/
    if(gitHub.length == 0){
      this.gitHubAvailable = null
    }else if(pattern.test(gitHub)){
      this.extensionService.checkGithub(gitHub).subscribe(
        gitHub => {
          this.gitHub = gitHub
          this.gitHubAvailable = true
        },
        error => {
          this.gitHubAvailable = false
          this.gitHubError = error
        })
    }else{
      this.gitHubAvailable = false
      this.gitHubError = 'Link is not a valid repo URL.'
    }
  }
  
  addLogo(e){
    const logo = e.target.files[0]
    this.formData.set('image', logo)
    this.logoURL = window.URL.createObjectURL(logo)

    let reader = new FileReader();
    reader.readAsDataURL(logo); 
    reader.onload = (_event) => { 
      this.logoURL = reader.result; 
    }
  }

  addCover(e){
    const cover = e.target.files[0]
    this.formData.set('cover', cover)
    let reader = new FileReader();
    reader.readAsDataURL(cover); 
    reader.onload = (_event) => { 
      this.coverURL = reader.result; 
    }
  }

  addFile(e){
    const file = e.target.files[0]
    this.file = true
    this.formData.set('file', file)
  }

  addTag(tag){
    tag = tag.trim()
    this.tagsInputElmnt.nativeElement.value = ''
    if(!this.tags.includes(tag)){
      this.tags.push(tag)
      const scrollHeight = this.tagsContainer.nativeElement.scrollHeight
      const offsetHeight = this.tagsContainer.nativeElement.offsetHeight
      if(scrollHeight > offsetHeight){
        this.tags.pop()
      }
    }
  }

  removeTag(tag){
    const index = this.tags.indexOf(tag)
    this.tags.splice(index, 1)
  }

  getExtension(id: number){
    this.extensionService.getExtension(id).subscribe(extension => {
      this.extension = extension
      this.nameInput.setValue(extension.name)
      this.versionInput.setValue(extension.version)
      this.gitHubInput.setValue(extension.gitHubLink)
      this.descriptionInput.setValue(extension.description)

      this.initialName = extension.name
      this.initialGitHub = extension.gitHubLink
      this.tags = extension.tags
      this.coverURL = extension.coverLocation
      this.logoURL = extension.imageLocation
    })
  }

  focusInput(e){
    this.tagsInputElmnt.nativeElement.focus()
  }

  getSanitizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}

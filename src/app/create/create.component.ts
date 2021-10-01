import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms'
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ExtensionsService } from '../services/extensions.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SubmitScrollDirective } from '../helpers/submit-scroll.directive';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  @ViewChild('tagsInputElmnt') tagsInputElmnt: ElementRef<HTMLInputElement>
  @ViewChild('tagsContainer') tagsContainer: ElementRef<HTMLElement>
  @ViewChild(SubmitScrollDirective) wheelDirective: SubmitScrollDirective
  @ViewChild('extensionSection') extensionSection: ElementRef<HTMLElement>

  nameInput: FormControl = new FormControl()
  githubInput: FormControl = new FormControl()
  tagsInput: FormControl = new FormControl()

  extensionForm : FormGroup
  errors: FieldErrors
  error: string

  formData: FormData
  logoURL: any
  coverURL: any
  github: any

  file: boolean
  githubAvailable: boolean
  nameAvailable: boolean
  isLoading: boolean

  tags : string[]

  fileReader = new FileReader();
  subscription: Subject<void> = new Subject<void>();


  constructor(private extensionService: ExtensionsService, private router: Router, private sanitizer: DomSanitizer, private cdRef: ChangeDetectorRef, private fb: FormBuilder) {
    this.formData = new FormData()
    this.tags = []
    this.errors = {}
    this.extensionForm = this.fb.group({
      name : '',
      github : '',
      version : '',
      description : ''
    })
  }

  ngOnInit() {
    this.subscribeToName()
    this.subscribeToGithub()
  }

  subscribeToName(){
    this.extensionForm.get('name').valueChanges.pipe(debounceTime(300), takeUntil(this.subscription)).subscribe(name => {
      this.nameAvailable = null
      this.errors.name = null
      this.checkName(name)
    })
  }

  subscribeToGithub(){
    this.extensionForm.get('github').valueChanges.pipe(debounceTime(300), takeUntil(this.subscription)).subscribe(github => {
      this.githubAvailable = null
      this.github = null
      this.errors.github = null
      
      this.checkGithub(github)
    })
  }

  tagInput(e){
    this.errors.tag = ''
    if(e.code == 'Space' || e.code == 'Enter'){
      const tag = e.target.value.replace(/\s/g, '')
      this.tagsInputElmnt.nativeElement.value = ''

      this.addTag(tag)
    }
  }

  ngAfterViewInit() {
    this.wheelDirective.submitComponent.extensionSection = this.extensionSection
    this.cdRef.detectChanges()
  }

  checkName(name : string){
    if(name.length < 7 || name.length > 30){
      this.errors.name = 'Name must be between 7 and 30 characters.'
      this.nameAvailable = false  
      return  
    }
     
    this.extensionService.checkName(name).pipe(takeUntil(this.subscription)).subscribe((available: boolean) => {
      this.nameAvailable = available
      if(!available){
        this.errors.name = 'Name is already in use.'
      }
    })
  }

  checkGithub(githubLink : string){
    const pattern = /^https:\/\/github\.com\/.+\/.+$/
    if(!pattern.test(githubLink)){
      this.githubAvailable = false
      this.errors.github = 'Link is not a valid github.'
      return
    }

    this.extensionService.checkGithub(githubLink).pipe(takeUntil(this.subscription)).subscribe(
      github => {
        this.github = github
        this.githubAvailable = true
      },
      error => {
        this.githubAvailable = false
        this.errors.github = error.error
    })
  }

  createExtension(){
    if(!this.errors.github && !this.errors.name){
      const { name, github, version, description } = this.extensionForm.value

      if(this.tags.length > 0) this.formData.set('tags', this.tags.toString()) 

      this.formData.set('name', name)
      this.formData.set('github', github)
      this.formData.set('version', version)
      this.formData.set('description', description)

      this.isLoading = true
      this.extensionService.createExtension(this.formData).pipe(takeUntil(this.subscription)).subscribe(
        data => {
          this.isLoading = false
          this.githubAvailable = true
          this.extensionService.currentExtension = data
          this.router.navigate(['extension', data.id])
        },
        (err : HttpErrorResponse) => {
          this.handleError(err)
        })
    }
  }

  handleError(err : HttpErrorResponse){
    this.isLoading = false

    if(err.error.name){
      this.nameAvailable = false
    }
    if(err.error.github){
      this.githubAvailable = false
    }

    if(err.status == 422){
      this.errors = err.error
    }else{
      this.error = err.error
    }
  }
  
  addLogo(e){
    const logo = e.target.files[0]
    this.formData.set('image', logo)
    this.logoURL = window.URL.createObjectURL(logo)
  }

  addCover(e){
    const cover = e.target.files[0]
    this.formData.set('cover', cover)
    this.coverURL = window.URL.createObjectURL(cover)
  }

  addFile(e){
    const file = e.target.files[0]
    this.file = true
    this.formData.set('file', file)
  }

  getSanitizeUrl(url : string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  addTag(tag : string){
    if(tag.length == 0 || tag.length > 30){
      this.errors.tag = `Tag can't be empty or more than 30 characters.`
      return
    }

    if(this.tags.includes(tag)){
      this.errors.tag = 'Tag already exists.'
      return
    }
   
    this.tags.push(tag)
    const scrollHeight = this.tagsContainer.nativeElement.scrollHeight
    const offsetHeight = this.tagsContainer.nativeElement.offsetHeight

    if(scrollHeight > offsetHeight){
      this.tags.pop()
      this.errors.tag = 'You have reached maximum amount of tags.'
    }
  }

  removeTag(tag : string){
    const index = this.tags.indexOf(tag)
    this.tags.splice(index, 1)
  }
}

type FieldErrors = {
  name? : string
  version? : string
  description? : string
  github? : string
  tag? : string
}
import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { NgForm } from '@angular/forms'
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @ViewChild('password') 
  password:ElementRef;

  @ViewChild('repeatPassword') 
  repeatPassword : ElementRef;
  
  errors : FieldErrors
  error : string
  userForm : FormGroup
  formData : FormData
  page : number
  filePlaceholder : string
  
  constructor(private authService : AuthService ,private userService : UserService, private router : Router, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: [''],
      email: [''],
      password: [''],
      repeatPassword: [''],
      country: [''],
      info: ['']
    });

    this.formData = new FormData()
    this.page = 1
    this.filePlaceholder = 'logo'
    this.errors = {}
  }

  ngOnInit() { }

  addLogo(e){
    const logo = e.target.files[0]
    this.filePlaceholder = logo.name
    this.formData.set('image', logo)
  }

  validatePassword(){
    let message = ''
    if(this.password.nativeElement.value != this.repeatPassword.nativeElement.value){
      message = 'Passwords must match.'
    }
    this.password.nativeElement.setCustomValidity(message)
  }

  register(){
    const { username, email, password, country, info } = this.userForm.value

    this.formData.set('username', username)
    this.formData.set('email', email)
    this.formData.set('password', password)
    this.formData.set('country', country)
    this.formData.set('info', info)

    this.userService.register(this.formData).subscribe(
      res  => {
        localStorage.setItem('user', JSON.stringify(res))
        this.authService.setUserDetails(res)
        this.router.navigate(['home'])

      },
      err => {
        if(err.status == 422){
          let page = 3; 
          this.errors = err.error
          const { username, email, password } = this.errors
          
          if(username || email){
            page = 1
          }else if(password){
            page = 2;
          }
  
          this.page = page;
        }else{
          this.error = err.error
        }
      });
  }
}

interface FieldErrors{
  username?: string,
  email?: string,
  password?: string,
  country?: string,
  info?: string
}
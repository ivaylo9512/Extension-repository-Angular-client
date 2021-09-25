import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { NgForm } from '@angular/forms'
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  formData : FormData
  errors : any[]
  next : boolean
  filePlaceholder = 'logo'

  constructor(private authService : AuthService ,private userService : UserService, private router : Router) {
    this.formData = new FormData()
    this.next = false
  }

  ngOnInit() { }

  addLogo(e){
    const logo = e.target.files[0]
    this.filePlaceholder = logo.name
    this.formData.set('image', logo)
  }

  register(userForm : NgForm){
    if(this.next){
      const username =  userForm.controls['username'].value
      const password = userForm.controls['password'].value
      const repeatPassword = userForm.controls['repeat-password'].value

      const user = {
        username,
        password,
        repeatPassword
      }

      this.formData.set('user', JSON.stringify(user))
      this.userService.register(this.formData).subscribe(
        data => {
          localStorage.setItem('Authorization', data['token'])
          localStorage.setItem('user', JSON.stringify(data))
          this.authService.setUserDetails(data)
          this.router.navigate(['home'])

        },
        err  => this.errors = err['errors']
      );
    }
  }
}

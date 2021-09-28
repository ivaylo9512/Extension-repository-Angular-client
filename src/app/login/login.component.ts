import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  error: string;
  returnUrl: string

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home'
  }

  login(userForm : NgForm) {
    const username =  userForm.controls['username'].value
    const password = userForm.controls['password'].value

    this.authService.login(username, password).subscribe(
      data => {
        localStorage.setItem('Authorization', data.headers.get('Authorization'))
        localStorage.setItem('user', JSON.stringify(data.body))
        this.authService.setUserDetails(data.body)
        this.router.navigate([this.returnUrl])
      },
      err  => this.error = err.error
    );
  }

}

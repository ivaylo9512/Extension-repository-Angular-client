import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isLoggedIn : boolean;

  constructor(private auth : AuthService) { }

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn

  }

}

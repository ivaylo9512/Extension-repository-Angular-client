import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service'
import { ProfileScrollDirective } from '../helpers/profile-scroll-directive';
import { ProfileAnimationService } from '../services/profile.animation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild(ProfileScrollDirective) wheelDirective: ProfileScrollDirective

  constructor(private authService: AuthService, private profileAnimationService: ProfileAnimationService) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}

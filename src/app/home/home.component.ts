import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service'
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ProfileComponent } from '../profile/profile.component';
import { FavExtensionsComponent } from '../fav-extensions/fav-extensions.component';
import { ProfileScrollDirective } from '../helpers/profile-scroll-directive';
import { ProfileAnimationService } from '../services/profile.animation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@NgModule({
  declarations: [
    ProfileComponent,
    FavExtensionsComponent
  ],
  imports: [
    BrowserModule,
  ],
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

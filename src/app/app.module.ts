import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http'
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { RequestsInterceptor } from './helpers/requests-interceptor'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { ExtensionsListComponent } from './extensions-list/extensions-list.component';
import { ExtensionComponent } from './extension/extension.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { DiscoverComponent } from './discover/discover.component';
import { PendingsComponent } from './pendings/pendings.component';
import { AdminComponent } from './admin/admin.component';
import { CreateComponent } from './create/create.component';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TagsComponent } from './tags/tags.component';
import { RegisterComponent } from './register/register.component';
import { FavExtensionsComponent } from './fav-extensions/fav-extensions.component';
import { AuthGuard } from './helpers/auth.guard';
import { ProfileScrollDirective } from './helpers/profile-scroll-directive';
import { SubmitScrollDirective } from './helpers/submit-scroll.directive';
import { ExtensionScrollDirective } from './helpers/extension-scroll.directive';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ExtensionsListComponent,
    ProfileComponent,
    ExtensionComponent,
    DiscoverComponent,
    PendingsComponent,
    AdminComponent,
    CreateComponent,
    HeaderComponent,
    TagsComponent,
    RegisterComponent,
    SubmitScrollDirective,
    ProfileScrollDirective,
    ExtensionScrollDirective,
    FavExtensionsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      { 
        path: 'extension/:id', 
        component: ExtensionComponent
      },
      { 
        path: 'admin', 
        component: AdminComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'tag/:tag', 
        component: TagsComponent,
        runGuardsAndResolvers: 'always'
      },
      { 
        path: 'discover', 
        component: DiscoverComponent,
        runGuardsAndResolvers: 'always'
      },
      { 
        path: 'create', 
        component: CreateComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'pendings', 
        component: PendingsComponent,
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard]
      },
      { 
        path:'profile/:id', 
        component: ProfileComponent,
        runGuardsAndResolvers: 'always'
      },
      { 
        path: 'home', 
        component: HomeComponent,
        runGuardsAndResolvers: 'always'
      },
      { 
        path: '**', 
        redirectTo: '/home',
        runGuardsAndResolvers: 'always',
      },
    ],{onSameUrlNavigation : 'reload',})
  ],
  providers: [
    { 
      provide: HTTP_INTERCEPTORS, useClass: RequestsInterceptor, multi: true 
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

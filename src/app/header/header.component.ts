import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MouseWheelDirective } from '../helpers/mouse-wheel.directive';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('header') header: ElementRef
  @ViewChild('mouseWheel') mouseWheel: MouseWheelDirective

  constructor(private authService: AuthService) { 
  }

  ngOnInit() {
  }
  
  ngAfterViewInit(){
  }

}

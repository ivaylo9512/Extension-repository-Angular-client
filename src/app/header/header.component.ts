import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('header') header: ElementRef

  constructor(private authService: AuthService) { 
  }

  ngOnInit() {
  }
  
  ngAfterViewInit(){
  }

}

import { Component, OnInit, TemplateRef } from '@angular/core';
import { ViewChild,ElementRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ToastrService } from 'ngx-toastr';
 import { SignupService } from '../../services/signup.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers:[SignupService]
})
export class NavbarComponent implements OnInit {

  modalRef: BsModalRef;

  @ViewChild('mySidenav') public mySidenav:ElementRef;
  @ViewChild('sidenav') public sidenav:ElementRef;

  public shown:boolean;
  public i:number = 0;

  year:any;

  constructor(
    public element:ElementRef,
    private toastr: ToastrService,
    public signup:SignupService,
    private modalService: BsModalService
  ) { 
    this.shown = false;
    this.year = new Date().getFullYear();
  }

  ngOnInit() {
    //this.sidenav.nativeElement.style.display = "none";
  }

  showcollapse(){
    if(this.i%2==0){
      //console.log("show");
      this.shown = true;
    }else{
      //console.log("hide");
      this.shown = false;
    }
    this.i++;
  }

  openNav(){
    let width = this.mySidenav.nativeElement.style.width;
    if(width == "250px"){
      this.mySidenav.nativeElement.style.width = "0";
    }else{
      this.mySidenav.nativeElement.style.width = "250px";
    }
  }

  closeNav(){
    this.mySidenav.nativeElement.style.width = "0";
  }

  doLogout(template: TemplateRef<any>){
    this.mySidenav.nativeElement.style.width = "0";
    //console.log("im clicked");
    this.modalRef = this.modalService.show(template,{class: 'modal-sm'});
  }

  confirm(): void {
    this.signup.logoutFromApp();
    this.modalRef.hide();
  }
 
  decline(): void {
    this.toastr.info("You are continuing token bazaar","Continued...",{timeOut:2500});
    this.modalRef.hide();
  }
}

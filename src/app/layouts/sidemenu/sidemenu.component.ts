import { Component, OnInit, TemplateRef } from '@angular/core';

// import { ServiceapiService } from '../../services/serviceapi.service';
// import { SignupService } from '../../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { ToastrService } from 'ngx-toastr';

// import * as jQuery from 'jquery';

// declare const jQuery:any; 

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css'],
  // providers:[SignupService,ServiceapiService]
})
export class SidemenuComponent implements OnInit {

  mycurrentpage:string;

  modalRef: BsModalRef;
  
  isClassActive:string;

  constructor(
    // public serv:ServiceapiService,
    private storage:LocalStorageService,
    private toastr: ToastrService,
    // public signup:SignupService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService
  ) { 
    //console.log(this.route);
    let path = this.route.routeConfig.path;
    //console.log(path)
    if(path == "home" || path == "transactions"){
      this.isClassActive = "active";
    }else{
      this.isClassActive = "";
    }
  }

  ngOnInit() {
  }

  doLogout(template: TemplateRef<any>){
    //console.log("im clicked");
    this.modalRef = this.modalService.show(template,{class: 'modal-sm'});
  }

  confirm(): void {
   // this.signup.logoutFromApp();
    this.modalRef.hide();
  }
 
  decline(): void {
    this.toastr.info("You are continuing token bazaar","Continued...",{timeOut:2500});
    this.modalRef.hide();
  }

}

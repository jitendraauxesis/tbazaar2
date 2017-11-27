import { Component, OnInit, TemplateRef } from '@angular/core';

import { ServiceapiService } from '../../services/serviceapi.service';
import { SignupService } from '../../services/signup.service';

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
  providers:[SignupService,ServiceapiService]
})
export class SidemenuComponent implements OnInit {

  mycurrentpage:string;

  modalRef: BsModalRef;
  
  isClassActive:string;

  constructor(
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    private toastr: ToastrService,
    public signup:SignupService,
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

  clickonReferral(){
    let status = this.signup.retrieveFromLocal("AUXUserAddReferralStatus");//,"none" // "done"
    if(status == "done" || status){
      this.router.navigate(["/referral"]);
    }else{
      this.router.navigate(["/addreferral"]);
    }
  }

  doLogout(template: TemplateRef<any>){
    //console.log("im clicked");
    this.modalRef = this.modalService.show(template,{class: 'modal-sm'});
  }

  confirm(): void {
    this.signup.logoutFromApp();
    this.modalRef.hide();
  }
 
  decline(): void {
    let name = this.signup.retrieveFromLocal("AUXMassUserName");
    this.toastr.info("Dear "+name+"! , you are continuing token bazaar","Continued...",{timeOut:2500});
    this.modalRef.hide();
  }

  checkKYC(){
    let status = this.signup.retrieveFromLocal("AUXKYCStatus"); 
    if(status == "nokyc"){
      this.toastr.error("You have not uploaded the KYC documents","Upload KYC",{timeOut:2500});
      this.router.navigate(["/kyc"]);
    }else if(status == "done"){
      this.toastr.success("You are KYC detail is verified by administrator","KYC is verified",{timeOut:2500});
    }else if(status == "pending"){
      this.toastr.warning("You are KYC detail is pending from administrator, wait while admin verified it.","KYC is in pending stage",{timeOut:2500});
    }else if(status == "rejected"){
      this.toastr.error("You are KYC detail has been rejected","KYC rejected",{timeOut:2500});
    }else if(status == false){
      this.toastr.error("You have not uploaded the KYC documents","Upload KYC",{timeOut:2500});
      this.router.navigate(["/kyc"]);
    }else if(status == true){
      this.toastr.success("You are KYC detail is verified by administrator","KYC is verified",{timeOut:2500});
    }else if(status == "accepted"){
      this.toastr.success("You are KYC detail is verified by administrator","KYC is verified",{timeOut:2500});
    }else{
      this.toastr.error("You have not uploaded the KYC documents","Upload KYC",{timeOut:2500});
      this.router.navigate(["/kyc"]);
    }
  }

}

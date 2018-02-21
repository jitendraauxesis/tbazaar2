import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';

import { ServiceapiService } from '../services/serviceapi.service';
import { SignupService } from '../services/signup.service';

import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-masswallet',
  templateUrl: './masswallet.component.html',
  styleUrls: ['./masswallet.component.css']
})
export class MasswalletComponent implements OnInit {

  public errmsg:any;public sucmsg:any;
  public mssg:string = "";

  loadingimage:boolean = false;

  formMassAddress:FormGroup;

  masscoinaddress:any;
  etheraddress:any;

  referralbtnTxt:string = "Submit";
  public ngxloading  = false;

  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  @ViewChild('otpmodal') otpmodal:ElementRef;
  otpnumber:any;
  otptab:number = 1;

  constructor(
    public serv:ServiceapiService,
    public signup:SignupService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService,
    private formBuilder:FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,

  ) {
    this.formMassAddress = formBuilder.group({
      'masscoin':['',Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.loadAuth();
  }

  loadAuth(){
    let isAuth = this.storage.retrieve("AUXAuthLogin");
    let cookieExists = this.signup.checkUserActivity();
    if(isAuth == null){
      this.signup.UnAuthlogoutFromApp(); 
    }
    else if(cookieExists == false){
      this.storage.store("AUXAuthLogin",false);
      this.signup.UnAuthlogoutFromApp();
    }
    else{
      // console.log("isAuthorized",isAuth,cookieExists);
      this.loadifMsg();
    }
  }

  loadifMsg(){
    let retrieve = this.signup.retrieveRouteMsgPass();
    let msg;
    if(retrieve != null){
      msg = retrieve;
      this.printmsg(msg);
      setTimeout(()=>{
        msg = "";
        this.signup.removeRouteMsgPass();
      },2000);
    }

    let masscoinaddress = this.signup.retrieveFromLocal("AUXUserWalletmasscoinaddress");
    if(masscoinaddress == "" || masscoinaddress == null || !masscoinaddress){
      // this.loadFromCookie();
      // console.log("do not touch form inputs",masscoinaddress,this.signup.retrieveRefundAddress("AUXUserWalletmasscoinaddress")); 
    }else{ 
      this.referralbtnTxt = "Update";
      this.masscoinaddress = masscoinaddress;
    }
  }

  
  
  printmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2500);
  }

  addaddress(){
    // console.log(this.formMassAddress)
    if(this.formMassAddress.valid){
      let btc = this.formMassAddress.value.masscoin;
      if(btc == null || btc == ""){
        this.toastr.error("Masscoin address are invalid", 'Try again!',{timeOut:2500});
        // this.printmsg("Masscoin address are invalid, try again.");
      }else{
        // console.log(this.formMassAddress);
        this.sendToMass();
      }
    }else{
      this.toastr.error("Addresses are invalid", 'Try again!',{timeOut:2500});
      // this.printmsg("Addresses are invalid, try again.");
    } 
  }

  sendToMass(){
    this.loadingimage = true;
    let d = {
      'email':this.signup.retrieveFromLocal("AUXUserEmail"),
      'token':this.signup.retrieveFromLocal("AUXHomeUserToken")
    };
    // console.info(d);
    this.serv.resolveApi("send_masscoin_otp",d)
    .subscribe(
      res=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        if(response != null || response != ""){
          // console.log(response);
          if(response.code == 200){
            if(response.mail_sent = true){
              this.openmodal();
              this.toastr.success("Mail sent for otp", null,{timeOut:2500});
            }
          }else if(response.code == 400){
            this.toastr.error("Addresses are invalid", 'Try again!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            // logout
            this.signup.UnAuthlogoutFromApp();
          }
        }else{
          this.toastr.error("OTP unable to send", 'Try again!',{timeOut:2500});
        }
      },
      err=>{
          this.loadingimage = false;
          this.toastr.error("OTP unable to send", 'Try again!',{timeOut:2500});
      }
    );
  }

  notnow(){
    if(this.referralbtnTxt == "Update"){
      this.router.navigate(["/referral"]);
    }else{
      this.router.navigate(["/home"]);
    }
  }

  gohome(){
    // this.ifValue();
    this.router.navigate(["/home"]);
  }


  openmodal(){
    this.modalRef = this.modalService.show(
      this.otpmodal,
        Object.assign({}, this.config, { class: 'gray modal-md' })
    );
  }

  hideme(){
    this.modalRef.hide();
  }

  sendOTP(){
    // console.log("ok",this.otpnumber)
    // this.otptab = 2;
    if(this.otpnumber == "" || this.otpnumber == null){
      this.toastr.error("OTP is empty", 'Try again!',{timeOut:2500});
    }else{

      this.loadingimage = true;
      let d = {
        'email':this.signup.retrieveFromLocal("AUXUserEmail"),
        'token':this.signup.retrieveFromLocal("AUXHomeUserToken"),
        'otp':this.otpnumber
      };
      // console.info(d);
      this.serv.resolveApi("verify_masscoin_otp",d)
      .subscribe(
        res=>{
          // this.loadingimage = false;
          let response = JSON.parse(JSON.stringify(res));
          if(response != null || response != ""){
            // console.log(response);
            if(response.code == 200){
              if(response.otp_match = true){
                this.sendToUpdateAddress();
              }
            }else if(response.code == 400){
              this.loadingimage = false;
              this.toastr.error("OTP doesn't matched", 'Try again!',{timeOut:2500});
            }else if(response.code == 401){
              this.signup.UnAuthlogoutFromApp();
            }else{
              // logout
              this.signup.UnAuthlogoutFromApp();
            }
          }else{this.loadingimage = false;
            this.toastr.error("OTP unable to verify", 'Try again!',{timeOut:2500});
          }
        },
        err=>{
            this.loadingimage = false;
            this.toastr.error("OTP unable to verify", 'Try again!',{timeOut:2500});
        }
      );
    }
  }

  sendToUpdateAddress(){
    // console.log("ok",this.otpnumber)
    // this.otptab = 2;
   

      this.loadingimage = true;
      let d = {
        'email':this.signup.retrieveFromLocal("AUXUserEmail"),
        'token':this.signup.retrieveFromLocal("AUXHomeUserToken"),
        'masscoin_address':this.formMassAddress.value.masscoin
      };
      // console.info(d);
      this.serv.resolveApi("set_masscoin_address",d)
      .subscribe(
        res=>{
          this.loadingimage = false;
          let response = JSON.parse(JSON.stringify(res));
          if(response != null || response != ""){
            // console.log(response);
            if(response.code == 200){
              if(response.address_validation = true){
                this.otptab = 2;
                this.masscoinaddress = this.formMassAddress.value.masscoin;
                this.signup.saveToLocal("",this.masscoinaddress);
              }
            }else if(response.code == 400){
              if(response.error == 'email_id_is_already_associated_with_address'){
                this.toastr.info("Email id is already associated with your address", null,{timeOut:2500});
              }else if(response.error == 'masscoin_node_not_running'){
                this.toastr.info("Masscoin not not running", null,{timeOut:2500});
              }else{
                this.toastr.error("Request failed", 'Try again!',{timeOut:2500});
              }
            }else if(response.code == 401){
              if(response.address_validation == false){
                this.loadingimage = false;
                this.toastr.error("MASS address validation failed", null,{timeOut:2500});
              }else if(response.token_match == false){
                this.signup.UnAuthlogoutFromApp();
              }else{
                this.signup.UnAuthlogoutFromApp();
              }
            }else{
              // logout
              this.signup.UnAuthlogoutFromApp();
            }
          }else{
            this.loadingimage = false;
            this.toastr.error("Request unable to proceed", 'Try again!',{timeOut:2500});
          }
        },
        err=>{
            this.loadingimage = false;
            this.toastr.error("Request unable to succeed", 'Try again!',{timeOut:2500});
        }
      );
  }

  donefinally(){
    this.hideme();
    this.setupInitForModel();
  }

  setupInitForModel(){
    this.otptab  = 1;
    this.otpnumber = "";
  }

}

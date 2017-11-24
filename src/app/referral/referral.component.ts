import { Component, OnInit, TemplateRef } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { ServiceapiService } from '../services/serviceapi.service';
import { SignupService } from '../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css'],
  providers:[ServiceapiService,SignupService]
})
export class ReferralComponent implements OnInit {

  referraladdressvalue:string;
  referridvalue:string = "tx234235235";

  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  }; 
  loadingimage:boolean = false;

  btcwithdrawntab:number = 1;
  ethwithdrawntab:number = 1;

  sendUrl = location.href;

  constructor(
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    public signup:SignupService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    let loadurl = this.router.url;
    if(loadurl == "/referral"){
      this.loadReferralAuth();
      console.log("its current url");
    }else if(loadurl == "/referral/address"){
      this.router.navigate(["/referral"]);
    }else{//if url in /referral/address/refid
      let referenceid = this.route.snapshot.paramMap.get("refid");
      // console.log("its ref url",referenceid,"\nredirect and save");
      this.signup.saveToLocal("AUXUserReferralID",referenceid);
      this.router.navigate(["/login"]);
    }
    // console.log(this.router.url,this.sendUrl)
    // this.urlShortener();
  } 

  urlShortener(){
    let url = this.referraladdressvalue;
    let spliturl = url.split("?=");
    console.log(spliturl[1])
  }

  loadReferralAuth(){
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
      this.checkReferral();
      this.callApi();//call in referral
      this.referraladdressvalue = this.sendUrl+"/address/"+"someotherreferral";
    }
  }

  checkReferral(){
    let etheraddress = this.storage.retrieve("AUXUserReferralEtherAddress");
    let bitcoinaddress = this.storage.retrieve("AUXUserReferralBitcoinAddress");
    if(etheraddress == "" || etheraddress == null || !etheraddress){
      console.log("Redirect to addreferral");
    }else if(bitcoinaddress == "" || bitcoinaddress == null || !bitcoinaddress){
      console.log("Redirect to addreferral");
    }else{
      console.log("proceed to callapi()");
      //this.callApi();
    }
  }

  copytext(referraladdress){
    this.toastr.info('Referral address is copied to your clipboard!', 'Copied text!!!',{timeOut:1200});
  }

  copytext2(referrid){
    this.toastr.info('Referral id is copied to your clipboard!', 'Copied text!!!',{timeOut:1200});
  }

  open_btc_modal(btcmodal: TemplateRef<any>){
    this.modalRef = this.modalService.show(
      btcmodal,
        Object.assign({}, this.config, { class: 'gray modal-md' })
    );
  }

  open_eth_modal(ethmodal: TemplateRef<any>){
    this.modalRef = this.modalService.show(
      ethmodal,
        Object.assign({}, this.config, { class: 'gray modal-md' })
    );
  }

  callApi(){
    let d = {
      'email':this.signup.retrieveFromLocal("AUXUserEmail"),
      'token':this.signup.retrieveFromLocal("AUXHomeUserToken")
    };
    this.serv.resolveApi("get_referral_details",d)
    .subscribe(
      res=>{
        let response = JSON.parse(JSON.stringify(res));
        if(response != null || response != ""){
          console.log(response);
        }else{
          console.log(response);
        }
      },
      err=>{
          console.error(err);
          this.toastr.error('Referral detail not retrieved', 'Not a valid response',{timeOut:2500});
        }
      );
  }

  hideme(){
    this.modalRef.hide();
  }

  sendBTC(){
    this.btcwithdrawntab = 2;
  }

  confirmBTC(){
    this.modalRef.hide();
    this.btcwithdrawntab = 1;
    this.toastr.success('BTC withdrawn successfully completed!', 'Done!',{timeOut:5000});
  }

  sendETH(){
    this.ethwithdrawntab = 2;
  }

  confirmETH(){
    this.modalRef.hide();
    this.ethwithdrawntab = 1;
    this.toastr.success('ETH withdrawn successfully completed!', 'Done!',{timeOut:5000});
  }

}

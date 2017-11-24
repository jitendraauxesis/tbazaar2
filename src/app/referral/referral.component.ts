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

import _ from 'lodash';

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

  //populateScope
  cardbtcearned:any;cardbtcwithdrawn:any;cardbtcpending:any;
  cardethearned:any;cardethwithdrawn:any;cardethpending:any;

  referral_details_list:any;referral_details_list_alert:boolean = false;
  child_details:any;child_details_alert:boolean = false;

  modalbtcpending_amount:any;modalbtcwithdraw_address:any;modalbtcamount_to_be_paid:any;modalbtcfee:any;
  modalethpending_amount:any;modalethwithdraw_address:any;modalethamount_to_be_paid:any;modalethfee:any;

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
      // console.log("its current url");
    }else if(loadurl == "/referral/address"){
      this.router.navigate(["/referral"]);
    }else{//if url in /referral/address/refid
      let referenceid = this.route.snapshot.paramMap.get("refid");
      // console.log("its ref url",referenceid,"\nredirect and save");
      this.signup.saveToLocal("AUXUserReferralID",referenceid);
      this.router.navigate(["/login"]);
    }
    // console.log(this.router.url,this.sendUrl)
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
      // this.callApi();//call in referral
      this.referraladdressvalue = this.sendUrl+"/address/";
    }
  }

  checkReferral(){
    let retrieve = this.signup.retrieveRouteMsgPass();
    let msg;
    if(retrieve != null){
      msg = retrieve;
      setTimeout(()=>{this.toastr.success('Refund address is taken!', 'Done!',{timeOut:1200});},1200);
      setTimeout(()=>{
        msg = "";
        this.signup.removeRouteMsgPass();
      },2000);
    }

    let etheraddress = this.storage.retrieve("AUXUserRefundEtherAddress");
    let bitcoinaddress = this.storage.retrieve("AUXUserRefundBitcoinAddress");
    if(etheraddress == "" || etheraddress == null || !etheraddress){
      // console.log("Redirect to addreferral");
      this.signup.setRouteMsgPass("BTH & ETH address is not taken try to add");
      this.router.navigate(["/addreferral"]);
    }else if(bitcoinaddress == "" || bitcoinaddress == null || !bitcoinaddress){
      // console.log("Redirect to addreferral");
      this.signup.setRouteMsgPass("BTH & ETH address is not taken try to add");
      this.router.navigate(["/addreferral"]);
    }else{
      // console.log("proceed to callapi()");
      this.callApi();
    }
  }

  copytext(referraladdress){
    this.toastr.info('Referral address is copied to your clipboard!', 'Copied text!!!',{timeOut:1200});
  }

  copytext2(referrid){
    this.toastr.info('Referral id is copied to your clipboard!', 'Copied text!!!',{timeOut:1200});
  }

  open_btc_modal(btcmodal: TemplateRef<any>){
    this.callToOpenModal('btc',btcmodal);
  }

  open_eth_modal(ethmodal: TemplateRef<any>){
    this.callToOpenModal('eth',ethmodal);
  }

  callToOpenModal(type,modal){
    let d = {
      'email':this.signup.retrieveFromLocal("AUXUserEmail"),
      'token':this.signup.retrieveFromLocal("AUXHomeUserToken"),
      'currency':type
    };
    console.info(d);
    this.serv.resolveApi("init_withdraw",d)
    .subscribe(
      res=>{
        let response = JSON.parse(JSON.stringify(res));
        console.log()
        if(response != null || response != ""){
          console.log(response);
          if(response.code == 200){
            let data = response.data;
            if(type == 'btc'){
              this.modalbtcpending_amount = data.pending_amount;
              this.modalbtcwithdraw_address = data.withdraw_address;
              this.modalbtcamount_to_be_paid = data.amount_to_be_paid;
              this.modalbtcfee = data.fee;
            }
            if(type == 'eth'){
              this.modalethpending_amount = data.pending_amount;
              this.modalethwithdraw_address = data.withdraw_address;
              this.modalethamount_to_be_paid = data.amount_to_be_paid;
              this.modalethfee = data.fee;
            }
            this.modalRef = this.modalService.show(
              modal,
                Object.assign({}, this.config, { class: 'gray modal-md' })
            );
          }else if(response.code == 400){
            this.toastr.error('Unable to calculate mining fee for '+type, 'Mining Fee Error',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            // logout
            this.signup.UnAuthlogoutFromApp();
          }
        }else{
          // console.log(response);
          this.toastr.error('Withdrawn detail not available', 'Not a valid response',{timeOut:2500});
        }
      },
      err=>{
          console.error(err);
          this.toastr.error('Withdrawn detail not retrieved', 'Not a valid response',{timeOut:2500});
      }
    );
  }

  callApi(){
    let d = {
      'email':this.signup.retrieveFromLocal("AUXUserEmail"),
      'token':this.signup.retrieveFromLocal("AUXHomeUserToken")
    };
    // console.info(d);
    this.serv.resolveApi("get_referral_details",d)
    .subscribe(
      res=>{
        let response = JSON.parse(JSON.stringify(res));
        if(response != null || response != ""){
          console.log(response);
          if(response.code == 200){

            this.referridvalue = response.referral_json.ref_id;
            this.referraladdressvalue = this.sendUrl+"/address/"+this.referridvalue;

            this.cardbtcearned = response.referral_json.earned_btc;
            this.cardbtcwithdrawn = response.referral_json.withdrawn_btc;
            this.cardbtcpending = response.referral_json.pending_btc;

            this.cardethearned = response.referral_json.earned_eth;
            this.cardethwithdrawn = response.referral_json.withdrawn_eth;
            this.cardethpending = response.referral_json.pending_eth;

            this.referral_details_list = response.referral_json.referral_details_list;
            if(this.referral_details_list.length > 0){
              this.referral_details_list_alert = true;//populate it
            }else{
              this.referral_details_list_alert = false;
            }

            this.child_details = response.referral_json.child_details;
            if(this.child_details.length > 0){
              this.child_details_alert = true;//populate it
            }else{
              this.child_details_alert = false;
            }

          }else if(response.code == 400){
            this.signup.setRouteMsgPass("BTH & ETH address is not taken try to add");
            this.router.navigate(["/addreferral"]);
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            // logout
            this.signup.UnAuthlogoutFromApp();
          }
        }else{
          // console.log(response);
          this.toastr.error('Referral detail not retrieved', 'Not a valid response',{timeOut:2500});
        }
      },
      err=>{
          // console.error(err);
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

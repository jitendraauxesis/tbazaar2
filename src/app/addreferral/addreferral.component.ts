import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';

import { SignupService } from '../services/signup.service';

import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';
@Component({
  selector: 'app-addreferral',
  templateUrl: './addreferral.component.html',
  styleUrls: ['./addreferral.component.css']
})
export class AddreferralComponent implements OnInit {

  public errmsg:any;public sucmsg:any;
  public mssg:string = "";

  loadingimage:boolean = false;

  formReferral:FormGroup;

  bitcoinaddress:any;
  etheraddress:any;

  constructor(
    public signup:SignupService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService,
    private formBuilder:FormBuilder

  ) {
    this.formReferral = formBuilder.group({
      'bitcoin':['',Validators.compose([Validators.required])],
      'ether':['',Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.loadAddReferralAuth();
  }

  loadAddReferralAuth(){
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
      this.loadifReferral();
    }
  }

  loadifReferral(){
    let etheraddress = this.storage.retrieve("AUXUserReferralEtherAddress");
    let bitcoinaddress = this.storage.retrieve("AUXUserReferralBitcoinAddress");
    if(etheraddress == "" || etheraddress == null || !etheraddress){
      console.log("do not touch form inputs");
    }else if(bitcoinaddress == "" || bitcoinaddress == null || !bitcoinaddress){
      console.log("do not touch form inputs"); 
    }else{
      this.bitcoinaddress = bitcoinaddress;// console.log("append to btcaddress");
      this.etheraddress = etheraddress;// console.log("append to etheraddress");
    }
  }
  
  printmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2500);
  }

  addreferral(){
    console.log(this.formReferral)
    if(this.formReferral.valid){
      let btc = this.formReferral.value.bitcoin;
      let eth = this.formReferral.value.ether;
      if(btc == null || btc == ""){
        this.printmsg("Bitcoin address are invalid, try again.");
      }else if(eth == null || eth == ""){
        this.printmsg("Ether address are invalid, try again.");
      }else{
        console.log(this.formReferral);
      }
    }else{
      this.printmsg("Addresses are invalid, try again.");
    }
  }
}

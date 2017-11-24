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

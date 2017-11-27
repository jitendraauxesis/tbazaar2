import { Component,ElementRef, OnInit, Renderer2, ViewChild,Input,SimpleChanges, TemplateRef } from '@angular/core';

import { ServiceapiService } from '../services/serviceapi.service';
import { SignupService } from '../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { ToastrService } from 'ngx-toastr';

// import * as jQuery from 'jquery';

// declare const jQuery:any; 

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params


import * as moment from 'moment';
import _ from 'lodash';


import { CookieService } from 'ngx-cookie-service';//
@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.component.html',
  styleUrls: ['./userhome.component.css'],
  providers:[ServiceapiService,SignupService]
})
export class UserhomeComponent implements OnInit {

  public apiMethod:string;
  public collapsed:boolean = true;

  public optradio:string;
  public cas:any;

  public homeStatusDone:boolean = true;
  public homeStatusYet:boolean = false;
  public homeStatusYetText:string = "";

  public user_timeline_list:any = [];
  public user_timeline_listShow:boolean = false;

  public qrvalue:any;

  loadingimage:boolean = false;

  radioclick:string = 'btc';
  userchk:any;
  ok:any = "parent";
  timestamp:string = "timestamp";
  reverse:boolean = true;

  kycalertpanel:number;kycalertpanelview:boolean;

  tokens:any;

  constructor(
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    private sessionStorage:SessionStorageService,
    private toastr: ToastrService,
    public signup:SignupService,
    public element:ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService//
  ) {
    this.qrvalue = "Its Demo For QR Angular";
    //this.signup.setUserSession(this.storage.retrieve("AUXUserEmail"),"7764611b-fdee-4804-8f2f-fab678e63526a704b8ef-5cb5-45b1-b367-98c89b91f1aeba1abd08-0b64-4f05-8d60-a049344a1a28");
  }

  keyevent(evt){
       var charCode = (evt.which) ? evt.which : evt.keyCode;
       if (charCode != 46 && charCode > 31 
         && (charCode < 48 || charCode > 57) ){
           //let cs = (this.cas).toString();
           //cs = cs.substr(0,cs.length-1);
          //this.cas = cs;
          return false;
        }
        if(charCode === 46 || charCode === 190 ){
          return false;
        }
        //this.cas = parseFloat(this.cas); 
        //console.log(this.cas,evt)
       return true;
  }
  keyup(evt){
    let cas = this.cas;//(this.cas).toString();
    let s = cas.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/);
    // console.log(this.cas,cas,s,evt)
    this.signup.saveToLocal("AUXsavelocalamount",this.cas);
    // console.log(this.cas,this.serv.retrieveFromLocal("AUXsavelocalamount"))
  }


  callToViewModalBtn(optradio){
    if(optradio == 'btc'){
      this.radioclick = 'btc';
    }else if(optradio== 'eth'){
      this.radioclick = 'eth';
    }else if(optradio == 'bnk'){
      this.radioclick = 'bnk';
    }else{
      this.radioclick = 'btc';
    }
    this.signup.saveToLocal("AUXsavelocalpaytype",optradio);
    //console.log(optradio,this.radioclick,this.serv.retrieveFromLocal("AUXsavelocalpaytype"))
  }

  ngOnInit() {

    this.loadHomeStatus();
    //console.log(this.serv.retrieveFromLocal("AUXHomeStatus"),this.serv.retrieveFromLocal("AUXHomeStatus"))
    // setInterval(()=>{
    //   console.log(this.homeprop++);
    // },2000);
    this.signup.saveToLocal("AUXPageChange","no");

    
  }

  ngDoCheck(){
    let take = this.signup.retrieveFromLocal("AUXPageChange");
    // console.log(take)
    if(take=="yes"){
      // console.log("2:",take)
      setTimeout(()=>{this.signup.saveToLocal("AUXPageChange","no");},600);
      this.loadHomeData();
    }
  }

  loadAlert(){
    let msg;
    let seen = this.signup.retrieveFromLocal("AUXHomeNGXSeen");
    //console.log(seen)
    if(seen == "seen"){ 
      //if success msg from login page
      let retrieve = this.signup.retrieveRouteMsgPass();
      if(retrieve != null){
        msg = retrieve;
        this.toastr.success(msg, null,{timeOut:5000});
        setTimeout(()=>{
          msg = "";
          this.signup.removeRouteMsgPass();
        },4000);
      }
    }else{
      this.signup.saveToLocal("AUXHomeNGXSeen","seen");
      let retrieve = this.signup.retrieveRouteMsgPass();
      setTimeout(()=>{
        if(retrieve != null){
          msg = retrieve;
          this.toastr.success(msg,null,{timeOut:5000});
          setTimeout(()=>{
            msg = "";
            this.signup.removeRouteMsgPass();
          },4000);
        }
        // this.toastr.success('Token bazaar with ease!', 'Welcome!!!',{timeOut:5000});
      },500);
    }
    
  }

  callme(){
    // console.log("called")
    setTimeout(()=>{
          this.apiMethod = "dashboard";
          let data = {
            'email':this.signup.retrieveFromLocal("AUXUserEmail"),
            'token':this.signup.retrieveFromLocal("AUXHomeUserToken")
          }; 
          this.serv.resolveApi(this.apiMethod,data) 
          .subscribe(
            res=>{
              let d = JSON.parse(JSON.stringify(res));
              if(d.status == 200){
               if(d.user_timeline_list == "" || d.user_timeline_list == null){
                  this.user_timeline_listShow = false;
                }else{
                  let a = d.user_timeline_list;
                  let b = [];
                  _.forEach(a,(value,key)=>{
                    let x;let y;
                    if(value.currency == 'btc' && value.type != 'payment_initiation'){
                      let s = value.content;
                      let s1 = s.split(",");
                      // console.log(s1)
                      let s1_1 = (s1[0].trim()).replace('btc','');
                      let s1_2 = (s1[1].trim()).replace('tokens','');
                      // console.log(s1_1,s1_2)
                      x = s1_1;y=s1_2;
                    }
                    if(value.currency == 'eth' && value.type != 'payment_initiation'){
                      let s = value.content;
                      let s1 = s.split(",");
                      // console.log(s1)
                      let s1_1 = (s1[0].trim()).replace('eth','');
                      let s1_2 = (s1[1].trim()).replace('tokens','');
                      // console.log(s1_1,s1_2)
                      x = s1_1;y=s1_2;
                    }
                    b.push({
                      amount_to_pay:value.amount_to_pay,
                      content:value.content,
                      currency:value.currency,
                      email:value.email,
                      erc_address:value.erc_address,
                      rate:value.rate,
                      timestamp:value.timestamp,
                      token_amount:value.token_amount,
                      type:value.type,
                      mass:y,
                      amount:x
                    })
                  })
                  this.user_timeline_list = b;
                  this.tokens = d.tokens;
                }
              }else if(d.code == 401){
                // this.signup.logoutFromApp();
                this.user_timeline_list = [];
              }else{
                this.user_timeline_list = [];
              } 
            },
            err=>{ 
              this.user_timeline_listShow = false;
            }
          );
    },5000);
  }

  loadHomeStatus(){
    let isAuth = this.storage.retrieve("AUXAuthLogin");
    let cookieExists = this.signup.checkUserActivity();
    console.log("isAuthorized",isAuth,cookieExists);
    if(isAuth == null){
      this.signup.UnAuthlogoutFromApp(); 
    }
    else if(cookieExists == false){
      this.storage.store("AUXAuthLogin",false);
      this.signup.UnAuthlogoutFromApp();
    }
    else{
      let status = this.signup.retrieveFromLocal("AUXHomeStatus");
      //console.log(status)
      this.storage.clear("AUXsavelocalamount");
      this.storage.clear("AUXsavelocalpaytype");
      if(status == "nokyc" || status == "done" || status == "pending" || status == "rejected" || status == false || status == true || status == "accepted"){
        this.homeStatusDone = true;
        this.homeStatusYet = false;
        this.user_timeline_listShow = true;
        // let seen = this.signup.retrieveFromLocal("AUXHomeNGXSeen");
        // //console.log(seen)
        // if(seen == "seen"){ 
        //   //do not open toastr
        // }else{
        //   this.signup.saveToLocal("AUXHomeNGXSeen","seen");
        //   setTimeout(()=>{this.toastr.success('Token bazaar with ease!', 'Welcome!!!',{timeOut:5000});},1000);
        // }
        this.loadAlert();
        if(status == "nokyc"){
          this.viewAlways(0);
        }else if(status == "done"){
          this.viewAlways(1);
        }else if(status == "pending"){
          this.viewAlways(2);
        }else if(status == "rejected"){
          this.viewAlways(3);
        }else if(status == false){
          this.viewAlways(0);
        }else if(status == true){
          this.viewAlways(1);
        }else if(status == "accepted"){
          this.viewAlways(1);
        }else{
          //console.log("do nothing")  
        }
      }else{
        //this.signup.logoutFromApp();
        //console.log("don nothing")
      }
      this.loadHomeData();
    }
  }

  callAgainForStatus(){
    let status = this.signup.retrieveFromLocal("AUXHomeStatus");
    //console.log(status)
    if(status == "nokyc" || status == "done" || status == "pending" || status == "rejected" || status == false || status == true || status == "accepted"){
      if(status == "nokyc"){
        this.viewAlways(0);
      }else if(status == "done"){
        this.viewAlways(1);
      }else if(status == "pending"){
        this.viewAlways(2);
      }else if(status == "rejected"){
        this.viewAlways(3);
      }else if(status == false){
        this.viewAlways(0);
      }else if(status == true){
        this.viewAlways(1);
      }else if(status == "accepted"){
        this.viewAlways(1);
      }else{
       // console.log("do nothing")  
      }
    }else{
      //this.signup.logoutFromApp();
      //console.log("don nothing")
    }
  }
  viewAlways(view){
    let a = this.serv.retrieveFromLocal("AUXKYCDetailSeenAlways");
    //console.log(a)
    if(a || a == "seen"){
      // console.log("Do nothing bcoze one seen success msg of seen")
    }else{ 
      if( view == 1 ){
        this.kycalertpanelview = true;
        this.kycalertpanel = view;
        this.serv.saveToLocal("AUXKYCDetailSeenAlways","seen");
        setTimeout(()=>{
            this.kycalertpanelview = false;
        },8000);
      }else{
        this.kycalertpanelview = true;
        this.kycalertpanel = view; 
      }
    }
  }

  loadHomeData(){
    this.apiMethod = "dashboard";
    
        let data = {
          'email':this.signup.retrieveFromLocal("AUXUserEmail"),
          'token':this.signup.retrieveFromLocal("AUXHomeUserToken")
        };
        setTimeout(()=>{
          console.log(data,"called");
        },4000);
        this.serv.resolveApi(this.apiMethod,data) 
        .subscribe(
          res=>{
            // console.log(res);
            let d = JSON.parse(JSON.stringify(res));
            if(d.status == 200){
              this.signup.saveToLocal("AUXMassUserName",d.user_name);
              let kyc = d.kyc; 
              if(kyc == false)  this.serv.saveToLocal("AUXHomeStatus","nokyc");
              if(kyc == null)  this.serv.saveToLocal("AUXHomeStatus","nokyc");
              if(kyc == "pending")  this.serv.saveToLocal("AUXHomeStatus","pending");
              if(kyc == "rejected")  this.serv.saveToLocal("AUXHomeStatus","rejected");
              if(kyc == true)  {this.serv.saveToLocal("AUXHomeStatus","done");}
              if(kyc == "accepted") { this.serv.saveToLocal("AUXHomeStatus","done");}
               
              // this.user_timeline_list = d.user_timeline_list;
              if(d.user_timeline_list == "" || d.user_timeline_list == null){
                this.user_timeline_listShow = false;
              }else{
                let first = d.user_timeline_list;
                let take = _.first(first,15);
                let a = d.user_timeline_list;//[];
                //console.log(a)
                // _.forEach(first,function(value,key) {
                //   console.log(value,key)
                //   if(key<15){
                //     console.log(value)
                //     a.push(value);
                //   }
                // });
                this.tokens = d.tokens;

                // 
                

                let b = [];
                _.forEach(a,(value,key)=>{
                  let x;let y;
                  if(value.currency == 'btc' && value.type != 'payment_initiation'){
                    let s = value.content;
                    let s1 = s.split(",");
                    // console.log(s1)
                    let s1_1 = (s1[0].trim()).replace('btc','');
                    let s1_2 = (s1[1].trim()).replace('tokens','');
                    // console.log(s1_1,s1_2)
                    x = s1_1;y=s1_2;
                  }
                  if(value.currency == 'eth' && value.type != 'payment_initiation'){
                    let s = value.content;
                    let s1 = s.split(",");
                    // console.log(s1)
                    let s1_1 = (s1[0].trim()).replace('eth','');
                    let s1_2 = (s1[1].trim()).replace('tokens','');
                    // console.log(s1_1,s1_2)
                    x = s1_1;y=s1_2;
                  }
                  b.push({
                    amount_to_pay:value.amount_to_pay,
                    content:value.content,
                    currency:value.currency,
                    email:value.email,
                    erc_address:value.erc_address,
                    rate:value.rate,
                    timestamp:value.timestamp,
                    token_amount:value.token_amount,
                    type:value.type,
                    mass:y,
                    amount:x
                  })
                })
                this.user_timeline_list = b;
                //this.user_timeline_listShow = true;
                // if(this.homeStatusDone == true){
                //   this.user_timeline_listShow = true;
                // }else{
                //   this.user_timeline_listShow = false;
                // }
              }
              this.callAgainForStatus();
            }else if(d.code == 401){
              this.user_timeline_list = [];
              // this.signup.logoutFromApp();
            }else{
              this.user_timeline_list = [];
            } 
          },
          err=>{ 
            this.user_timeline_listShow = false;
            //console.error(err);
          }
        );
  }

  convertToDate(timestamp){
    let date = moment.unix(timestamp).fromNow();//.format("MMM Do, YYYY");
    return date;
  }

}
import { Component, OnInit } from '@angular/core';

import { SignupService } from '../services/signup.service';
import { ServiceapiService } from '../services/serviceapi.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
@Component({
  selector: 'app-userterms',
  templateUrl: './userterms.component.html',
  styleUrls: ['./userterms.component.css'],
  providers:[SignupService,ServiceapiService]
})
export class UsertermsComponent implements OnInit {

  name:string;
  terms:boolean;

  errmsg:any;
  sucmsg:any;

  email:any;
  loadingimage:boolean = false;

  referral:any;

  constructor(
    public signup:SignupService,
    public api:ServiceapiService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService,
  ) { 
    
  }

  ngOnInit() {
    let token = this.route.snapshot.paramMap.get("token");
    //console.log(token);
    //console.log(this.signup.findUserEmail(token));
    //this.email = token;
    //verify
    this.signup.verifyPageOtp(token)
    .then(
      (data)=>{
        let a = JSON.parse(JSON.stringify(data))
        if(a.status != true){
          this.router.navigate(["login"]);
        }
      },
      (err)=>{
        //console.log(err);
        this.router.navigate(["login"]);
      }
    );

    let tnc = this.signup.retrieveFromLocal("AUXTNCStatus");
    if(tnc == "done"){
      this.router.navigate(["login"]);
    }

    this.loadAlert();
  }

  loadAlert(){
    //if success msg from login page
    let retrieve = this.signup.retrieveRouteMsgPass();
    if(retrieve != null){
      this.sucmsg = retrieve;
      setTimeout(()=>{
        this.sucmsg = "";
        this.signup.removeRouteMsgPass();
      },4000);
    }

    this.loadIfReferral();
  }

  loadIfReferral(){
    let referralid = this.signup.retrieveReferralId("AUXUserReferralID");
    if(referralid == "" || referralid == null || referralid == undefined || !referralid){
      this.referral = null;
    }else{
      this.referral = referralid;
    }
  }

  failmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2000);
  }

  token_verification(){
    if(!this.terms){
      this.failmsg("You should agree to terms and conditions");
    }else if(this.name == "" || this.name == null){
      this.failmsg("Name can not be left blank");
    }else{
      this.loadingimage = true;
      //this.sucmsg = ("I have written "+this.terms+" "+this.name);
      let a = {};
      let email = this.storage.retrieve("AUXUserEmail");
      //console.log(this.signup.findUserEmail(email));
      let name = this.name;
      let ref = this.referral;
      this.signup.makeTNC(name,email,ref)
      .then(
        (data)=>{
          let dat = JSON.parse(JSON.stringify(data));
          //console.log(dat);
          if(dat.code == 200){// && dat.status == "accepted"
            if(dat.tnc == true && dat.kyc == false){
              // this.sucmsg = "Just one step remain uplaod your KYC detail in next section.";//
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Just one step remain, uplaod your KYC detail submit below.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);                
                this.signup.saveToLocal("AUXTNCStatus","done");  
              // },2500);
            }else{
              // this.sucmsg = "Loading your dashboard.";//
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Welcome to MASS Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.signup.saveToLocal("AUXTNCStatus","done");
                this.router.navigate(["home"]);
              // },2500);
            }
            if(dat.token){  
              this.storage.store("AUXAuthLogin",true);
              this.signup.saveToLocal("AUXHomeUserToken",dat.token);
              this.signup.setUserSession(email,dat.token);
            }
          }else if(dat.code == 400){
            if(dat.kyc == true){
              // this.sucmsg = "You have already submitted the KYC Details, now we redirecting to your dashboard.";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "You have already submitted the KYC Details.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.signup.saveToLocal("AUXTNCStatus","done");
                this.router.navigate(["home"]);
              // },2500);
            }else if(dat.kyc == false){
              //console.log("to kyc ");
              // this.sucmsg = "Successfully registered but your KYC detail is not submitted";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Successfully registered but your KYC detail is not submitted";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);                
                this.signup.saveToLocal("AUXTNCStatus","done");
              // },2500);
            }else if(dat.kyc == "pending"){
              // this.sucmsg = "Your KYC details is in pending stage. You are navigating to your dashboard in few moment.";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Welcome to MASS Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);  
                this.signup.saveToLocal("AUXKYCStatus","pending");               
                this.signup.saveToLocal("AUXTNCStatus","done");
                this.router.navigate(["home"]);
              // },2500);
            }else if(dat.kyc == "rejected"){
              // this.sucmsg  = "Your KYC details is rejected. You are navigating to your dashboard in few moment";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Welcome to MASS Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);  
                this.signup.saveToLocal("AUXKYCStatus","rejected");               
                this.signup.saveToLocal("AUXTNCStatus","done");
                this.router.navigate(["home"]);
              // },2500);
            }else if(dat.error == "invalid_ref_id"){
              this.failmsg("Invalid Referral ID");   
            }else{
              this.failmsg("Unable to verify terms and condition");    
            }
            if(dat.token){  
              this.storage.store("AUXAuthLogin",true);
              this.signup.saveToLocal("AUXHomeUserToken",dat.token);
              this.signup.setUserSession(email,dat.token);
            }
          }else{
            this.failmsg("Unable to verify terms and condition");  
          }
          this.loadingimage = false;
        },
        (err)=>{
          this.loadingimage = false;
          //console.log(err);
          this.failmsg("Unable to verify terms and condition");
        }
      ).catch(e=>{
        this.loadingimage = false;
        this.failmsg("Network unavailable");
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { SignupService } from '../services/signup.service';

import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { FbapiService } from '../services/fbapi.service';

import { Compiler } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';//

import { PouchService } from '../services/pouch.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers:[SignupService,FbapiService,PouchService]
})
export class LoginComponent implements OnInit {


  public emailid:string;

  headers: Headers;
  options: RequestOptions;

  public errmsg:any;public sucmsg:any;
  public mssg:string = "";

  loadingimage:boolean = false;

  constructor(
    public signup:SignupService,
    public http:Http,
    public pouchserv:PouchService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService, 
    private fbapi:FbapiService,
    private cookieService:CookieService,
    private _compiler: Compiler
  ) { 

    this.headers = new Headers({ 'Content-Type': 'application/json', 
    'Accept': 'q=0.8;application/json;q=0.9' });

    this.options = new RequestOptions({ headers: this.headers });

    
  }

  ngOnInit() {
    
    let isAuth = this.storage.retrieve("AUXAuthLogin");
    let cookieExists = this.signup.checkUserActivity();
    //console.log("isAuthorized",isAuth,cookieExists);
    if(isAuth != null){
      this.router.navigate(["/home"]);
      //console.log("isAuthorized",isAuth,cookieExists);
    }
    else if(cookieExists == true){
      this.router.navigate(["/home"]);
      //console.log("User logged in");
    }
    else{
      this.signup.makeFirstCall(); 
      setTimeout(()=>{
        let cache = this.signup.retrieveCacheEmail();
        if(cache == undefined || cache == null || cache == ""){ }
        else{
          this.emailid = cache;
        }
      },1000);
      //console.log("User logged out");
      this.signup.clearIntervalInLogin();
    }

    // let cookieExists = this.signup.checkUserActivity();
    // if(cookieExists){
    //   console.log("User logged in");
    //   this.router.navigate(["/home"]);
    // }else{
    //   this.signup.makeFirstCall();
    //   console.log("User logged out");
    // }
    //ok

    

    this.callurls();//when router callback hits
    this.pouchserv.storeIP();
  }

  callurls(){
    //let raw = this.route.snapshot.queryParams.why;
    let raw = this.route.snapshot.paramMap.get("why"); 
    //console.log(this.route,raw)
    if(raw == "you_are_unauthorized"){
      this._compiler.clearCache();
      this.errmsg = "Your are unathorized to access or your last session has been timed out try to login again.";
      setTimeout(()=>{
        this.errmsg = "";
        this.route.snapshot.queryParams = [];
      },4000);
      // setTimeout(()=>{
      //   this._compiler.clearCache();
      //   this.router.navigateByUrl("/login");
      // },1500);
    }
    if(raw == "session_timedout"){
      this._compiler.clearCache();
      this.errmsg = "Your last session has been timed out try to login again.";
      setTimeout(()=>{
        this.errmsg = "";
        this.route.snapshot.queryParams = [];
      },4000);
    }
  }

  printmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2500);
  }

  validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
  }

  signup_v2(){
    if(this.emailid == "" || this.emailid == null){
      this.printmsg("You Email ID Is Invalid");
    }else if(!this.validateEmail(this.emailid)){
      this.printmsg("Wrong Email ID");
    }else{ 
      this.loadingimage = true;
      let email = this.emailid;
      email = email.toLowerCase();
      // console.log(email)
      localStorage.setItem("AUXUserEmailLocal",email);
      
      this.signup.saveToLocal("AUXUserEmail",email);
      //console.log(this.signup.retrieveFromLocal("AUXUserEmail"));
      this.signup.saveCacheEmail(email);
      //console.log(this.mssg);
      this.signup.makeSignup(this.emailid)
      .then((res)=>{
        
        let r = JSON.parse(JSON.stringify(res));
        //console.log(r);
        
        if(r.code == 200){
          // this.sucmsg = "Email has been sent to your inbox. Get otp and paste it in next otp section.";
          // setTimeout(()=>{
          //   this.sucmsg = "";
          //   //location.href = "otp";
          //   let token = this.storage.retrieve("AUXUserEmail");
          //   this.router.navigate(['/otp',token]);
          // },5000);
          // console.log("before",this.signup.retrieveRouteMsgPass());
          let msgToPass = "OTP is sent at your provided E-mail ID. Please check Spam/Others box if you don’t receive it under 2 minutes.";
          let token = this.storage.retrieve("AUXUserEmail");
          this.signup.setRouteMsgPass(msgToPass);
          // console.log("after",this.signup.retrieveRouteMsgPass());
          this.router.navigate(['/otp',token]);
          this.signup.saveToEventLocal(); // for event
 
        }else if( (r.failed) && (r.failed != null || r.failed != "") ){
          let msg = "Email is unable to process try again.";  
          this.errmsg = msg;
          setTimeout(()=>{
            this.errmsg = "";
          },2500);
        }else{
          let msg = "Email is unable to process try again.";  
          this.errmsg = msg;
          setTimeout(()=>{
            this.errmsg = "";
          },2500);
        }
        this.loadingimage = false;
      },(err)=>{
        this.loadingimage = false;
        //console.log(err);
        let msg = "Email is unable to process try again.";  
        this.errmsg = msg;
        setTimeout(()=>{
          this.errmsg = "";
        },2500);
        // this.pouchserv.putErrorInPouch("signup_v2()","Response error in component "+"LoginComponent","'Masscryp' app the exception caught is "+JSON.stringify(err),3);
      })
      .catch(function(err){
        this.loadingimage = false;
        //console.log(err);
        let msg = "Email is unable to process try again.";  
        this.errmsg = msg;
        setTimeout(()=>{
          this.errmsg = "";
        },2500);
        this.pouchserv.putErrorInPouch("signup_v2()","Catch throws error in component "+"LoginComponent","'Masscryp' app the exception caught is "+JSON.stringify(err),1);
      });
    }
  }

  getService(url: string): Observable<any> {
    return this.http
      .get(url)
      .map(this.extractData);
      //.catch(this.handleError);
  }

  private extractData(res: Response) {
      let body = res.json();
      return body || {};
  }

  private handleError(error: any) {
      let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      // console.error(errMsg);
      return Observable.throw(errMsg);
  }

  //ng g s services/signup --module=app.module
}

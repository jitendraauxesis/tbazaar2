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

import { CookieService } from 'ngx-cookie-service';//
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers:[SignupService,FbapiService]
})
export class LoginComponent implements OnInit {


  public emailid:string;

  headers: Headers;
  options: RequestOptions;

  public errmsg:any;public sucmsg:any;
  public mssg:string = "";

  constructor(
    public signup:SignupService,
    public http:Http,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService, 
    private fbapi:FbapiService,
    private cookieService:CookieService
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
  }

  callurls(){
    //let raw = this.route.snapshot.queryParams.why;
    let raw = this.route.snapshot.paramMap.get("why"); 
    //console.log(this.route,raw)
    if(raw == "you_are_unauthorized"){
      this.errmsg = "Your are unathorized to access or your last session has been timed out try to login again.";
      setTimeout(()=>{
        this.errmsg = "";
        this.route.snapshot.queryParams = [];
      },5000);
    }
  }

  printmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2500);
  }

  signup_v2(){
    if(this.emailid == "" || this.emailid == null){
      this.printmsg("You email is invalid");
    }else{
      let email = this.emailid;
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
          this.sucmsg = "Email has been sent to your inbox. Get otp and paste it in next otp section.";
          setTimeout(()=>{
            this.sucmsg = "";
            //location.href = "otp";
            let token = this.storage.retrieve("AUXUserEmail");
            this.router.navigate(['/otp',token]);
          },5000);
 
          

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
        
      },(err)=>{
        //console.log(err);
        let msg = "Email is unable to process try again.";  
        this.errmsg = msg;
        setTimeout(()=>{
          this.errmsg = "";
        },2500);
      })
      .catch(function(err){
        //console.log(err);
        let msg = "Email is unable to process try again.";  
        this.errmsg = msg;
        setTimeout(()=>{
          this.errmsg = "";
        },2500);
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
      console.error(errMsg);
      return Observable.throw(errMsg);
  }

  //ng g s services/signup --module=app.module
}

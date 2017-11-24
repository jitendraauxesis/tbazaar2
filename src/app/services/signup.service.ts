import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { FbapiService } from './fbapi.service';


import { CookieService } from 'ngx-cookie-service';
@Injectable()
export class SignupService {

  private url:string;

  headers: Headers;
  options: RequestOptions;

  private name;
  private age;
  private address;
  
  constructor(
    public http:Http,
    private storage:LocalStorageService,
    private sessionStorage:SessionStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private fbapi:FbapiService,
    private cookieService:CookieService
  ) { 
    this.url = this.storage.retrieve("AUXUserUrl");//localStorage.getItem("AUXUserUrl");

    this.headers = new Headers({ 
      'Content-Type': 'application/json', 
      'Accept': 'q=0.8;application/json;q=0.9' 
    });
    this.options = new RequestOptions({ headers: this.headers });

    //console.log(this.fbapi.testit());
    // this.proto.prototype.address = "Mumbai";
    // let a  = new this.proto;
    // console.log(a.address);
  }

  ////////////////////////////////////////////////Demo////////////////////////
  demo(){
    return new Promise((resolve,reject)=>{
      this.http.get('https://freegeoip.net/json/')
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }
  proto(){
    this.name = "ABCD";
    this.age = 25;
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
  //////////////////////////////////////////////////Demo//////////////////////

  makeFirstCall(){
    let secureStr = (Math.floor((Math.random() * 100000000) + 1)).toString();
    let token = sha512(secureStr);

    let cached:Boolean = this.cookieService.check("AUXUserCookieServe");
    if(cached){
      //console.log("im retrive cookie")
      token = this.cookieService.get("AUXUsersecureLocalTokenAuth");
      this.storage.store('secureLocalTokenAuth', token);
    }else{
      this.storage.store('secureLocalTokenAuth', token);
    }
    //this.saveToLocal("AUXUserEmail","jitendra@auxesisgroup.com");
    //console.log(token);

    // let a = CryptoJS.AES.encrypt("Message",token);
    // console.log(a);
    // this.storage.store("name",a.toString());
    // let b = CryptoJS.AES.decrypt(a,mm);
    // console.log(b);
    // let c = b.toString(CryptoJS.enc.Utf8);
    // console.log(c);
  }
  
  setRouteMsgPass(msg){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let storeStr = (CryptoJS.AES.encrypt(msg,token)).toString();
    this.sessionStorage.store("AUXRouteMsgPass",storeStr);
  }

  retrieveRouteMsgPass(){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let fromStorage = this.sessionStorage.retrieve("AUXRouteMsgPass");
    if(fromStorage == "" || fromStorage == null || !fromStorage){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  removeRouteMsgPass(){
    this.sessionStorage.clear("AUXRouteMsgPass");
  }

  saveReferralId(name,str){
    let token = "Referral-Key-For-User";
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    this.storage.store(name,storeStr);
  }

  retrieveReferralId(name){
    let token = "Referral-Key-For-User";
    let fromStorage = this.storage.retrieve(name);
    if(fromStorage == "" || fromStorage == null){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  saveToLocal(name,str){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    //console.log(token)
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    //console.log(storeStr)
    this.storage.store(name,storeStr);
  }

  retrieveFromLocal(name):any{
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let fromStorage = this.storage.retrieve(name);
    //console.log(fromStorage)
    if(fromStorage == "" || fromStorage == null){
      return "";
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  verifyPageOtp(token){
    let auth = this.storage.retrieve("secureLocalTokenAuth");
    let verifyWith = this.storage.retrieve("AUXUserEmail");
    return new Promise((resolve,reject)=>{
      if(verifyWith==token){
        resolve({"status":true});
      }else{
        reject({"status":false});
      }
    });
  }

  findUserEmail(email){
    //console.log(email)
    let token = (this.storage.retrieve("secureLocalTokenAuth")).toString();
    //console.log(token)
    let getDecrypt = CryptoJS.AES.decrypt(email,token);
    let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
    return finalStr;
  }

  findUserEmail2(email){
    console.log(email)
    let token = (this.storage.retrieve("secureLocalTokenAuth")).toString();
    console.log(token)
    let getDecrypt = (CryptoJS.AES.decrypt(email,token)).toString();
    alert(getDecrypt);
    let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
    console.log(finalStr)
    return email;
  }

  makeSignup(email){
    let data = JSON.stringify({email:email});
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"sign_up/",data)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeOtp(email,otp){
    email = this.findUserEmail(email);//get encrypted email
    let data = JSON.stringify({email:email,otp:otp});
    //console.log(data);
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"verify_otp/",data)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeTNC(name,email){
    //console.log(email);
    let email2 = localStorage.getItem("AUXUserEmailLocal");//this.findUserEmail(email);//get encrypted email
    //console.log(email2)
    let data = JSON.stringify({name:name,email:email2});
    //console.log(data);
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"tnc/",data)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeKYC(data){
    let a = JSON.stringify(data);
    //console.log(JSON.parse(a));
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"kyc/",a)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeApiCall(api:string):Observable<any>{
    return this.http
            .post(this.url+api,{})
            .map(this.extractData);
  }

  UnAuthlogoutFromApp(){
    let url = this.storage.retrieve("AUXUserUrl");
    this.storage.clear();
    localStorage.clear();
    this.fbapi.logout();
    this.storage.store("AUXUserUrl",url);
    this.router.navigate(["/login","you_are_unauthorized"]);
    //this.router.navigateByUrl("/login?why=you_are_unauthorized");
  }

  logoutFromApp(){
    let url = this.storage.retrieve("AUXUserUrl");
    this.storage.clear();
    localStorage.clear();
    this.fbapi.logout();
    this.clearUserSession();
    this.storage.store("AUXUserUrl",url);
    this.router.navigate(["/login"]);
  }

  setUserSession(email,token){
    
    let id = sha512(email);
    this.sessionStorage.store("AUXUserSessionID",id);
    this.sessionStorage.store("AUXUserSessionValue",email);
    this.sessionStorage.store("AUXUserSessionToken",token);

    var today = new Date();
    var expiresValue = new Date(today);
    //expiresValue.setSeconds(today.getSeconds() + 30); 
    expiresValue.setHours(today.getHours() + 24*1); 
    //expiresValue.setMinutes(today.getMinutes() + 1); 
    //console.log(today,'\n',expiresValue)
    this.cookieService.set( 'AUXUserCookieServe', token,expiresValue);

  } 

  saveCacheEmail(email){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    var today = new Date();
    var expiresValue = new Date(today);
    expiresValue.setHours(today.getHours() + 24*7); 
    this.cookieService.set("AUXUsersecureLocalTokenAuth",token,expiresValue);
    let cachetoken = this.cookieService.get("AUXUsersecureLocalTokenAuth");
    let storeStr = (CryptoJS.AES.encrypt(email,cachetoken)).toString();
    this.cookieService.set("AUXUserCacheEmail",storeStr,expiresValue);
    let gets = this.cookieService.get("AUXUserCacheEmail");
    //console.log("stored",this.retrieveFromLocal(gets),"\nits validity")
  }

  retrieveCacheEmail(){
    let token = this.cookieService.get("AUXUsersecureLocalTokenAuth");
    let fromStorage = this.cookieService.get("AUXUserCacheEmail");
    //console.log(fromStorage)
    if(fromStorage == "" || fromStorage == null){
      return "";
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  clearUserSession(){
    this.cookieService.delete('AUXUserCookieServe');
    this.sessionStorage.clear();
  }

  checkInfinityUserActivity(){
    let chk = setInterval(()=>{
      const cookieExists: boolean = this.cookieService.check('AUXUserCookieServe');
      if(cookieExists){
        //console.log(cookieExists)
        return true;
      }else{
        //console.log(cookieExists)
        clearInterval(chk);
        return false;
      }
    },2500);
  }

  checkUserActivity(){
    const cookieExists: boolean = this.cookieService.check('AUXUserCookieServe');
    if(cookieExists){
      let token = this.sessionStorage.retrieve("AUXUserSessionToken");
      let cookie = this.cookieService.get('AUXUserCookieServe');
      // if(token == cookie){
      //   //console.log("true1")
      //   return true;
      // }
      // else {
      //  // console.log("false1")
      //   return false;
      // }
      return true;
    }else{
      //console.log("false2")
      return false;
    }
  }
}

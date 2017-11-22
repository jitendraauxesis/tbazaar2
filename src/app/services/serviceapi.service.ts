import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';
@Injectable()
export class ServiceapiService {

  private url:string;
  
  headers: Headers;
  options: RequestOptions;

  constructor(
    public http:Http,
    private storage:LocalStorageService
  ) { 
    this.url = this.storage.retrieve("AUXUserUrl");//localStorage.getItem("AUXUserUrl");
    
    this.headers = new Headers({ 
      'Content-Type': 'application/json', 
      'Accept': 'q=0.8;application/json;q=0.9' 
    });
    this.options = new RequestOptions({ headers: this.headers }); 
  }

  public makeApi(apimethod:string):Observable<any>{
    //console.log("im called");
    return this.http
            .get("https://freegeoip.net/json/"+apimethod)
            .map(this.extractData);
  }

  public sendapi(){
    let d = {msg:"ok"};
    return JSON.stringify(d);
  }

  public resolveApi(apimethod:string,data:Object):Observable<any>{
    let passData =  JSON.stringify(data);
    return this.http.post(this.url+apimethod,passData).map(this.extractData);
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


  /**
   * local saving for transactions
   */
   saveToLocal(name,str){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    //console.log(token)
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    //console.log(storeStr)
    this.storage.store(name,storeStr);
  }

  retrieveFromLocal(name){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let fromStorage = this.storage.retrieve(name);
    if(fromStorage == null || fromStorage == "" || !fromStorage){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }
  /**
   * END transaction storing
   */
}

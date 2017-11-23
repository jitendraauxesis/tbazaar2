import { Component, OnInit, TemplateRef, ViewChild,Input,Output,EventEmitter, ElementRef, Host } from '@angular/core';

import { ServiceapiService } from '../../services/serviceapi.service';
import { SignupService } from '../../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { ToastrService } from 'ngx-toastr';

// import * as jQuery from 'jquery';

// declare const jQuery:any; 

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { AngularFireDatabase,AngularFireList,AngularFireObject } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserhomeComponent } from '../../userhome/userhome.component';

@Component({
  selector: 'app-userhomebtcmodal',
  templateUrl: './userhomebtcmodal.component.html',
  styleUrls: ['./userhomebtcmodal.component.css'],
  providers:[ServiceapiService,SignupService]
})
export class UserhomebtcmodalComponent implements OnInit {
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  }; 
  public qrvalue:any;
  // @Input()
  // homeprop: number = 1;
  @Output() homeprop: EventEmitter<any> = new EventEmitter();
  stepRecieveBTH:number;//0 for first erc20 form ,1 for refund address, 2 for calc submit ,3 for firebase confirm,4 for congtrats
  //param for btc payment
  btcmodaltitle:string = "Pay through BTC (ERC20 Token)";
  btcwalletname:string;
  btcwalletaddress:any;
  btcrefundaddress:any;
  toBTC:number=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
  toBTCRefund:number;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
  //toBTCConfirm:number = 0;//screen 3 for final submit

  loadingimage:boolean = false;

  generated_address:any;
  currency:any;
  amount_to_pay:any;
  token_amount:any;
  showtransidin3:any;


  //fb params
  user: Observable<firebase.User>;
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>; //  list of objects
  initialCount:any = 0;
  progresstype:any="danger";
  progressvalue:number=0;
  progressshow:boolean = false;
  fbinterval:any;
  //fb params

  message:any;

  @ViewChild("btcmodal") btcmodal:Element;
 
  constructor(
    public afAuth: AngularFireAuth, 
    public af: AngularFireDatabase,
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    private toastr: ToastrService, 
    public signup:SignupService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private element:ElementRef
  ) { 
      this.user = afAuth.authState;
      this.itemsRef = af.list('/transaction_details');

      this.qrvalue = "Its Demo For QR Angular";

      //console.log(this.element.nativeElement.parentElement);
  }

  ngOnInit() {
    // console.log(this)
    // console.log(this.route)
    // console.log(this.router)
    //BTC
    this.stepRecieveBTH = 0;
    this.toBTC = 0;//if user not submitted wallet address and wallet name
      //screen1
    let btcwn = this.serv.retrieveFromLocal("AUXBTCTransactionWN");//wallet name
    let btcwa = this.serv.retrieveFromLocal("AUXBTCTransactionWA");//wallet address
    //console.log(btcwa,btcwn)
    if((btcwa == "" || btcwa == null || btcwa == undefined || !btcwa) && (btcwn == "" || btcwn == undefined || btcwn == null || !btcwn)){
      this.toBTC = 0;//show submitnextskip btn
    }else{
      this.toBTC = 1;//show review and submit btn
      this.btcwalletname = btcwn;
      this.btcwalletaddress = btcwa;
    }
      //screen2
    let btcra = this.serv.retrieveFromLocal("AUXBTCTransactionRA");//refund address
    if((btcra == "" || btcra == null || !btcra)){
      this.toBTCRefund = 0;//show submitnextskip btn
    }else{
      this.toBTCRefund = 1;//show review and submit btn
      this.btcrefundaddress = btcra;
    }
      //screen3 not used
    // let btcdone = this.serv.retrieveFromLocal("AUXBTCTransactionDone");//refund address
    // if((btcdone == false || btcdone == "" || btcdone == null || !btcdone)){
    //   this.toBTCConfirm = 0;//show confirm btn
    // }else if(btcdone == true || btcdone == "done"){
    //   this.toBTCConfirm = 1;//show waiting btn
    // }
  }

  //modal functionality
  hideme(){
    //this.storage.clear("AUXsavelocalpaytype");
    //this.storage.clear("AUXsavelocalamount");
    this.clearERC();
    this.modalRef.hide();
  }
  open_recieve_modal(modalBTC: TemplateRef<any>){
    //console.log(this.cas)
    //console.log(this.optradio)
    let type =this.signup.retrieveFromLocal("AUXsavelocalpaytype");
    let cash = this.signup.retrieveFromLocal("AUXsavelocalamount");
    //console.log(type,cash)
    if(cash == undefined || cash == "" || cash == null){
      this.toastr.error('Please give specific cash amount', 'Cash Invalid',{timeOut:2000});
    }else if(type == undefined || type == "" || type == null){
      this.toastr.error('Choose any one payment method!', 'Not a payment type',{timeOut:2000});
    }else{ 
      this.loadingimage = true;
      let d = {
        'email':this.signup.retrieveFromLocal("AUXUserEmail"),
        'token':this.signup.retrieveFromLocal("AUXHomeUserToken"),
        'token_amount':cash
      };
      //console.log(d)
      this.serv.resolveApi("validate_token_amount",d)
      .subscribe(
        res=>{
          //console.log(res,d);
          
          let response = JSON.parse(JSON.stringify(res));
          if(response != null || response != ""){
            if(response.valid == true){
                if(type == "btc"){
                  this.serv.saveToLocal("AUXBTCTransaction_token_amount",cash);
                  this.callforpaywithcurrencyonmodaltoshow("btc",cash,modalBTC);
                }else{
                  this.loadingimage = false;
                  this.toastr.error('Choose any one payment method!', 'Not a payment type',{timeOut:2000});
                }
            }else{
              this.loadingimage = false;
              this.toastr.error('CAS is invalid', 'Not a valid CAS',{timeOut:2500});  
            }
          }else{
            this.loadingimage = false;
            this.toastr.error('CAS is invalid', 'Not a valid CAS',{timeOut:2500});  
          }
        },
        err=>{
          this.loadingimage = false;
          //console.error(err);
          this.toastr.error('CAS is invalid', 'Not a valid CAS',{timeOut:2500});
        }
      );

      
    }
  }  
  callforpaywithcurrencyonmodaltoshow(type,amount,modalBTC){
    let d = {
      email:this.serv.retrieveFromLocal("AUXUserEmail"),
      token:this.serv.retrieveFromLocal("AUXHomeUserToken"),
      currency:type,//('eth','btc','fiat'),
      token_amount:amount
    }
    //console.log(d)
    // this.modalRef = this.modalService.show(
    //     modalBTC,
    //     Object.assign({}, this.config, { class: 'gray modal-md' })
    // );
    this.serv.resolveApi("pay_with_currency/",d)
    .subscribe(
      (res)=>{
        //console.log(res);
        let response = JSON.parse(JSON.stringify(res));
        if(response.code == 200){
          let to_address = response.to_address;
          let _id = response._id;
          let erc_address = response.erc_address;
          let erc_wallet = response.erc_wallet;
          this.loadingimage = false;
          if(type == "btc"){
            this.serv.saveToLocal("AUXBTCTransaction_id",_id);
            this.serv.saveToLocal("AUXBTCTransaction_to_address",to_address);
            if(erc_address != "" || erc_address != null || erc_wallet != "" || erc_wallet != null){
              this.serv.saveToLocal("AUXBTCTransactionWN",erc_wallet);
              this.serv.saveToLocal("AUXBTCTransactionWA",erc_address);
            }
            this.modalRef = this.modalService.show(
                modalBTC,
                Object.assign({}, this.config, { class: 'gray modal-md' })
            );
            if(response.refund_address != null){
              this.btcrefundaddress = response.refund_address;
              this.amount_to_pay = response.amount_to_pay;
            }
            this.stepRecieveBTH = 1;this.btcmodaltitle = "Pay through BTC (Refund Address Form)";
 

            //this.childModal.show();
          }else{
            this.toastr.error('Invalid currency detected', 'Not a valid CAS/Currency',{timeOut:2500});
          }
        }else{
          this.loadingimage = false;
          this.toastr.error('Invalid currency detected', 'Not a valid CAS/Currency',{timeOut:2500});
        }
      },
      (err)=>{
        //console.error(err);
        this.loadingimage = false;
        this.toastr.error('Invalid currency detected', 'Not a valid CAS/Currency',{timeOut:2500});
      }
    );
  }
  //modal functionality


  /****
   * BTC Payment
   */
  //Screen1
  doTheseIfChangeDetectInBTC(val){
    //console.log(this.btcwalletaddress,this.btcwalletname);//console.log(val.target.value);
    if(this.toBTC == 1 || this.toBTC == 2){
      let btcwn = this.serv.retrieveFromLocal("AUXBTCTransactionWN");//wallet name
      let btcwa = this.serv.retrieveFromLocal("AUXBTCTransactionWA");//wallet address
      if(btcwa == val.target.value || btcwn == val.target.value){ 
        this.toBTC = 1;//stay with review and submit btn
        //console.log("Im not changed");
      }else{ 
        this.toBTC = 2;//show update and submit
      }
    }
  }
  btcwalletnamechange(val){//change wallet name from screen 1
    this.doTheseIfChangeDetectInBTC(val);
  }
  btcwalletaddresschange(val){
    this.doTheseIfChangeDetectInBTC(val);
  }
  nextbtc1_1(){//if not store wallet name and wallet address
    if(this.btcwalletname == "" || this.btcwalletname == null || this.btcwalletname == undefined){
      this.toastr.warning('Wallet name is required', 'Form is empty!');
    }else if(this.btcwalletaddress == "" || this.btcwalletaddress == null || this.btcwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("AUXBTCTransactionWN",this.btcwalletname);
      this.serv.saveToLocal("AUXBTCTransactionWA",this.btcwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("AUXUserEmail"),
        'token':this.serv.retrieveFromLocal("AUXHomeUserToken"),
        'erc_address':this.btcwalletaddress,
        'eth_wallet':this.btcwalletname
      };//console.log(data);
      this.callingApiForBTCScreen2("create_erc_address",data);
    }
  } 
  nextbtc1_2(){//if stored wallet name & address then to 2nd refund address modal
    this.serv.saveToLocal("AUXBTCTransactionWN",this.btcwalletname);
    this.serv.saveToLocal("AUXBTCTransactionWA",this.btcwalletaddress);
    let data = {
      'email':this.serv.retrieveFromLocal("AUXUserEmail"),
      'token':this.serv.retrieveFromLocal("AUXHomeUserToken"),
      '_id':this.serv.retrieveFromLocal("AUXBTCTransaction_id"),
      'currency':'btc'
    };//console.log(data);
    this.callingApiForBTCScreen2("review_erc_address",data);
  } 
  nextbtc1_3(){//if updated wallet name & address then to 2nd refund address modal
    if(this.btcwalletname == "" || this.btcwalletname == null || this.btcwalletname == undefined){
      this.toastr.warning('Wallet name is required', 'Form is empty!');
    }else if(this.btcwalletaddress == "" || this.btcwalletaddress == null || this.btcwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("AUXBTCTransactionWN",this.btcwalletname);
      this.serv.saveToLocal("AUXBTCTransactionWA",this.btcwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("AUXUserEmail"),
        'token':this.serv.retrieveFromLocal("AUXHomeUserToken"),
        '_id':this.serv.retrieveFromLocal("AUXBTCTransaction_id"),
        'currency':'btc',
        'new_erc_address':this.serv.retrieveFromLocal("AUXBTCTransactionWA"),
        'new_erc_wallet':this.serv.retrieveFromLocal("AUXBTCTransactionWN")
      };//console.log(data);
      this.callingApiForBTCScreen2("update_erc_address",data);
    }
  } 
  callingApiForBTCScreen2(walletfor,data){//call web api for create_erc_address ***********web
    console.log(walletfor,this.btcwalletaddress,this.btcwalletname,data)
    this.loadingimage = true;
     
    this.serv.resolveApi(walletfor,data)
    .subscribe(
      (res)=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        console.log(response);
        if(response.success == true || response.code == 200){
           if(response.refund_address != null){
             this.btcrefundaddress = response.refund_address;
             this.amount_to_pay = response.amount_to_pay;
           }
           this.stepRecieveBTH = 1;this.btcmodaltitle = "Pay through BTC (Refund Address Form)";

           //test
          //  this.toastr.warning('Test', 'Test',{timeOut:5000});
          //  setTimeout(()=>{
          //   this.stepRecieveBTH = 0;
          //  },5000);
        }else{
          this.toastr.error('Wallet address & name is invalid', 'Wrong Input!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Wallet address & name is invalid', 'Wrong Input!');
      }
    );
  }






  //Screen2
  btcrefundaddresschange(val){
    if(this.toBTCRefund == 1 || this.toBTCRefund == 2){
      let btcra = this.serv.retrieveFromLocal("AUXBTCTransactionRA");//refund address
      if(btcra == val.target.value){ 
        this.toBTCRefund = 1;//stay with review and submit btn
      }else{ 
        this.toBTCRefund = 2;//show update and submit
      } 
    }
  }
  nextbtc2_1(){//submit final modal 3 screen
    if(this.btcrefundaddress == "" || this.btcrefundaddress == null || this.btcrefundaddress == undefined){
      this.toastr.warning('Refund address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("AUXBTCTransactionRA",this.btcrefundaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("AUXUserEmail"),
        'token':this.serv.retrieveFromLocal("AUXHomeUserToken"),  
        '_id':this.serv.retrieveFromLocal("AUXBTCTransaction_id"),
        'currency':'btc',
        'token_amount':this.serv.retrieveFromLocal("AUXBTCTransaction_token_amount"),
        'new_refund_address':this.btcrefundaddress
      };
      this.callingApiForBTCScreen3("update_refund_address",data);
    }
  } 
  nextbtc2_2(){//if stored wallet name & address then to 2nd refund address modal
    this.serv.saveToLocal("AUXBTCTransactionRA",this.btcrefundaddress);
    let data = {
      'email':this.serv.retrieveFromLocal("AUXUserEmail"),
      'token':this.serv.retrieveFromLocal("AUXHomeUserToken"),  
      '_id':this.serv.retrieveFromLocal("AUXBTCTransaction_id"),
      'currency':'btc',
      'token_amount':this.serv.retrieveFromLocal("AUXBTCTransaction_token_amount")
    };
    this.callingApiForBTCScreen3("review_refund_address",data);
  } 
  nextbtc2_3(){//if updated wallet name & address then to 2nd refund address modal
    if(this.btcrefundaddress == "" || this.btcrefundaddress == null || this.btcrefundaddress == undefined){
      this.toastr.warning('Refund address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("AUXBTCTransactionRA",this.btcrefundaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("AUXUserEmail"),
        'token':this.serv.retrieveFromLocal("AUXHomeUserToken"),  
        '_id':this.serv.retrieveFromLocal("AUXBTCTransaction_id"),
        'currency':'btc',
        'token_amount':this.serv.retrieveFromLocal("AUXBTCTransaction_token_amount"),
        'new_refund_address':this.btcrefundaddress
      };
      this.callingApiForBTCScreen3("update_refund_address",data);
    }
  } 
  callingApiForBTCScreen3(reviewfor,data){//call web api for refund  ***********web
    //console.log(this.btcwalletaddress,this.btcwalletname)
    this.serv.saveToLocal("AUXBTCTransactionWN",this.btcwalletname);
    this.serv.saveToLocal("AUXBTCTransactionWA",this.btcwalletaddress);
    this.loadingimage = true;
    //console.log(data)
    this.serv.resolveApi(reviewfor,data)
    .subscribe(
      (res)=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        //console.log(response);
        if(response.success == true || response.code == 200){
          this.generated_address = response.generated_address;
          this.currency = response.currency;
          this.token_amount = response.token_amount;
          //this.amount_to_pay = response.amount_to_pay;
          this.qrvalue = this.generated_address;
          this.stepRecieveBTH = 2;this.btcmodaltitle = "Pay through BTC (Details)";//next firebase
          setTimeout(()=>{
            this.callfb();
          },5000);
        }else{
            this.toastr.error('Wallet refund address is invalid', 'Wrong Input!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Wallet is invalid', 'Wrong Input!');
      }
    );
  }

  //calling firebase response
  callfb(){ 
    // this.showtransidin3 = this.serv.retrieveFromLocal("AUXBTCTransaction_id");
    // this.stepRecieveBTH = 3;this.btcmodaltitle = "Pay through BTC (Transfer Confirmation)";//next firebase
    //console.log("calling fb");
    this.fbinterval = setInterval(()=>{
      //console.log('interval started');
      this.items = this.gettransaction_details();
    },2000);
  }

  //call fb **************************************************************************
  gettransaction_details(){
    let useremail = this.signup.retrieveFromLocal("AUXUserEmail");
    let useraddress = this.signup.retrieveFromLocal("AUXBTCTransaction_to_address");
    //console.log(useraddress,useremail)
    let ar = [];
    return this.itemsRef.snapshotChanges().map(arr => {
      console.log(arr)
      if(arr.length>0){
        
        let key;let val;
        ar = [];
        arr.forEach(
          d=>{
            let secretaddress = d.key;
            let to_address = useraddress;
            if(secretaddress == to_address){
              if(this.fbinterval){
                clearInterval(this.fbinterval);
                console.log("interval stopped...")
              }
              let check_address = d.payload.val().to_address;
              let email = d.payload.val().email_id;
              let currency = d.payload.val().currency;
              if(email == useremail && currency == 'btc' && useraddress == check_address){// 
                key = d.key;
                val = d.payload.val();
                ar.push(d);
                this.initialCount = d.payload.val().confirmations;
                //console.log(key,d.payload.val())
              }

            }
          }
        )
        console.log(key,val,val.confirmations);
        if(this.initialCount == 0 || val.confirmations == 0){
          this.progresstype = "danger";
          this.progressvalue = 0;
          this.showtransidin3 = this.serv.retrieveFromLocal("AUXBTCTransaction_id");
          this.stepRecieveBTH = 3;this.btcmodaltitle = "Pay through BTC (Transfer Confirmation)";//next firebase
        }
        if(this.initialCount == 1 || val.confirmations == 1){
          this.progresstype = "warning";
          this.progressvalue = 50;
        }
        if(this.initialCount == 2 || val.confirmations == 2){
          this.progresstype = "info";
          this.progressvalue = 100;
        }
        if(val.confirmations == 3){
          this.progresstype = "success";
          this.progressvalue = 150;
          setTimeout(()=>{
            this.progressshow = true;},1000);//hide progressbar
          setTimeout(()=>{
            this.callToopen(val);
          },2500);
          //confirmation toastr
        }
        return ar.map(snap => Object.assign(
          snap.payload.val(), { $key: snap.key }) 
        );
      }
    })
  }
  callToopen(val){
   // console.log(val,"imcalled");
    this.dothese();
  }
  //call fb **************************************************************************


  submitBTC(){//not used
    //this.toBTCConfirm = 1;
  }
  submitDoneBTC(){//not used
    this.stepRecieveBTH = 3;//showing congrats screen if payment has done
    this.btcmodaltitle = "Waiting for payment confirmation";
    setTimeout(()=>{this.dothese();},5000);
  }

  //for screen4
  dothese(){
    this.btcmodaltitle = "Congratulations";
    //this.toastr.success('BTC transaction is done successfully', 'Transaction completed');
    this.stepRecieveBTH = 4;
    let cas = this.serv.retrieveFromLocal("AUXBTCTransaction_token_amount");
    let transaction_id = this.serv.retrieveFromLocal("AUXBTCTransaction_id");
    this.message = cas+" CAS Token from transaction id "+transaction_id+"  is deposited in your account.";
    setTimeout(()=>{  
      this.hideme();
      this.storage.clear("AUXBTCTransactionRA");
      this.storage.clear("AUXBTCTransactionWA");
      this.storage.clear("AUXBTCTransactionWN");
      this.storage.clear("AUXBTCTransaction_id");
      this.storage.clear("AUXBTCTransaction_to_address");
      this.storage.clear("AUXBTCTransaction_token_amount");
      this.stepRecieveBTH = 0;
      this.btcmodaltitle = "Pay through BTC (ERC20 Token)";
      this.btcwalletname = "";
      this.btcwalletaddress="";
      this.btcrefundaddress="";
      this.toBTC=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
      this.toBTCRefund=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
      //this.toBTCConfirm= 0;
      this.progresstype = "danger";
      this.progressvalue = 0;
      this.progressshow = false;
      this.initialCount = 0;
      this.toastr.info('Wait for admin mail that verify transaction.', 'Note:',{timeOut:8000});
      this.toastr.info('You can make new transaction.', 'Make another transaction',{timeOut:3000});
      setTimeout(()=>{location.reload();},8000);
    },5000);
  }
  /**
   * BTC END
   */


  clearERC(){
    clearInterval(this.fbinterval);
    this.storage.clear("AUXBTCTransactionRA");
    this.storage.clear("AUXBTCTransactionWA");
    this.storage.clear("AUXBTCTransactionWN");
    this.storage.clear("AUXBTCTransaction_id");
    this.storage.clear("AUXBTCTransaction_to_address");
    this.storage.clear("AUXBTCTransaction_token_amount");
    this.stepRecieveBTH = 0;
    this.btcmodaltitle = "Pay through BTC (ERC20 Token)";
    this.btcwalletname = "";
    this.btcwalletaddress="";
    this.btcrefundaddress="";
    this.toBTC=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
    this.toBTCRefund=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
    //this.toBTCConfirm= 0;
    this.progresstype = "danger";
    this.progressvalue = 0;
    this.progressshow = false;
    this.initialCount = 0;
  }

  copytext(btcaddress){
    this.toastr.info('Text  copied to your clipboard!', 'Copied text!!!',{timeOut:1200});
  }
}

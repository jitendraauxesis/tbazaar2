import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import { SignupService } from '../services/signup.service';
import { ServiceapiService } from '../services/serviceapi.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';

import 'hammerjs';
import * as urlencode from 'urlencode';
import * as _ from 'lodash';

import sha512 from 'js-sha512';

import { PouchService } from '../services/pouch.service';

import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { IMAGEVIEWER_CONFIG, ImageViewerConfig, ButtonConfig } from '@hallysonh/ngx-imageviewer';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  form: FormGroup;
  ProofFiles:File;
  link: HTMLAnchorElement;

  @ViewChild('fileInput1') fileInput1: ElementRef; 
  @ViewChild('fileInput2') fileInput2: ElementRef;

  name:string; 
  aadharno:number;
  pan:any;
  idproof:any;

  errmsg:any;sucmsg:any;
  loadingimage:boolean = false;

  public ngxloading  = false;

  dumimg:any = 'assets/img/kyc3.jpg';

  modalRef: BsModalRef;
  @ViewChild('imagemodal') imagemodal:ElementRef;
  config2 = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };
  kycimg:any = 'assets/img/kyc3.jpg';
  kycimgext:any = 'png';
  kycviewimg:any = 'assets/img/kyc3.jpg';

  imgavailable:number = 1;

  kycstatus:any;
  kycdatapoi:any = [];
  kycdatapoa:any = [];

  nokycmessage:any = 'Loading... KYC documents';
  constructor(
    private fb: FormBuilder,
      public signup:SignupService,
      public api:ServiceapiService,
      public pouchserv:PouchService,
      private route: ActivatedRoute,
      private router: Router,
      private toastr: ToastrService,
      private storage:LocalStorageService,
      private modalService: BsModalService,
  ) { 
    this.form = this.fb.group({
      // name:['',Validators.required],
      // aadharno:['',Validators.required],
      pan:null,
      idproof:null,
      // proof1:null,
      // proof2:null
    });
  }

  ngOnInit() {
  }

  onFileChange1(event) {
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      console.log(file,event)
      if(file.size > 2000000){
        // this.failmsg("File size can not be greater than 1 Mb");
        this.toastr.error('File size can not be greater than 2 Mb',null,{timeOut:2500});          
        this.form.get('pan').setValue(null);
        this.fileInput1.nativeElement.value = "";
        return false;
      }else{
        reader.readAsDataURL(file);
        reader.onload = () => {
          // console.log(file.type)
          this.form.get('pan').setValue({
            filename: file.name,
            filetype: file.type,
            filesize: file.size,
            value: reader.result.split(',')[1]
          }) 
        };
      }
    }
  }

  onFileChange2(event) {
    let reader = new FileReader();
    let reader2 = new FileReader();
    const formData = new FormData();
    console.log(event.target.files);
    if(event.target.files && event.target.files.length > 0) {
      let array = event.target.files;
      let arrayLength = event.target.files.length;


      let putArray = [];
      if(arrayLength <= 2){
        //for(let a = 0;a<arrayLength;a++){
          let file1 = event.target.files[0];
          let file2 = event.target.files[1];
          //console.log(file);
          
            if(file1.size > 2000000 || file2 > 2000000){
              //console.log("File size can not be greater than 25 kb");
              // this.failmsg("File size can not be greater than 1 Mb");
              this.toastr.error('File size can not be greater than 2 Mb',null,{timeOut:2500}); 
              this.form.get('idproof').setValue(null);
              this.fileInput2.nativeElement.value = "";
              return false;
            }else{
              //formData.append('idproof',file);
              
                reader.readAsDataURL(file1);
                reader.onload = () => {
                  // console.log(file1.type);
                  putArray.push({
                      filename: file1.name,
                      filetype: file1.type,
                      filesize: file1.size,
                      value: reader.result.split(',')[1]
                  });
                }
              if(arrayLength == 2){
              setTimeout(()=>{
                //console.log("called");
                reader2.readAsDataURL(file2);
                reader2.onload = () => {
                  //console.log(reader.result);
                  putArray.push({
                      filename: file2.name,
                      filetype: file2.type,
                      filesize: file2.size,
                      value: reader2.result.split(',')[1]
                  });
                }
              },10);
              }
            }
        //}
      }else{
        // this.failmsg("You can only upload two files");
        this.toastr.error('You can only upload two files',null,{timeOut:2500}); 
        this.form.get('idproof').setValue(null);
        this.fileInput2.nativeElement.value = "";
        return false;
      }
      //console.log(putArray);
      this.form.get('idproof').setValue(putArray);
    }
  }

  signup_v2(){
    console.log(this.form.value)
  }
}

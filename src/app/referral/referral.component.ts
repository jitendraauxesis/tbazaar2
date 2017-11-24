import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css']
})
export class ReferralComponent implements OnInit {

  referraladdressvalue:string = "http://some.address.com";
  referridvalue:string = "tx234235235";

  constructor(
    private toastr: ToastrService
  ) { }

  ngOnInit() {
  } 

  copytext(referraladdress){
    this.toastr.info('Referral address is copied to your clipboard!', 'Copied text!!!',{timeOut:1200});
  }

  copytext2(referrid){
    this.toastr.info('Referral id is copied to your clipboard!', 'Copied text!!!',{timeOut:1200});
  }
}

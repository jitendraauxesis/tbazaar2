import { Component } from '@angular/core';
import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(
    private storage:LocalStorageService
  ){
    //localStorage.setItem("AUXUserUrl","http://139.59.9.73:8000");//"http://192.168.0.116:8000/");
    this.storage.store("AUXUserUrl","http://104.236.95.166:8000/");//"http://139.59.156.145:8000/");
  }
}
 
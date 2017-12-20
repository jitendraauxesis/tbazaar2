import { Component } from '@angular/core';
import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import { Router, ActivatedRoute, ParamMap,NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(
    private storage:LocalStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ){
    //localStorage.setItem("AUXUserUrl","http://139.59.9.73:8000");//"http://192.168.0.116:8000/");
    // main "http://104.236.95.166:8000/"http://104.236.95.166:8000/
    // staging "http://139.59.156.145:8000/"

    //main ssl https://massico.auxledger.org/
    this.storage.store("AUXUserUrl","https://massico.auxledger.org/");//"http://139.59.156.145:8000/");
  }

  ngOnInit() {
    this.router.events
    .filter((event) => event instanceof NavigationEnd)
    .map(() => this.route)
    .map((route) => {
      while (route.firstChild) route = route.firstChild;
      return route;
    })
    .filter((route) => route.outlet === 'primary')
    .mergeMap((route) => route.data)
    .subscribe((event) => {
      // console.log(event['title']);
      this.titleService.setTitle(event['title']);
    });
    // .subscribe((event) => {
    //   console.log('NavigationEnd:', event);
    // });
  }
}
  
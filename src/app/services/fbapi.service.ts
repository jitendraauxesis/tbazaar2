import { Injectable } from '@angular/core';
import { AngularFireDatabase,AngularFireList,AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
//import { AngularFirestore } from 'angularfire2/firestore';
//import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs';
import * as firebase from 'firebase/app';
import { SimpleChanges } from '@angular/core';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
//import { SignupService } from '../services/signup.service';

@Injectable()
export class FbapiService {

  user: Observable<firebase.User>;

  constructor(
    public afAuth: AngularFireAuth, 
    public af: AngularFireDatabase,
    //public db: AngularFirestore,
    //public db: AngularFirestore,
    //public signupprovider:SignupService,
    public localstore:LocalStorageService
  ) {
    this.user = afAuth.authState;
   }

  signup(email: string, password: string) {
    this.afAuth
      .auth
      .createUserWithEmailAndPassword(email, password)
      .then(value => {
       // console.log('Success!', value);
      })
      .catch(err => {
        //console.log('Something went wrong:',err.message);
      });    
  }

  login(email: string, password: string) {
    this.afAuth
      .auth
      .signInWithEmailAndPassword(email, password)
      .then(value => {
        // console.log('Nice, it worked!',value);
      })
      .catch(err => {
        //console.log('Something went wrong:',err.message);
      });
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  testit(){
    return "hi";
  }
}

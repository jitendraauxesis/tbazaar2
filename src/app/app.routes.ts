import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppComponent }   from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PageotpComponent } from './pageotp/pageotp.component';
import { UserhomeComponent } from './userhome/userhome.component';
import { UsertermsComponent } from './userterms/userterms.component';
import { UserkycComponent } from './userkyc/userkyc.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
// import { PagetestComponent } from './pagetest/pagetest.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
// import { UserhomebtcmodalComponent } from './userhomemodals/userhomebtcmodal/userhomebtcmodal.component';
// import { UserhomeethmodalComponent } from './userhomemodals/userhomeethmodal/userhomeethmodal.component';
// import { UserhomebnkmodalComponent } from './userhomemodals/userhomebnkmodal/userhomebnkmodal.component';
import { SidemenuComponent } from './layouts/sidemenu/sidemenu.component';
import { TransactionsComponent } from './transactions/transactions.component';

const routes: Routes = [
    { 
        path: '', 
        //redirectTo: '/login', 
        component:LoginComponent,
        pathMatch: 'full' 
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'otp/:token',
        component: PageotpComponent
    },
    {
        path: 'terms/:token',
        component: UsertermsComponent
    },
    {
        path: 'kyc',
        component: UserkycComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'login/:why', 
        component: LoginComponent
    }, 
    {
        path: 'home',
        component: UserhomeComponent
    },
    {
        path: 'transactions',
        component: TransactionsComponent
    },
    // {
    //     path: 'test',
    //     component: PagetestComponent
    // },
    {
        path: 'homedum',
        component: HomeComponent
    },
    { 
        path: '**', 
        component: PagenotfoundComponent 
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {}
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
import { ReferralComponent } from './referral/referral.component';
import { AddreferralComponent } from './addreferral/addreferral.component';
import { AddreferralwithsidebarComponent } from './addreferralwithsidebar/addreferralwithsidebar.component';
import { KycwithsidebarComponent } from './kycwithsidebar/kycwithsidebar.component';
import { KycwithsidebarviewpdfComponent } from './kycwithsidebarviewpdf/kycwithsidebarviewpdf.component';
import { MasswalletComponent } from './masswallet/masswallet.component';


const routes: Routes = [
    { 
        path: '', 
        //redirectTo: '/login', 
        component:LoginComponent,
        pathMatch: 'full' ,
        data: { title: 'Login | Masscryp ICO' }
    },
    {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login | Masscryp ICO' }
    },
    {
        path: 'otp/:token',
        component: PageotpComponent,
        data: { title: 'OTP | Masscryp ICO' }
    },
    {
        path: 'terms/:token',
        component: UsertermsComponent,
        data: { title: 'Terms | Masscryp ICO' }
    },
    {
        path: 'kyc',
        component: UserkycComponent,
        data: { title: 'KYC | Masscryp ICO' }
    },
    {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login | Masscryp ICO' }
    },
    {
        path: 'login/:why', 
        component: LoginComponent,
        data: { title: 'Login | Masscryp ICO' }
    }, 
    {
        path: 'home',
        component: UserhomeComponent,
        data: { title: 'Home | Masscryp ICO' }
    },
    {
        path: 'transactions',
        component: TransactionsComponent,
        data: { title: 'Transactions | Masscryp ICO' }
    },
    {
        path: 'masswallet',
        component: MasswalletComponent,
        data: { title: 'Masswallet | Masscryp ICO' }
    },
    {
        path: 'referral',
        component: ReferralComponent,
        data: { title: 'Referral | Masscryp ICO' }
    },
    {
        path: 'referral/address',
        component: ReferralComponent,
        data: { title: 'Referral | Masscryp ICO' }
    },
    {
        path: 'referral/address/:refid',
        component: ReferralComponent,
        data: { title: 'Referral | Masscryp ICO' }
    },
    {
        path: 'addreferral',
        // component: AddreferralComponent
        component: AddreferralwithsidebarComponent,
        data: { title: 'Referral Address | Masscryp ICO' }
    },
    {
        path: 'updatekyc',
        component: KycwithsidebarComponent,
        data: { title: 'KYC | Masscryp ICO' }
    },
    {
        path: 'updatekyc/view/:id',
        component: KycwithsidebarviewpdfComponent,
        data: { title: 'KYC | Masscryp ICO' }
    },
    // {
    //     path: 'test',
    //     component: PagetestComponent
    // },
    {
        path: 'homedum',
        component: HomeComponent,
        data: { title: 'DUMHOME | Masscryp ICO' }
    },
    { 
        path: '**', 
        component: PagenotfoundComponent ,
        data: { title: 'Not Found | Masscryp ICO' }
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {}
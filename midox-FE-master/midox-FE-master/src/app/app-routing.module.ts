import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path:'login', component: LoginComponent
  },
  {
    path:'signup', component: SignupComponent
  },
  {
    path:'profile', component: ProfileComponent
  },
  {
    path:'', loadChildren:()=>import('./dashboard/dashboard.module').then(mod=>mod.DashboardModule)
  },
  {
    path:'inventory', loadChildren:()=>import('./inventory/inventory.module').then(mod=>mod.InventoryModule)
  },
  {
    path:'adda', loadChildren:()=>import('./adda/adda.module').then(mod=>mod.AddaModule)
  },
  {
    path:'employee', loadChildren:()=>import('./employee/employee.module').then(mod=>mod.EmployeeModule)
  },
  {
    path:'settings', loadChildren:()=>import('./settings/settings.module').then(mod=>mod.SettingsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

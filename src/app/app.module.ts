import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';
import { AuthService } from './auth.service'
import { UserService } from './user.service';
import { UserComponent } from './user/user.component';
import { TestComponent } from './test/test.component';
import { GradeComponent } from './grade/grade.component'

import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    HomeComponent,
    UserComponent,
    TestComponent,
    GradeComponent
  ],
  imports: [
    BrowserModule,
    ChartsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule, 
    RouterModule.forRoot([
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'admin',
        component: AdminComponent,
      },{
        path: 'user',
        component : UserComponent
      },{
        path: 'test',
        component : TestComponent
      },{
        path: 'grade',
        component : GradeComponent
      },{
        path : 'grade/:id',
        component : GradeComponent
      }
    ])
  ],
  providers: [AuthService, UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }

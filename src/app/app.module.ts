import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { SharedModule } from '../shared/shared.module';
import { ChartService } from '../services/chart.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule.forRoot()
  ],
  providers: [
    ApiService,
    ChartService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

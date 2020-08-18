import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {promise} from "selenium-webdriver";
import fullyResolved = promise.fullyResolved;

const routes: Routes = [
  {
    path: '',
    redirectTo: 'solar/insights',
    pathMatch: 'full'
  },
  {
    path: 'solar/insights',
    loadChildren: () =>
      import('./solar/insights/insights-routing.module').then((m) => m.InsightsRoutingModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

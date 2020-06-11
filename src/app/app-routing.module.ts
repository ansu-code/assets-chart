import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetschartComponent } from './assets-chart/assets-chart.component';


const routes: Routes = [
  {path: 'assets-chart',component: AssetschartComponent},
  { path: '',   redirectTo: '/assets-chart', pathMatch: 'full' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedServices } from '../services';
import { InsightsComponent } from './insights.component';
import { SharedModule} from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: InsightsComponent,
      },
    ]),
  ],
  providers: [ SharedServices ],
  declarations: [InsightsComponent],
})
export class InsightsRoutingModule {}

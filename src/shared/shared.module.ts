
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedComponent } from './index';
import { FormsModule } from '@angular/forms';

@NgModule(
  {
    declarations: [
      SharedComponent

    ],
    imports: [
      RouterModule,
      FormsModule
    ],
    entryComponents: [
    ],
    exports: [
      SharedComponent
    ]
  })

export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
      ]
    };
  }
}

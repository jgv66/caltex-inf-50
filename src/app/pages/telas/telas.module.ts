import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TelasPageRoutingModule } from './telas-routing.module';

import { TelasPage } from './telas.page';

@NgModule({
  exports: [TelasPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TelasPageRoutingModule
  ],
  declarations: [TelasPage]
})
export class TelasPageModule {}

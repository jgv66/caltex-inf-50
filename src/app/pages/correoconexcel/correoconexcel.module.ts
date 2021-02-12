import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CorreoconexcelPageRoutingModule } from './correoconexcel-routing.module';

import { CorreoconexcelPage } from './correoconexcel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CorreoconexcelPageRoutingModule
  ],
  declarations: [CorreoconexcelPage]
})
export class CorreoconexcelPageModule {}

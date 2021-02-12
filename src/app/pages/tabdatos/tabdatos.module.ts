import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabdatosPageRoutingModule } from './tabdatos-routing.module';

import { TabdatosPage } from './tabdatos.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TabdatosPageRoutingModule
  ],
  declarations: [TabdatosPage]
})
export class TabdatosPageModule {}

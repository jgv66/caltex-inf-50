import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabinicioPageRoutingModule } from './tabinicio-routing.module';

import { TabinicioPage } from './tabinicio.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TabinicioPageRoutingModule
  ],
  declarations: [TabinicioPage]
})
export class TabinicioPageModule {}

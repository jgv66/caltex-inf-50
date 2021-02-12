/*  para crear un modulo que sirva como componente compartido
ionic g module components
*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { GrillastockComponent } from './grillastock/grillastock.component';
import { VistaproductoComponent } from './vistaproducto/vistaproducto.component';


@NgModule({
  declarations:     [ GrillastockComponent, VistaproductoComponent ],
  imports:          [ CommonModule, IonicModule],
  exports:          [ GrillastockComponent, VistaproductoComponent ]
})
export class ComponentsModule { }

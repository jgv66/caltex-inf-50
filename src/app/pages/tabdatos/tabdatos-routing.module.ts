import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabdatosPage } from './tabdatos.page';

const routes: Routes = [
  {
    path: '',
    component: TabdatosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabdatosPageRoutingModule {}

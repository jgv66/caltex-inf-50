import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CotizacionPage } from './cotizacion.page';

const routes: Routes = [
  {
    path: '',
    component: CotizacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CotizacionPageRoutingModule {}

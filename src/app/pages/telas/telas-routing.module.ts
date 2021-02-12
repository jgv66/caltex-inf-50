import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TelasPage } from './telas.page';

const routes: Routes = [
  {
    path: '',
    component: TelasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TelasPageRoutingModule {}

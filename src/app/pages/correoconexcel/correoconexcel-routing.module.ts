import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorreoconexcelPage } from './correoconexcel.page';

const routes: Routes = [
  {
    path: '',
    component: CorreoconexcelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorreoconexcelPageRoutingModule {}

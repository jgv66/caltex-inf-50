import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabinicioPage } from './tabinicio.page';

const routes: Routes = [
  {
    path: '',
    component: TabinicioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabinicioPageRoutingModule {}

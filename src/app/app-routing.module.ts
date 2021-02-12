import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',             loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)  },
  { path: 'login',            loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)  },
  { path: 'cotizados',        loadChildren: () => import('./pages/cotizacion/cotizacion.module').then( m => m.CotizacionPageModule) },
  { path: 'mail2excel/:modo', loadChildren: () => import('./pages/correoconexcel/correoconexcel.module').then( m => m.CorreoconexcelPageModule) },
  { path: 'tabdatos/:codigo', loadChildren: () => import('./pages/tabdatos/tabdatos.module').then( m => m.TabdatosPageModule) },
  { path: 'tabinicio',        loadChildren: () => import('./pages/tabinicio/tabinicio.module').then( m => m.TabinicioPageModule) },
  { path: 'telas',            loadChildren: () => import('./pages/telas/telas.module').then( m => m.TelasPageModule)  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

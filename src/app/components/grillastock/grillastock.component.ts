/*
ionic g component components/grillastock
*/
import { Component, OnInit, Input } from '@angular/core';
import { DatosService } from 'src/app/services/datos.service';
import { Router } from '@angular/router';
import { FuncionesService } from '../../services/funciones.service';
import { TelasPage } from '../../pages/telas/telas.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-grillastock',
  templateUrl: './grillastock.component.html',
  styleUrls: ['./grillastock.component.scss']
})
export class GrillastockComponent implements OnInit {

  @Input() listaProductos: any;
  @Input() modocoti: boolean;
  @Input() modoexcel: boolean;
  @Input() empresa: any;

  constructor( private datos: DatosService,
               private funciones: FuncionesService,
               private modalCtrl: ModalController,
               private router: Router ) { }

  ngOnInit() {
  }

  informacion( producto ) {
    if ( this.modoexcel === true ) {
      this.funciones.addCotiz( producto, 'lista excel' );
    } else {
      if ( this.modocoti === true ) {
        if ( this.empresa === '04' ) {
          this.pideNumeros( producto )
              .then( () => this.funciones.addCotiz( producto ) );
        }
      } else {
        this.datos.guardaMientras( producto.codigo );
        this.router.navigate( ['/tabdatos', producto.codigo] );
      }
    }
  }

  async pideNumeros( producto ) {
    const modal = await this.modalCtrl.create({
      component: TelasPage,
      componentProps: { producto }
    });
    await modal.present();
  }

  dameColor( i: number ) {
    const remainder = i % 2;
    if ( remainder === 0 ) {
      return 'primary';
    } else {
      return 'secundary';
    }
  }

}

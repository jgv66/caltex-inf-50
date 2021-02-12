import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-telas',
  templateUrl: './telas.page.html',
  styleUrls: ['./telas.page.scss'],
})
export class TelasPage implements OnInit {

  @Input() producto;

  metros;
  rollos;
  precioxmetro;

  constructor( private modalCtrl: ModalController,
               private funciones: FuncionesService) { }

  ngOnInit() {
    this.metros       = this.producto.metros;
    this.rollos       = this.producto.rollos;
    this.precioxmetro = this.producto.precioxmetro;
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  grabar() {
    if ( ( this.metros || this.rollos ) && this.precioxmetro ) {
      this.modalCtrl.dismiss( {
          metros:       this.metros,
          rollos:       this.rollos,
          precioxmetro: this.precioxmetro } );
    } else {
      this.funciones.msgAlert( '', 'Debe indicar los datos correctamente' );
    }
  }

}

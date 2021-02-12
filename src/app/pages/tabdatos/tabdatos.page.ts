import { Component, OnInit } from '@angular/core';
import { DatosService } from 'src/app/services/datos.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TelasPage } from '../telas/telas.page';

@Component({
  selector: 'app-tabdatos',
  templateUrl: './tabdatos.page.html',
  styleUrls: ['./tabdatos.page.scss'],
})
export class TabdatosPage implements OnInit {

  producto: any;
  codigo:   any;
  usuario:  any;
  occ:      any;

  constructor( private datos:          DatosService,
               private funciones:      FuncionesService,
               private modalCtrl:      ModalController,
               private activatedRoute: ActivatedRoute ) {
    this.activatedRoute.params
      .subscribe( params => { this.codigo = params['codigo']; } );
  }

  ngOnInit() {
    this.usrdata().then( () => this.cargaProducto() );
  }

  async usrdata() {
    const usr = await this.datos.readDatoLocal( 'KInf_usuario' ).then( data => { this.usuario = data; } );
  }

  cargaProducto() {
    this.occ = undefined;
    this.datos.getDataProd( { usuario: this.usuario.KOFU,
                              codigo:  this.codigo,
                              empresa: this.usuario.EMPRESA })
        .subscribe( data => { this.revisaDato( data ); },
                    err  => { this.funciones.msgAlert( 'ATENCION', err );  }
        );
  }

  revisaDato( data ) {
    const rs = data.data;
    this.producto = rs[0];
    if ( this.producto.porllegar_ud1 > 0 ) {
      this.cargaProductoOCC();
    }
  }

  cargaProductoOCC() {
    this.datos.getDataProdOCC( {usuario: this.usuario.KOFU,
                                codigo:  this.codigo,
                                empresa: this.usuario.EMPRESA })
        .subscribe( data => { this.revisaDatoOCC( data ); },
                    err  => { this.funciones.msgAlert( 'ATENCION', err );  }
        );
  }

  revisaDatoOCC( data ) {
    const rs = data.data;
    this.occ = rs;
  }

  addCotiz() {
    if ( this.usuario.EMPRESA === '04' ) {
      this.funciones.datoCotizado( this.producto )
          .then(  dato => { this.pideNumeros( dato ); } )
          .catch( no   => { this.pideNumeros( no   ); } ) ;
    } else {
      this.funciones.addCotiz( this.producto );
    }
  }

  async pideNumeros( dato ) {
    const modal = await this.modalCtrl.create({
      component: TelasPage,
      componentProps: { producto: dato }
    });
    await modal.present();
    // lo que retorne, lo tomamos
    const { data } = await modal.onDidDismiss();
    if ( data ) {
      this.producto.metros       = data.metros;
      this.producto.rollos       = data.rollos;
      this.producto.precioxmetro = data.precioxmetro;
      //
      this.funciones.addCotiz( this.producto );
      //
    }
  }

}

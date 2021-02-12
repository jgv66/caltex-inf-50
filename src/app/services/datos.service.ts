import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { tap } from 'rxjs/operators';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  xDato:    any;
  loading:  any;
  params:   any;
  cualquierDato:  any;
  ItemCotizado  = [];

  // puerto: CALTEX
  // url    = 'https://api.kinetik.cl/caltex-inf' ;
  url    = 'https://api.caltex.kinetik.cl' ;
  puerto = '' ;

  constructor( private http: HttpClient,
               private toastCtrl: ToastController,
               private alertCtrl: AlertController,
               private loadingCtrl: LoadingController ) {
    this.ItemCotizado = [];
  }

  async showLoading() {
    this.loading = await this.loadingCtrl.create({
                      message: 'Rescatando',
                      duration: 7000
                    });
    return await this.loading.present();
  }

  /* FUNCIONES LOCALES */
  async saveDatoLocal( token: any, dato: any ) {
    await Storage.set( {key:token, value: JSON.stringify(dato) });
  }

  async readDatoLocal(token: any) {
    const dato = await Storage.get({ key: token}).then( data => data );
    this.cualquierDato = !dato ? undefined : JSON.parse( dato.value );
    return this.cualquierDato;
  }

  guardaMientras( dato ) {
    this.cualquierDato = dato;
  }

  rescataMientras() {
    return this.cualquierDato ;
  }

  deleteDatoLocal( token: any ) {
    Storage.remove( { key: token } ).then( () => console.log( 'DatosService.deleteDatoLocal EXISTE y REMOVIDO->', token ) );
  }

  limpiaCotiz() {
    this.ItemCotizado = [];
  }
  enviarCotizacion( usuario, cTo, cCc, cNombreCli, cEmailObs? ) {
    this.showLoading();
    const body  = { emailvend:  usuario.EMAIL.trim(),
                    nombre:     usuario.NOKOFU.trim(),
                    empresa:    usuario.EMPRESA,
                    cTo:        cTo.trim(),
                    cNombreCli: cNombreCli.trim(),
                    cEmailObs:  cEmailObs,
                    cCc:        cCc.trim(),
                    itemes:     this.ItemCotizado } ;
    return this.http.post( this.url + this.puerto + '/encorr2', body )
      .pipe( tap( value =>  { if ( this.loading ) { this.loading.dismiss(); } }) );
  }

  /* FUNCIONES REMOTAS */
  getNewId() {
    return this.http.get( this.url + '/ktp_newid' );
  }

  getDataEmpresas() {   /* debo cambiarlo por GET */
    return this.http.post( this.url + '' + this.puerto + '/ktp_empresas', { x: 1 } );
  }

  getDataRubros() {
    return this.http.get( this.url + '' + this.puerto + '/ktp_rubros_get' );
  }

  getDataMarcas() {
    return this.http.get( this.url + '' + this.puerto + '/ktp_marcas_get' );
  }

  getDataSuperFamilias() {   /* debo cambiarlo por GET */
    return this.http.post( this.url + '' + this.puerto + '/ktp_superfamilias', { x: 1 } );
  }

  getDataUser( proceso: any, email: any, clave: any, empresa: any, uuid: any, sistema: any ) {
    this.showLoading();
    const datos = { rutocorreo: email, clave: clave, empresa: empresa, uuid: uuid, sistema: sistema };
    const body  = { sp: 'ksp_buscarUsuario', datos: datos };
    return this.http.post( this.url + this.puerto + '/' + proceso, body )
      .pipe( tap( value =>  { if ( this.loading ) { this.loading.dismiss(); } }) );
  }

  getDataSt( filtros: any, mostrar: any ) {
    if ( mostrar ) { this.showLoading(); }
    const body = { datos: filtros };
    return this.http.post( this.url + this.puerto + '/ktp_stock', body )
      .pipe( tap( value =>  { if ( this.loading && mostrar ) { this.loading.dismiss(); } }) );
  }

  enviarListaExcel( filtros: any, codigos: any, modo: string, mostrar: any ) {
    if ( mostrar ) { this.showLoading(); }
    const body = { datos: filtros, modo: modo, codigos: codigos };
    return this.http.post( this.url + this.puerto + '/ktp_stock_excel', body )
        .pipe( tap( value =>  { if ( this.loading && mostrar ) { this.loading.dismiss(); } }) );
  }

  getDataProd( dato: any ) {
    const body = dato;
    return this.http.post( this.url + this.puerto + '/ktp_prod', body );
  }

  getDataProdOCC( dato: any ) {
    const body = dato;
    return this.http.post( this.url + this.puerto + '/ktp_prodOCC', body );
  }

}

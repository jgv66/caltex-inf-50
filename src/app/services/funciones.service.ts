import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { DatosService } from './datos.service';

@Injectable({
  providedIn: 'root'
})
export class FuncionesService {

  loader:          any;
  loading:         any;
  usuario:         any;
  cliente:         any;
  varCliente:      any = [];
  config:          any;
  copiaPendientes: any;
  pendientes:      number;
  misCompras       = 0;
  documento:       any;

  constructor( private loadingCtrl: LoadingController,
               private alertCtrl:   AlertController,
               private datos:       DatosService,
               private toastCtrl:   ToastController ) {
  }

  textoSaludo() {
    const dia   = new Date();
    if ( dia.getHours() >= 8  && dia.getHours() < 12 ) {
      return 'buenos días ';
    } else if ( dia.getHours() >= 12 && dia.getHours() < 19 ) {
      return 'buenas tardes ';
    } else {
      return 'buenas noches '; }
  }

  cargaEspera( milisegundos?) {
    this.loader = this.loadingCtrl.create({
      duration: ( milisegundos != null && milisegundos !== undefined ? milisegundos : 3000 )
      });
    this.loader.present();
  }

  descargaEspera() {
    this.loader.dismiss();
  }

  async msgAlert( titulo, texto ) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: texto,
      buttons: ['OK']
    });
    await alert.present();
  }

  async muestraySale( cTexto, segundos, posicion? ) {
    const toast = await this.toastCtrl.create({
      message: cTexto,
      duration: 1500 * segundos,
      position: posicion || 'middle'
    });
    toast.present();
  }

  aunVaciaLaCotiz() {
    return ( this.datos.ItemCotizado.length === 1 && this.datos.ItemCotizado[0].codigo === '' );
  }

  existeEnCotiz( producto ) {
    let existe = false ;
    const largo = this.datos.ItemCotizado.length;
    for ( let i = 0 ; i < largo ; i++ ) {
        if ( this.datos.ItemCotizado[i].codigo.trim() === producto.codigo.trim() ) {
            existe = true;
            break;
        }
    }
    return existe;
  }

  datoCotizado( producto ) {
    // tslint:disable-next-line: no-shadowed-variable
    return new Promise( ( resolve, reject ) => {
        console.log(producto);
        const resultado = this.datos.ItemCotizado.find( prod => prod.codigo.trim() === producto.codigo.trim() );
        if ( resultado  ) {
          resolve( {metros: resultado.metros, rollos: resultado.rollos, precioxmetro: resultado.precioxmetro } );
        } else {
          reject( {metros: undefined, rollos: undefined, precioxmetro: undefined} );
        }
    });
  }

  async addCotiz( producto, texto? ) {
    // revisar que no existe
    if ( this.aunVaciaLaCotiz() ) {
        // agregar al primer item
        this.datos.ItemCotizado[0].codigo       = producto.codigo.trim();
        this.datos.ItemCotizado[0].codigotec    = producto.codigotec.trim();
        this.datos.ItemCotizado[0].descrip      = producto.descripcion.trim();
        this.datos.ItemCotizado[0].precio       = producto.precio;
        this.datos.ItemCotizado[0].listapre     = producto.listaprecio;
        this.datos.ItemCotizado[0].metodolista  = producto.metodolista;
        this.datos.ItemCotizado[0].saldo        = producto.saldo_ud1;
        this.datos.ItemCotizado[0].rtu          = producto.rtu;
        this.datos.ItemCotizado[0].metros       = producto.metros ;
        this.datos.ItemCotizado[0].rollos       = producto.rollos ;
        this.datos.ItemCotizado[0].precioxmetro = producto.precioxmetro ;
        this.datos.ItemCotizado[0].codigoimagen = producto.codigoimagen.trim();
        //
    } else if ( this.existeEnCotiz( producto ) ) {
        // ya existe, debo cambiarlo
        const pos = this.datos.ItemCotizado.indexOf( producto.codigo.trim() );
        this.datos.ItemCotizado[pos].metros       = ( producto.metros === undefined ? 0 : producto.metros ) ;
        this.datos.ItemCotizado[pos].rollos       = ( producto.rollos === undefined ? 0 : producto.rollos ) ;
        this.datos.ItemCotizado[pos].precioxmetro = ( producto.precioxmetro === undefined ? 0 : producto.precioxmetro );
    } else {
        // si no existe
        this.datos.ItemCotizado.push({  codigo:       producto.codigo.trim(),
                                        codigotec:    producto.codigotec.trim(),
                                        descrip:      producto.descripcion.trim(),
                                        precio:       producto.precio,
                                        listapre:     producto.listaprecio,
                                        metodolista:  producto.metodolista,
                                        saldo:        producto.saldo_ud1,
                                        rtu:          producto.rtu,
                                        metros:       producto.metros,
                                        rollos:       producto.rollos,
                                        precioxmetro: producto.precioxmetro,
                                        codigoimagen: producto.codigoimagen.trim() });
    }
    this.muestraySale( `Item agregado a ${ texto ? texto : 'cotizacion' }`, 0.40, 'middle' );
  }

}

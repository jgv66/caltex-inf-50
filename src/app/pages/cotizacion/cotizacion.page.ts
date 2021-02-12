import { Component, OnInit, ViewChild } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { AlertController, IonList } from '@ionic/angular';

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.page.html',
  styleUrls: ['./cotizacion.page.scss'],
})
export class CotizacionPage implements OnInit {

  @ViewChild('lista') lista: IonList;

  usuario;
  nombreCli   = '';
  emailTo     = '';
  emailCc     = '';
  emailObs    = '';
  cotizacion  = undefined;

  constructor(  public datos: DatosService,
                private alertCtrl: AlertController,
                private funciones: FuncionesService ) { }

  ngOnInit() {
    if ( this.datos.ItemCotizado.length > 0 ) {
      this.cotizacion = true;
    }
    this.datos.readDatoLocal( 'KInf_usuario') .then( dato => { this.usuario = dato; } );
  }

  aunVaciaLaCotiz() {
    return ( this.datos.ItemCotizado.length === 1 && this.datos.ItemCotizado[0].codigo === '' );
  }

  async quitarDeCotiz( producto ) {
    const confirm = await this.alertCtrl.create({
        header:  'Eliminar ítem',
        message: 'Elimino este ítem: ' + producto.codigo.trim() + ' ?',
        buttons: [
                    { text: 'Sí, elimine!', handler: () => { this.quitarDeLaCotizacion( producto ); } },
                    { text: 'No, gracias',  handler: () => {} }
                   ]
          });
    await confirm.present();
    this.lista.closeSlidingItems();  // efecto para cerrar el slide abierto...
  }

  quitarDeLaCotizacion( producto ) {
    // console.log('entrando');
    let i = 0;
    if ( !this.aunVaciaLaCotiz() ) {
        this.datos.ItemCotizado.forEach(element => {
          if ( this.datos.ItemCotizado[i].codigo === producto.codigo ) {
            this.datos.ItemCotizado.splice(i, 1);
          }
          ++i;
        });
    }
    if ( this.datos.ItemCotizado.length === 0 ) {
      this.datos.ItemCotizado = [];
    }
    console.log('saliendo');
  }

  enviarviamail() {
    if ( this.emailTo === '' ) {
      this.funciones.msgAlert('', 'Debe indicar Email del cliente a quien enviará la cotización.' );
    } else {
      this.datos.enviarCotizacion( this.usuario, this.emailTo, this.emailCc, this.nombreCli, this.emailObs )
        .subscribe( (respuesta: any) => {
          if ( respuesta.resultado === 'ok' ) {
            this.funciones.msgAlert('', 'El correo fue enviado al cliente. ' +
                                                'Una copia de la cotizacion será enviada a su propio correo. ' +
                                                'Otra copia será enviada a facturación a modo de respaldo.' );
            this.datos.limpiaCotiz();
          }
        },
          (err: any) => { this.funciones.msgAlert('', 'Ocurrió un problema al intentar enviar el correo. ' +
                                                    'Reintente en algunos minutos.' );
        });
    }
  }

}


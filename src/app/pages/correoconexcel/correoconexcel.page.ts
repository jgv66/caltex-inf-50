import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-correoconexcel',
  templateUrl: './correoconexcel.page.html',
  styleUrls: ['./correoconexcel.page.scss'],
})
export class CorreoconexcelPage implements OnInit {

  usuario     = undefined;
  data        = undefined;
  codigos     = [];
  nombreCli   = '';
  emailTo     = '';
  emailCc     = '';
  modo        = undefined;
  lprogress   = false;

  constructor(  public datos: DatosService,
                private activatedRoute: ActivatedRoute,
                private navCtrl: NavController,
                private funciones: FuncionesService ) {
      this.activatedRoute.params.subscribe( params => { this.modo = params['modo']; } );
  }

  ngOnInit() {
    this.datos.readDatoLocal( 'KInf_usuario') .then( dato => { this.usuario = dato; } );
    this.data = this.datos.rescataMientras();
    if ( this.modo === 'marcar_productos' ) {
      this.datos.ItemCotizado.forEach(element => {
        this.codigos.push( { codigo: element.codigo } );
      });
    }
    console.log(this.data, this.modo, this.codigos );
  }

  enviarviamail() {
    if ( this.emailTo === '' ) {
      this.funciones.msgAlert('ATENCION', 'Debe indicar Email a quien enviará la planilla.' );
    } else {
      //
      this.data.emailTo   = this.emailTo;
      this.data.emailCc   = this.emailCc;
      this.data.nombreCli = this.nombreCli;
      //
      this.lprogress = true;
      this.datos.enviarListaExcel( this.data, this.codigos, this.modo, false )
        .subscribe( (respuesta: any) => {
          this.lprogress = false;
          if ( respuesta.resultado === 'ok' ) {
            this.funciones.msgAlert('ATENCION', 'El correo fue enviado.' );
            this.navCtrl.navigateBack( [ '/tabinicio' ] );
          } else {
            this.funciones.msgAlert('ATENCION', 'CORREO NO SE ENVIO: ' + respuesta.mensaje );
          }
        });

      }
  }

}


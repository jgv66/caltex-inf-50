import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  clave = '';
  empresa = '';
  emp = '';
  empresas = [];
  marcas = [];
  superfam = [];
  uuid = undefined;

  constructor(  private datos: DatosService,
                private funciones: FuncionesService,
                private router: Router ) { }

  ngOnInit() {
    // uuid
    this.usrUUID();
    //
    this.datos.getDataEmpresas()
        .subscribe( data => {
            this.empresas = data['empresas'];
            this.usrdata();
         });
  }

  async usrdata() {
    const usr = await this.datos.readDatoLocal( 'KInf_usuario' )
        .then( data  => {
                try {
                  this.email = data.EMAIL;
                } catch (error) {
                  this.email = '';
                }},
               error => { console.log(error); } );
  }

  async usrUUID() {
    const usr = await this.datos.readDatoLocal( 'KTP_user_uuid_inf' )
            .then(  data  => { this.uuid = ( data === undefined ) ? '' : data; },
                    error => { console.log(error); } );
  }

  login() {
    this.datos.getDataUser( 'proalma', this.email, this.clave, this.empresa, this.uuid, 'inf' )
      .subscribe( data => {
        const rs = data['recordsets'][0];
        try {
          if ( rs[0].KOFU ) {
            console.log(rs[0]);
            //
            this.datos.saveDatoLocal( 'KInf_usuario', rs[0] );
            // perfecto !!!. entrega un array con el dato filtrado (santa)
            // console.log( (this.empresas).filter( (e) => e.codigo === this.empresa ) );
            this.empresas.forEach( element => {
              if ( element.codigo === this.empresa ) {
                this.datos.saveDatoLocal( 'KInf_empresa', element.razonsocial );
              }
            });
            this.router.navigate( ['/tabinicio'] );
          }
        } catch (error) {
            this.funciones.msgAlert( '', 'Usuario, clave y empresa no coinciden. Corrija y reintente.' );
        }
      },
      err => {
        console.error('ERROR Verifique credenciales', err);
      });
  }

  seleccionaEmpresa( event: any ) {
    this.emp = event;
    console.log(this.emp);
  }

}

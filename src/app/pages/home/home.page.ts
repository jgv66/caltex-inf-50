import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  deferredPrompt: any;
  showButton = false;
  showIosBanner = false;
  isIos: boolean;
  uuid = undefined;

  constructor( private datos: DatosService ) {}

  ngOnInit() {
    // uuid
    this.usrRegistro();
    //
  }

  async usrRegistro() {
    const uuidReg = await this.datos.readDatoLocal( 'KTP_user_uuid_inf' )
      .then(  data  => {
                try { if ( data !== '' && data !== undefined ) {
                        this.uuid = data;
                      } else {
                        this.registroUUid();
                      }
                } catch (error) {
                  /* no hay registro */
                }},
              error => { console.log(error); } );
  }
  // registro del dispositivo !!!
  registroUUid() {
    this.datos.getNewId().subscribe( data => { this.uuid = data['newid'][0].newid;
                                               this.datos.saveDatoLocal( 'KTP_user_uuid_inf', this.uuid );
                                             });
  }

}

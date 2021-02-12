import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatosService } from 'src/app/services/datos.service';
import { FuncionesService } from 'src/app/services/funciones.service';

@Component({
  selector: 'app-tabinicio',
  templateUrl: './tabinicio.page.html',
  styleUrls: ['./tabinicio.page.scss'],
})
export class TabinicioPage implements OnInit {

  @ViewChild( IonContent ) content: IonContent;

  lScrollInfinito = false;
  listaProductos  = [];
  offset          = 0;  // primer registro codigo+sucursal
  codproducto     ;
  descripcion     ;
  usuario         ;
  config_stock:   any;
  config_precio:  any;
  config_occ:     any;
  config_orden:   any;
  filtrosVarios   = false;
  codMarcas       ; marcas = [];
  codRubros       ; rubros = [];
  codSuperFam     ; superfamilias = [];
  nombreEmpresa   ;
  scrollSize      = 60;
  lafecha         = new Date();
  modocoti        = false;
  modoexcel       = false;
  formaexcel      = undefined;

  constructor( public  datos:     DatosService,
               private funciones: FuncionesService,
               private alerta:    AlertController,
               private router:    Router ) {
    this.filtrosVarios = false;
    this.codproducto   = '';
    this.descripcion   = '';
    this.codRubros     = '';
    this.codMarcas     = '';
    this.codSuperFam   = '';
  }

  ionViewWillEnter() {
  }

  ngOnInit() {
    this.getVariablesLocales().then( () => {
      this.datos.getDataRubros().subscribe( data => this.rubros = data['rubros'] );
      this.datos.getDataMarcas().subscribe( data => this.marcas = data['marcas'] );
      this.datos.getDataSuperFamilias().subscribe( data => this.superfamilias = data['superfamilias'] );
      // inicializa la cotizacion
      this.datos.limpiaCotiz();
    });
  }

  aBuscarProductos( xdesde?: any, infiniteScroll?: any ) {
    //
    this.getVariablesLocales();
    //
    if ( this.codproducto === '' && this.descripcion === '' && this.codRubros === '' && this.codMarcas === '' && this.codSuperFam === '' ) {
      this.funciones.msgAlert('DATOS VACIOS', 'Debe indicar algún dato para buscar...');
    } else {
      //
      if ( xdesde === 1 ) {
          this.offset          = 0 ;
          this.listaProductos  = [];
          this.lScrollInfinito = true;
          if ( infiniteScroll ) {
            infiniteScroll.target.disabled = false;
          }
      } else {
          this.offset += this.scrollSize ;
      }
      //
      this.datos.getDataSt( { empresa:        this.usuario.EMPRESA,
                              usuario:        this.usuario.KOFU,
                              codproducto:    this.codproducto,
                              descripcion:    this.descripcion,
                              offset:         this.offset.toString(),
                              ordenar:        this.config_orden,
                              soloconstock:   this.config_stock,
                              soloconprecio:  this.config_precio,
                              soloconocc:     this.config_occ,
                              superfamilias:  this.codSuperFam,
                              rubros:         this.codRubros,
                              marcas:         this.codMarcas },
                              ( xdesde === 1 ) )
          .subscribe( data => { this.revisaExitooFracaso( data, xdesde, infiniteScroll ); },
                      err  => { this.funciones.msgAlert( 'ATENCION', err );  }
                    );
    }
  }
  private revisaExitooFracaso( data, xdesde, infiniteScroll ) {
    const rs    = data.data;
    const largo = rs.length;
    if ( rs === undefined || largo === 0 ) {
      this.funciones.msgAlert('ATENCION', 'Su búsqueda no tiene resultados. Intente con otros datos.');
    } else if ( largo > 0 ) {
      //
      // this.listaProductos = ( this.offset === 0 ) ? rs : this.listaProductos.concat(rs);
      this.listaProductos.push( ...rs  );
      //
      if ( infiniteScroll ) {
        infiniteScroll.target.complete();
      }
      //
      if ( largo < this.scrollSize ) {
        this.lScrollInfinito = false ;
      } else if ( xdesde === 1 ) {
        this.lScrollInfinito = true ;
      }
    }
  }

  masDatos( infiniteScroll: any ) {
    this.aBuscarProductos( 0, infiniteScroll );
  }

  masOpciones() {
    //
    this.filtrosVarios = !this.filtrosVarios ;
    //
    if ( !this.filtrosVarios ) {
      this.codMarcas   = '';
      this.codRubros   = '';
      this.codSuperFam = '';
    }
  }

  largoListaProductos() {
    return this.listaProductos.length;
  }

  async filtros() {
      this.getVariablesLocales();
      const alert = await this.alerta.create({
        header: 'Filtros para búsquedas',
        inputs: [
          { name: 'CON-STOCK',
            type: 'checkbox',
            label: 'Productos con Stock',
            value: 'CON-STOCK',
            checked: ( this.config_stock === 'si' ) ? true : false },
          { name: 'CON-PRECIO',
            type: 'checkbox',
            label: 'Productos con Precio',
            value: 'CON-PRECIO',
            checked: ( this.config_precio === 'si' ) ? true : false  },
          { name: 'CON-OCC',
            type: 'checkbox',
            label: 'Con OCC futuras',
            value: 'CON-OCC',
            checked: ( this.config_occ === 'si' ) ? true : false  },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {}
          }, {
            text: 'Ok',
            handler: (data) => {
              this.guardaDatos( data );
              this.getVariablesLocales();
            }
          }
        ]
      });

      await alert.present();
  }
  async orden() {
    this.getVariablesLocales();
    const alert = await this.alerta.create({
      header: 'Orden del Reporte',
      inputs: [
        { name: 'CODIGO',
          type: 'radio',
          label: 'Codigo',
          value: 'CODIGO',
          checked: ( this.config_orden === 'CODIGO' ) ? true : false },
        { name: 'DESCRIPCION',
          type: 'radio',
          label: 'Descripción',
          value: 'DESCRIPCION',
          checked: ( this.config_orden === 'DESCRIPCION' ) ? true : false  },
        { name: 'MARCA',
          type: 'radio',
          label: 'Marca',
          value: 'MARCA',
          checked: ( this.config_orden === 'MARCA' ) ? true : false  },
        { name: 'SUPERFAM',
          type: 'radio',
          label: 'Super-Fam.',
          value: 'SUPERFAM',
          checked: ( this.config_orden === 'SUPERFAM' ) ? true : false  },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Ok',
          handler: (data) => {
            this.guardaOrdenamiento( data );
            this.getVariablesLocales();
          }
        }
      ]
    });

    await alert.present();
  }
  guardaOrdenamiento( data ) {
    if ( data.length > 0 ) {
      this.datos.saveDatoLocal( 'KInf_orden', data );
    } else {
      this.datos.saveDatoLocal( 'KInf_orden', 'CODIGO' );
    }
  }

  guardaDatos( data ) {
    if ( data.filter( (e) => e === 'CON-STOCK' ).length > 0 ) {
      this.datos.saveDatoLocal( 'KInf_stock',  'si' );
    } else {
      this.datos.saveDatoLocal( 'KInf_stock',  'no' );
    }
    if ( data.filter( (e) => e === 'CON-PRECIO' ).length > 0 ) {
      this.datos.saveDatoLocal( 'KInf_precio',  'si' );
    } else {
      this.datos.saveDatoLocal( 'KInf_precio',  'no' );
    }
    if ( data.filter( (e) => e === 'CON-OCC' ).length > 0 ) {
      this.datos.saveDatoLocal( 'KInf_occ',  'si' );
    } else {
      this.datos.saveDatoLocal( 'KInf_occ',  'no' );
    }
  }

  async getVariablesLocales() {
    await this.datos.readDatoLocal( 'KInf_empresa' ).then( dato => this.nombreEmpresa = dato );
    await this.datos.readDatoLocal( 'KInf_usuario') .then( dato => { this.usuario = dato; } );
    await this.datos.readDatoLocal( 'KInf_precio').then( dato => { this.config_precio = ( dato === undefined ) ? 'no' : dato ; } );
    await this.datos.readDatoLocal( 'KInf_stock').then( dato => { this.config_stock = ( dato === undefined ) ? 'no' : dato ; } );
    await this.datos.readDatoLocal( 'KInf_occ').then( dato => { this.config_occ = ( dato === undefined ) ? 'no' : dato ; } );
    await this.datos.readDatoLocal( 'KInf_orden').then( dato => { this.config_orden = ( dato === undefined ) ? 'CODIGO' : dato ; } );
  }

  scrollToTop() {
    this.content.scrollToTop(400);
  }

  lhaycotiz() {
    return ( this.datos.ItemCotizado.length > 0 );
  }

  ItemesCotizados() {
    // console.log(this.datos.ItemCotizado);
    this.router.navigate( ['/cotizados' ] );
  }

  modocotizacion() {
    this.modocoti = !this.modocoti;
  }

  async marcarExcel() {
    const alert = await this.alerta.create({
      header: 'Exportar a Excel',
      inputs: [
        { name: 'lista_completa',
          type: 'radio',
          label: 'Lista completa',
          value: 'lista_completa',
          checked: true
        },
        { name: 'marcar_productos',
          type: 'radio',
          label: 'Marcar uno a uno',
          value: 'marcar_productos',
          checked: false
        },
        { name: undefined,
          type: 'radio',
          label: 'Desactivar',
          value: undefined,
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        },
        {
          text: 'Ok',
          handler: (data) => {
            if ( data === undefined ) {
              this.modoexcel = false;
              this.formaexcel = undefined;
              this.datos.ItemCotizado = [];
            } else if ( data === 'lista_completa' && this.codproducto === '' && this.descripcion === '' && this.codRubros === '' && this.codMarcas === '' && this.codSuperFam === '' ) {
              this.modoexcel = false;
              this.formaexcel = undefined;
              this.funciones.msgAlert('DATOS VACIOS', 'Debe indicar algún dato para marcar todo y enviar planilla Excel...');
            } else if ( data === 'marcar_productos' ) {
              this.modoexcel = true;
              this.formaexcel = data;
              this.funciones.msgAlert('Marcar uno a uno', 'Una vez terminada la selección pulse la barra verde y complete los datos para enviar la planilla Excel');
            } else {
              this.formaexcel = data;
              this.enviarExcel();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  enviarExcel() {
    this.datos.guardaMientras( { empresa:       this.usuario.EMPRESA,
                                  usuario:       this.usuario.KOFU,
                                  codproducto:   this.codproducto,
                                  descripcion:   this.descripcion,
                                  offset:        this.offset.toString(),
                                  ordenar:       this.config_orden,
                                  soloconstock:  this.config_stock,
                                  soloconprecio: this.config_precio,
                                  soloconocc:    this.config_occ,
                                  superfamilias: this.codSuperFam,
                                  rubros:        this.codRubros,
                                  marcas:        this.codMarcas,
                                  formaexcel:    this.formaexcel,
                                  emailTo:       undefined,
                                  emailCc:       undefined,
                                  nombreCli:     undefined } );
    this.router.navigate( [ '/mail2excel/' + this.formaexcel ] );
  }

}

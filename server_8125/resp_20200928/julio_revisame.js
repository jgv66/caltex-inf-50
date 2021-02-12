// console.log("hola mundo");
var express = require('express');
var app     = express();
// tto asincrono para grabaciones
var async   = require("async");
// configuracion
var _dbconex       = require('./conexion_mssql.js');
var _configuracion = require('./configuracion_cliente.js');
var _correos       = require('./k_sendmail.js');
var _elmail        = require('./k_traemail.js');
var _lasEmpresas   = require('./k_empresas.js');
var _funciones     = require('./k_funciones.js');
var _Activity      = require('./k_regactiv.js');
// exportar a excel
var fs        = require('fs');
var excel_tto = require('./k_excel_gen');
var request   = require('request');
var path      = require('path');
// var http      = require('http');
//
var Excel = require('exceljs');
//
var uuid = 0;

//
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(204);
    }
    else {
      next();
    }
});
// envio de _correos 
var nodemailer = require('nodemailer'); // email sender function 
    exports.sendEmail = function(req, res){
    console.log('enviando correo...'); 
};
//
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
 
// servidor escuchando puerto 8125
app.set('port',8125);
var ipAddress = '0.0.0.0'; 
var https = require('https');
var fileSystem = require('fs');
var https_options = {
    key: fileSystem.readFileSync('/etc/letsencrypt/live/kinetik.cl/privkey.pem'),
    cert: fileSystem.readFileSync('/etc/letsencrypt/live/kinetik.cl/fullchain.pem')
};
server = https.createServer(https_options, app).listen(app.get('port'), function(){
    console.log('Server started on localhost:' + app.get('port') + '; Press Ctrl-C to terminate.');
    console.log('Please connect to configured IP: ', ipAddress);
    console.log('Application worker ', process.pid, ' started...');
});

// carpeta de imagenes: desde donde se levanta el servidor es esta ruta -> /root/trial-server-001/public
app.use( express.static( './public' ) ) ;

publicpath   = path.resolve( __dirname, 'public' );
CARPETA_IMGS = publicpath + '/images/';
CARPETA_XLSX = publicpath + '/xlsx/';
// console.log(CARPETA_IMGS, CARPETA_XLSX );

// dejare el server myssql siempre activo
var sql   = require('mssql');
var conex = sql.connect( _dbconex );
 
app.post('/seteocliente', 
function (req, res) {
    res.json( { configp: _configuracion } );
});
    
app.post('/ktp_empresas', 
function (req, res) {
    //
    _lasEmpresas.configp( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', empresas: data } );
        } );
});
app.get('/ktp_empresas_get', 
function (req, res) {
    //
    _lasEmpresas.configp( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', empresas: data } );
        } );
});

app.post('/ktp_rubros', 
function (req, res) {
    //
    _lasEmpresas.rubros( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', rubros: data } );
        } );
});
app.get('/ktp_rubros_get', 
function (req, res) {
    //
    _lasEmpresas.rubros( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', rubros: data } );
        } );
});

app.post('/ktp_marcas', 
function (req, res) {
    //
    _lasEmpresas.marcas( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', marcas: data } );
        } );
});
app.get('/ktp_marcas_get', 
function (req, res) {
    //
    _lasEmpresas.marcas( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', marcas: data } );
        } );
});

app.post('/ktp_superfamilias', 
function (req, res) {
    //
    _lasEmpresas.superfamilias( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', superfamilias: data } );
        } );
});
app.get('/ktp_superfam_get', 
function (req, res) {
    //
    _lasEmpresas.superfamilias( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', superfamilias: data } );
        } );
});
app.post('/ktp_familias', 
function (req, res) {
    //
    _lasEmpresas.familias( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', familias: data } );
        } );
});
app.get('/ktp_familias_get', 
function (req, res) {
    //
    _lasEmpresas.familias( sql )
        .then( function(data) { 
            res.json( { resultado: 'ok', familias: data } );
        } );
});

app.post('/ktp_variables', 
function (req, res) {
    //
    _lasEmpresas.variables( sql, req.body.cliente )
        .then( function(data) { 
            //console.log("variables para "+req.body.cliente, data ); 
            res.json( { resultado: 'ok', variables: data } );
        } );
});

// http://server:port/ktp_variables/:usr/:dato1/:dato2....
app.get('ktp_variables_get/:cliente', 
function (req, res) {
    _lasEmpresas.variables( sql, req.params.cliente )
        .then( function(data) { 
            res.json( { resultado: 'ok', variables: data } );
        } );
});
    
//agregado 12/01/2019
// se pasa parametro de empresa 11/03/2019
app.post('/ktp_stock', 
function (req, res) {
    _funciones.stock( sql, req.body )
        .then(  function(rs) {  res.json( { resultado: 'ok', data: rs } ); 
        } );
});

app.get('/ktp_newid', 
function (req, res) {
    _funciones.newid( sql )
        .then( function(data) { 
            //console.log("variables para "+req.body.cliente, data ); 
            res.json( { resultado: 'ok', newid: data } );
        } );
});

app.post('/ktp_prod', 
function (req, res) {
    _funciones.producto( sql, req.body )
        .then(  function(rs) { res.json( { resultado: 'ok', data: rs } ); } );
});

app.post('/ktp_prodOCC', 
function (req, res) {
    _funciones.productoconOCC( sql, req.body )
        .then(  function(rs) { res.json( { resultado: 'ok', data: rs } ); } );
});

app.post('/ktp_buscarProductos', 
function (req, res) {
    _funciones.listaProductos( sql, req.body )
        .then(  function(rs) { res.json( { resultado: 'ok', data: rs } ); } );
});

app.post('/ktp_buscarClientes', 
function (req, res) {
    _funciones.listaClientes( sql, req.body )
        .then(  function(rs) { res.json( { resultado: 'ok', data: rs } ); } );
});

app.post('/ktp_traeImpagos', 
function (req, res) {
    _funciones.impagos( sql, req.body )
        .then(  function(rs) { res.json( { resultado: 'ok', data: rs } ); } );
});

//agregado 12/01/2019
app.post('/ktp_traeDocumento', 
function (req, res) {
    _funciones.traeDocumento( sql, req.body )
        .then(  function(rs) { res.json( { resultado: 'ok', data: rs } ); 
        } );
});

app.post('/soloEnviarCorreo', 
function (req, res) {
    //
    var carro = req.body.carro || [] ;
    var xTo   = req.body.cTo   || '' ;
    var xCc   = req.body.cCc   || '' ;
    var xObs  = req.body.cObs  || '' ; 
    //
    var lineas   = '';
    var htmlBody = '';
    //
    var x2 = '';
    //
    _elmail.delVendedor( sql, carro[0].vendedor ).then( function(data) { x2 = data; } );
    // es obligatorio que el vendedor tenga correo
    var mailList = [];  
    //
    _Activity.registra( sql, carro[0].vendedor, 'soloEnviarCorreo', xTo, xCc, x2 );
    //
    carro.forEach(element => {
        lineas += '<tr>';
        lineas += '<td align="center">'+element.cantidad.toString()+'</td>';
        lineas += '<td align="center">'+element.codigo+'</td>';
        lineas += '<td align="center">'+element.descripcion+'</td>';
        lineas += '<td align="center">'+element.preciounit.toLocaleString()+'</td>';
        lineas += '<td align="center">'+element.descuentos.toString()+'</td>';
        lineas += '<td align="center">'+element.subtotal.toLocaleString()+'</td>';
        lineas += '</tr>';
    });
    htmlBody = _correos.primeraParte( xObs ) + lineas + _correos.segundaParte();
    mailList.push( { cc: [ xCc, x2 ], to: xTo } ); 
    //console.log('soloEnviarCorreo->',xCc, x2, xTo );
    _correos.enviarCorreo( res, nodemailer, mailList, htmlBody );  
    //
});
app.post('/enviarcorrreo', 
function (req, res) {
    //
    var carro       = req.body.itemes    || [] ;
    var xTo         = req.body.cTo       || '' ;
    var xCc         = req.body.cCc       || '' ;
    var xEmailVend  = req.body.emailvend || '' ;
    var xnombre     = req.body.nombre    || '' ; 
    //
    var lineas   = '';
    var htmlBody = '';
    //
    var mailList = [{ cc: [ xCc, xEmailVend ], to: xTo }];  
    //
    carro.forEach( function(element) {
        lineas += '<tr>';
        lineas += '<td align="center"><img src="http://www.grupocaltex.cl/imagenes/fotos18/'+element.codigoimagen+'.jpg" width="150px" height="150px"/></td>';
        lineas += '<td align="center">'+element.codigo+'</td>';
        lineas += '<td align="center">'+element.codigotec+'</td>';
        lineas += '<td align="center">'+element.descrip+'</td>';
        lineas += '<td align="center">'+element.precio.toLocaleString()+'</td>';
        lineas += '<td align="center">'+element.rtu.toString()+'</td>';
        lineas += '</tr>';
    });
    //
    htmlBody = _correos.cotizcuerpo( xnombre ) + lineas + _correos.cotizfin();
    _correos.enviarCotizacion( res, nodemailer, mailList, htmlBody, '' );
    //
    res.json( { resultado: 'ok', numero: 'ENVIADO' } );
    //
});

app.post('/encorr2', 
function (req, res) {
    //
    var carro       = req.body.itemes     || [] ;
    var xTo         = req.body.cTo        || '' ;
    var xCc         = req.body.cCc        || '' ;
    var xEmailVend  = req.body.emailvend  || '' ;
    var xnombre     = req.body.nombre     || '' ; 
    var empresa     = req.body.empresa    || '' ; 
    var xnombrecli  = req.body.cNombreCli || '(no indicado)'; 
    //
    var lineas   = '';
    var htmlBody = '';
    //
    var mailList = [{ cc: [ xCc, xEmailVend ], to: xTo }];  
    //
    var xhoy     = new Date();
    var anno     = xhoy.getFullYear();    
    var mes      = xhoy.getMonth()+1;    
    var dia      = xhoy.getDate();
    var rnd      = (Math.random() * (100 - 1) + 1).toString();
    //
    var cfile    = 'cotiz'+anno.toString()+mes.toString()+dia.toString()+rnd.replace( ".", "" )+'.csv';
    var pathfile = __dirname + '/public';
    //
    var header = '';
    var rows   = '';
    var xpre   = '';
    var xcan   = 0 ;
    var xuni   = '';
    // si es la textil los datos on otros 
    if ( empresa === '04' ) {
        header += "Codigo Interno"+";";
        header += "Cod.Tecnico"+";";
        header += "Descripcion"+";";
        header += "Precio x Mt."+";";
        header += "Cantidad"+";";
        header += "Unidad"+";";
        //
        carro.forEach( function(element) {
            // excel
            xpre = element.precioxmetro.toLocaleString();
            xcan = ( element.metros > 0 ) ? element.metros.toLocaleString() : element.rollos.toLocaleString();     
            xuni = ( element.metros > 0 ) ? 'MT' : 'ROLLO';
            //
            lineas += '<tr>';
            // lineas += '<td align="center"><img src="http://www.grupocaltex.cl/imagenes/fotos18/'+element.codigoimagen+'.jpg" width="150px" height="150px"/></td>';
            lineas += '<td align="center">'+element.codigo+'</td>';
            lineas += '<td align="center">'+element.codigotec+'</td>';
            lineas += '<td align="center">'+element.descrip+'</td>';
            lineas += '<td align="center">'+xpre+'</td>';
            lineas += '<td align="center">'+xcan+'</td>';
            lineas += '<td align="center">'+xuni+'</td>';
            lineas += '</tr>';
            //
            rows += '"'+element.codigo+'"'+";";
            rows += '"'+element.codigotec+'"'+";";
            rows += '"'+element.descrip+'"'+";";
            rows += xpre.replace( ',', '' )+";";
            rows += xcan.replace( ',', '' )+";";
            rows += '"'+xuni+'"'+";";
            //
        });
    // todoas las demas empresas
    } else {
        header += "Codigo Interno"+";";
        header += "Cod.Tecnico"+";";
        header += "Descripcion"+";";
        header += "Precio"+";";
        header += "Curva"+";";
        header += "Imagen"+"\n";
        //
        carro.forEach( function(element) {
            lineas += '<tr>';
            lineas += '<td align="center"><img src="http://www.grupocaltex.cl/imagenes/fotos18/'+element.codigoimagen+'.jpg" width="150px" height="150px"/></td>';
            lineas += '<td align="center">'+element.codigo+'</td>';
            lineas += '<td align="center">'+element.codigotec+'</td>';
            lineas += '<td align="center">'+element.descrip+'</td>';
            lineas += '<td align="center">'+element.precio.toLocaleString()+'</td>';
            lineas += '<td align="center">'+element.rtu.toString()+'</td>';
            lineas += '</tr>';
            // excel
            xpre = element.precio.toLocaleString();
            //
            rows += '"'+element.codigo+'"'+";";
            rows += '"'+element.codigotec+'"'+";";
            rows += '"'+element.descrip+'"'+";";
            rows += xpre.replace( ',', '' )+";";
            rows += element.rtu.toString()+";";
            rows += '"http://www.grupocaltex.cl/imagenes/fotos18/'+element.codigoimagen+'.jpg"'+"\n";
            //
        });
    }
    //
    fs.writeFileSync( pathfile+'/'+cfile, header+rows );
    var xxxx = fs.readFileSync( pathfile+'/'+cfile );
    data_txt = new Buffer(xxxx).toString();
    // console.log(data_txt);
    htmlBody = _correos.cotizcuerpo( xnombre, xnombrecli, empresa ) + lineas + _correos.cotizfin();
    console.log(htmlBody);
    // 
    _correos.enCo2( res, nodemailer, mailList, htmlBody, cfile, pathfile, fs, empresa );  
    //
    res.json( { resultado: 'ok', numero: 'ENVIADO' } );
    //
});

// agregado el 29/11/2018
app.post('/grabadocumentos_mejorado_para_trabajarlo', 
function (req, res) {
    // los parametros
    var carro     = req.body.carro;
    var modalidad = req.body.modalidad;
    var tipodoc   = req.body.tipodoc || 'PRE' ;   /* PRE, NVV, COV */
    var xObs      = req.body.cObs    || '' ; 
    var xOcc      = req.body.cOcc    || '' ;  // incorporada 27/07/2018, se modifica ktp_encabezado -> occ varchar(40)
    // variables
    var bodega_wms = '';
    //
    var query = '';
    var xhoy  = new Date();
    var hora  = xhoy.getTime();    
    //
    var lineas   = '';
    var htmlBody = '';
    var mailList = [];
    var x1 = '';
    var x2          = '',
        rsocial     = '',
        copiasadic  = '',
        nombreVend  = '',
        i           = 0,
        monto       = 0,
        neto        = 0,
        iva         = 0,
        bruto       = 0,
        NoB         = carro[0].metodolista;

    // 
    //console.log( carro );  
    _Activity.registra( sql, carro[0].vendedor, 'grabadocumentos', tipodoc );
    //
    query  = "declare @id     int      = 0 ; ";
    query += "declare @nrodoc char(10) = ''; ";
    query += "declare @Error nvarchar(250) ; ";
    query += "begin transaction ;";
    query += "insert into ktp_encabezado (empresa,cliente,suc_cliente,vendedor,fechaemision,";
    query +=                             "monto,observacion,occ,modalidad,valido,fechaentrega,horainicio,horafinal) ";
    query += "values ('"+carro[0].empresa+"','"+carro[0].cliente+"','"+carro[0].suc_cliente+"','"+carro[0].vendedor+"',getdate(),";
    query +=          "0,'"+xObs.trim()+"','"+xOcc.trim()+"','"+modalidad+"','',getdate(),'"+hora+"','"+hora+"') ;";
    query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
    query += "select @id = @@IDENTITY ;";
    query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
    //
    for ( i = 0; i < carro.length ; i++ ) {
        //
        bodega_wms = carro[i].bodega;
        //
        query += "insert into ktp_detalle (id_preventa,linea,sucursal,bodega,codigo,unidad_tr,unidad1,unidad2,cantidad1,cantidad2,";
        query +=                          "listaprecio,metodolista,precio,";
        query +=                          "porcedes,descuentos,porcerec,recargos,observacion,valido)"; 
        query += " values ";
        query += "(@id,"+(i+1).toString()+",'"+carro[i].sucursal+"','"+carro[i].bodega+"','"+carro[i].codigo+"',";
        query += "1,'','',"+carro[i].cantidad.toString()+", 0,'"+carro[i].listapre+"','"+carro[i].metodolista+"',"+carro[i].precio.toString()+",";
        query += carro[i].dsctovend.toString()+","+((carro[i].precio-carro[i].preciomayor)*carro[i].cantidad).toString()+",0,0,'', '' ) ; ";
        query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
        //
    }
    //    
    query += "update ktp_encabezado set monto=( select sum((d.cantidad1*d.precio)-d.descuentos) from ktp_detalle as d where d.id_preventa=ktp_encabezado.id_preventa ) ";
    query += " where id_preventa=@id ;";
    query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
    //
    if      ( tipodoc =='PRE' )                     { query += "exec ksp_grabaDocumentoPre_v1 'Pendiente', 'NVV', @id, @nrodoc output ;";   }
    else if ( tipodoc =='NVV' || tipodoc == 'COV' ) { query += "exec ksp_grabaDocumentoDef_v1 '"+tipodoc+"', @id, @nrodoc output ;";        }
    //
    query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
    query += "commit transaction ;";
    query += "select @nrodoc as numero, @id as id ;";
    query += "TratarError: ";
    query += "if @@Error<>0 ";
    query += "    BEGIN ";
    query += "    ROLLBACK TRANSACTION ";
    query += "    END ;";
    //
    //console.log( query );
    //
    conex
    .then( function() {
        //
        lineas = '';
        var request = new sql.Request();
        // 
        request.query( query )
        .then(  function(rs) {  console.log("documento ("+tipodoc+") grabado ",rs.recordset); 
                                res.json( { resultado: 'ok', numero: rs.recordset[0].numero } );
                                // es obligatorio que el vendedor tenga correo
                                elmail.delVendedor( sql, carro[0].vendedor )
                                .then( function(data) { 
                                        x2         = data[0].correo;  
                                        nombreVend = data[0].nombre;
                                        copiasadic = data[0].copiasadic || '';                
                                        //
                                        elmail.delCliente( sql, carro[0].cliente, carro[0].suc_cliente )
                                        .then( function(data) { 
                                            x1      = data[0].correo; 
                                            rsocial = data[0].rs;
                                            //
                                            correos.componeBody( sql, rs.recordset[0].id )
                                            .then( data => {   
                                                data.recordset.forEach(element => {
                                                    lineas += '<tr>';
                                                    lineas += '<td align="center">'+element.cantidad.toString()+'</td>';
                                                    lineas += '<td align="center">'+element.codigo+'</td>';
                                                    lineas += '<td align="center">'+element.descripcion+'</td>';
                                                    lineas += '<td align="center">'+element.preciounit.toLocaleString()+'</td>';
                                                    lineas += '<td align="center">'+element.porcentaje.toString()+'%</td>';
                                                    lineas += '<td align="center">'+element.subtotal.toLocaleString()+'</td>';
                                                    lineas += '</tr>';
                                                    monto  += element.subtotal;
                                                    if ( ++i == data.recordset.length ) {
                                                        if ( NoB == 'N' ) {
                                                            neto = monto ; iva = Math.round(monto*0.19) ; bruto = neto + iva;
                                                        } else {
                                                            bruto = monto ; neto = Math.round(monto/(1+19)) ; iva = bruto - neto;
                                                        }
                                                        lineas += '<tr>';
                                                        lineas += '<td colspan="5" align="right"><strong>TOTAL NETO :</strong></td>';
                                                        lineas += '<td align="center">'+neto.toLocaleString()+'</td>';
                                                        lineas += '</tr>';
                                                        lineas += '<tr>';
                                                        lineas += '<td colspan="5" align="right"><strong>IVA :</strong></td>';
                                                        lineas += '<td align="center">'+iva.toLocaleString()+'</td>';
                                                        lineas += '</tr>';
                                                        lineas += '<tr>';
                                                        lineas += '<td colspan="5" align="right"><strong>TOTAL BRUTO :</strong></td>';
                                                        lineas += '<td align="center">'+bruto.toLocaleString()+'</td>';
                                                        lineas += '</tr>';
                                                        //            
                                                    }
                                                });
                                                // 
                                                htmlBody = correos.primeraParte( xObs, nombreVend, rsocial, carro[0].cliente, carro[0].suc_cliente, rs.recordset[0].numero, tipodoc, xOcc ) + lineas + correos.segundaParte();
                                                //
                                                mailList.push( { cc: [ x2, copiasadic ], to: x1 } ); 
                                                correos.enviarCorreo( null, nodemailer, mailList, htmlBody );  
                                            });                                                    
                                        });
                                });
        })
        .catch( function(er) { 
            console.log('error al grabar',er); 
            res.send(er); });
        });
});

// agregado el 23/05/2018
app.post('/grabadocumentos', 
function (req, res) {
    // los parametros
    var carro      = req.body.carro;
    var modalidad  = req.body.modalidad;
    var tipodoc    = req.body.tipodoc || 'PRE' ;   /* PRE, NVV, COV */
    var xObs       = req.body.cObs    || '' ; 
    var xOcc       = req.body.cOcc    || '' ;      // incorporada 27/07/2018, se modifica ktp_encabezado -> occ varchar(40)
    var xFechaDesp = req.body.fechaDespacho || ''; // incorporrado el 30/110/2018
    //
    var error;
    var xhoy  = new Date();
    var hora  = xhoy.getTime();    
    //
    var htmlBody = '';
    var mailList = [];
    var xDatosVendedor = '', 
        xDatosCliente  = '',
        monto          = 0,
        neto           = 0,
        iva            = 0,
        bruto          = 0,
        NoB            = carro[0].metodolista;

    var carroConCompras = [], nrocon, ok_con = 0;
    var carroSinCompras = [], nrosin, ok_sin = 0;
    // 
    _elmail.delVendedorMas( sql, carro[0].vendedor ).then( data => { xDatosVendedor = data; } );
    _elmail.delClienteMas( sql, carro[0].cliente, carro[0].suc_cliente ).then( data => { xDatosCliente = data; } );
    // 
    _Activity.registra( sql, carro[0].vendedor, 'grabadocumentos', tipodoc );
    //
    carroConCompras = carro;
    //
    async.series([
        function(callback) {
            // carroConCompras
            if ( carroConCompras.length > 0 ) {
                //
                query = _funciones.generaQuery( carroConCompras, modalidad, hora, tipodoc, xObs, xOcc, xFechaDesp );
                //console.log("generaQuery( CON ) "+query ); 
                //
                conex
                .then( function() {
                    //
                    var lineas = '';
                    var request = new sql.Request();
                    // 
                    request.query( query )
                        .then(  function(rs) {  
                            console.log("documento ("+tipodoc+") grabado ",rs.recordset); 
                            nrocon = rs.recordset[0].numero;
                            ok_con = 1;
                            //if (carroSinCompras.length == 0) { res.json( { resultado: 'ok', numero: rs.recordset[0].numero } ); };
                            _correos.componeBody( sql, rs.recordset[0].id )
                                .then( data  => {   
                                    data.recordset.forEach(element => {
                                        lineas += '<tr>';
                                        lineas += '<td align="center">'+element.cantidad.toString()+'</td>';
                                        lineas += '<td align="center">'+element.codigo+'</td>';
                                        lineas += '<td align="center">'+element.descripcion+'</td>';
                                        lineas += '<td align="center">'+element.preciounit.toLocaleString()+'</td>';
                                        lineas += '<td align="center">'+element.descuentos.toString()+'</td>';
                                        lineas += '<td align="center">'+element.subtotal.toLocaleString()+'</td>';
                                        lineas += '</tr>';
                                        monto  += element.subtotal;
                                        if ( ++i == data.recordset.length ) {
                                            if ( NoB == 'N' ) {
                                                neto = monto ; iva = Math.round(monto*0.19) ; bruto = neto + iva;
                                            } else {
                                                bruto = monto ; neto = Math.round(monto/(1+19)) ; iva = bruto - neto;
                                            }
                                            lineas += '<tr>';
                                            lineas += '<td colspan="5" align="right"><strong>TOTAL NETO :</strong></td>';
                                            lineas += '<td align="center">'+neto.toLocaleString()+'</td>';
                                            lineas += '</tr>';
                                            lineas += '<tr>';
                                            lineas += '<td colspan="5" align="right"><strong>IVA :</strong></td>';
                                            lineas += '<td align="center">'+iva.toLocaleString()+'</td>';
                                            lineas += '</tr>';
                                            lineas += '<tr>';
                                            lineas += '<td colspan="5" align="right"><strong>TOTAL BRUTO :</strong></td>';
                                            lineas += '<td align="center">'+bruto.toLocaleString()+'</td>';
                                            lineas += '</tr>';
                                            //            
                                        }
                                    });
                                    htmlBody = _correos.primeraParte( xObs, rs.recordset[0].numero, xOcc, xDatosVendedor, xDatosCliente ) + lineas + _correos.segundaParte();
                                    mailList.push( { cc: xDatosVendedor.correo, to: xDatosCliente.correo } ); 
                                    _correos.enviarCorreo( res, nodemailer, mailList, htmlBody );  
                                });
                            callback();
                            })
                        .catch( function(er) { 
                            console.log('error al grabar',er); 
                            error = er;
                            //res.send(er); 
                            callback();
                        });
                })
                .catch( function(er) { 
                    console.log( er );
                    error = er;
                    //res.send('error en conexion POST ->'+er); 
                    callback();
                });
            } else {
                callback();
            }
        },
        function(callback) {
            if ( error == undefined ) {
                console.log("fin y devolviendo");
                if ( nrosin == undefined )      { res.json( { resultado: 'ok', numero: nrocon } );                callback(); }
                else if ( nrocon == undefined ) { res.json( { resultado: 'ok', numero: nrosin } );                callback(); }
                else                            { res.json( { resultado: 'ok', numero: nrocon +' y '+nrosin } );  callback(); } 
            } else {
                console.log("error e informando", error );
                res.send('error en grabacion: '+error); callback();
            }
        }
    ]);
});

app.post('/proalma', 
function (req, res) {
    //
    // console.log(req.body);;
    // la tabla a leer
    var xsp      = req.body.sp      || ''   ;
    var xdatos   = req.body.datos   || {}   ;
    var xusuario = req.body.user    || []   ;
    var listap   = '';
    var query    = '';
    var solorec  = false ;
    //
    var fechaHoy = new Date();
    console.log(fechaHoy);
    console.log( xusuario.codigo, xusuario.nombre, 'xsp -->>', xsp );       
    //
    if        ( xsp == 'ksp_buscarClientes' )     { 
        //
        if ( xdatos.codcliente  == undefined  ) { xdatos.codcliente  = '';  } else { xdatos.codcliente  = xdatos.codcliente.trim();   }
        if ( xdatos.razonsocial == undefined  ) { xdatos.razonsocial = '';  } else { xdatos.razonsocial = xdatos.razonsocial.trim();  }
        if ( xdatos.inilista    == undefined  ) { xdatos.inilista    = '';  } else { xdatos.inilista    = xdatos.inilista.trim();     }
        if ( xdatos.finlista    == undefined  ) { xdatos.finlista    = '';  } else { xdatos.finlista    = xdatos.finlista.trim();     }
        //
        query = "exec "+ xsp +" '"+xdatos.codcliente+"','"+xdatos.razonsocial+"','"+xusuario.codigo+"','"+xdatos.inilista+"','"+xdatos.finlista+"', 'b' ;"; 
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.codcliente, xdatos.razonsocial );        
        solorec = true ;
        //
    } else if ( xsp == 'ksp_buscarProductos_v2_caltex' ) {
        //
        if ( xdatos.codproducto == undefined  ) { xdatos.codproducto = ''; } else { xdatos.codproducto = xdatos.codproducto.trim(); }
		if ( xdatos.descripcion == undefined  ) { xdatos.descripcion = ''; } else { xdatos.descripcion = xdatos.descripcion.trim(); }
		// datos de seleccion
        if ( xdatos.superfamilias == undefined  ) xdatos.superfamilias = '';
        if ( xdatos.familias      == undefined  ) xdatos.familias      = '';
        if ( xdatos.rubros        == undefined  ) xdatos.rubros        = '';
		if ( xdatos.marcas        == undefined  ) xdatos.marcas        = '';
		// datos de configuracion
        if ( xdatos.filtros.soloconstock  == undefined  ) { xdatos.soloconstock  = 'false'; } else { xdatos.soloconstock  = xdatos.filtros.soloconstock; }
        if ( xdatos.filtros.soloconprecio == undefined  ) { xdatos.soloconprecio = 'false'; } else { xdatos.soloconprecio = xdatos.filtros.soloconprecio;} 
		if ( xdatos.filtros.soloconocc    == undefined  ) { xdatos.soloconocc    = 'false'; } else { xdatos.soloconocc    = xdatos.filtros.soloconocc; 	} 
		// ordenar por ...
		if ( xdatos.ordenar == undefined      ) { xdatos.ordenar = ''; }     else { xdatos.ordenar     = xdatos.ordenar.trim();     }
        // lista de precios a trabajar
        if ( xdatos.usuario.LISTACLIENTE != '' && xdatos.usuario.LISTACLIENTE != xdatos.usuario.LISTAMODALIDAD ) { 
			listap = xdatos.usuario.LISTACLIENTE; 
		} else { 
			listap = xdatos.usuario.LISTAMODALIDAD; 
		}
        //
        query  = "exec "+ xsp +" '"+xdatos.codproducto+"','"+xdatos.descripcion+"','";
        query += 					xdatos.bodega+"','"+listap+"','";
        query += 					xdatos.superfamilias+"','"+xdatos.familias+"','"+xdatos.rubros+"','"+xdatos.marcas+"','";
        query += 					xdatos.ordenar+"',"+xdatos.offset+",";
		query += 					xdatos.soloconstock+","+xdatos.soloconprecio+","+xdatos.soloconocc+",'"; 
        query += 					xusuario.empresa+"','"+xusuario.codigo+"','"+xdatos.cliente+"' ;"; 
        //
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.codproducto, xdatos.descripcion, xdatos.bodega );        
        solorec = true ;
        //
		
    } else if ( xsp == 'ksp_buscarUsuario' ) {
        //
        if ( xdatos.rutocorreo  == undefined  ) { xdatos.rutocorreo = ''; } else { xdatos.rutocorreo = xdatos.rutocorreo.trim();  }
        if ( xdatos.clave       == undefined  ) { xdatos.clave      = ''; } else { xdatos.clave      = xdatos.clave.trim();       }
        if ( xdatos.empresa     == undefined  ) { xdatos.empresa    = ''; } else { xdatos.empresa    = xdatos.empresa.trim();     }
        //
        query = "exec "+ xsp +" '"+xdatos.rutocorreo+"','"+xdatos.clave+"','"+xdatos.empresa+"' ;"; 
        _Activity.registra( sql, xdatos.uuid, xdatos.sistema, xdatos.rutocorreo, xdatos.clave, xdatos.empresa );        
        //
    } else if ( xsp == 'ksp_traeInfoProductos' ) {
        //
        if ( xdatos.codigo  == undefined  ) { xdatos.codigo     = ''; } else { xdatos.codigo     = xdatos.codigo.trim();  }
        if ( xdatos.cliente == undefined  ) { xdatos.cliente    = ''; } else { xdatos.cliente    = xdatos.cliente.trim(); }
        if ( xdatos.sucursal== undefined  ) { xdatos.sucursal   = ''; } else { xdatos.sucursal   = xdatos.sucursal.trim();}
        if ( xdatos.empresa == undefined  ) { xdatos.empresa    = ''; } else { xdatos.empresa    = xdatos.empresa.trim(); }
        if ( xdatos.tipocon == undefined  ) { xdatos.tipocon    = ''; } else { xdatos.tipocon    = xdatos.tipocon.trim(); }
        //
        query = "exec "+ xsp +" '"+xdatos.codigo+"','"+xdatos.tipocon+"','"+xdatos.cliente+"','"+xdatos.sucursal+"','"+xusuario.codigo+"','"+xdatos.empresa+"' ;"; 
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.codigo, xdatos.tipocon, xdatos.cliente );        
        //
    } else if ( xsp == 'ksp_BodegaProducto' ||  xsp == 'ksp_ListasProducto'  ) { 
        //
        if ( xdatos.codproducto == undefined  ) { xdatos.codproducto    = ''; } else { xdatos.codproducto    = xdatos.codproducto.trim();     }
        if ( xdatos.usuario     == undefined  ) { xdatos.usuario.KOFU   = ''; } else { xdatos.usuario.KOFU   = xdatos.usuario.KOFU.trim();    }
        if ( xdatos.empresa     == undefined  ) { xdatos.empresa        = ''; } else { xdatos.empresa        = xdatos.empresa.trim();         }
        //
        query = "exec "+ xsp +" '"+xdatos.codproducto+"','"+xdatos.usuario.KOFU+"','"+xdatos.empresa+"' ;"; 
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.codproducto, xdatos.usuario.KOFU, xdatos.empresa );        
        //
    } else if ( xsp == 'ksp_traeImpagos' ) {
        //
        if ( xdatos.codigo  == undefined  ) { xdatos.codigo = ''; } else { xdatos.codigo = xdatos.codigo.trim();  }
        if ( xdatos.empresa == undefined  ) { xdatos.empresa= ''; } else { xdatos.empresa= xdatos.empresa.trim(); }
        //
        query = "exec "+ xsp +" '"+xdatos.codigo+"','"+xdatos.empresa+"' ;"; 
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.codigo, xdatos.empresa );        
        //
    } else if ( xsp == 'ksp_traeDocumento' ) {
        //
        query = "exec "+ xsp +" "+xdatos.id.toString()+" ;"; 
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.id.toString() );

        //
    } else if ( xsp == 'ksp_BodegaMias' ) {
        //
        if ( xdatos.empresa  == undefined  ) { xdatos.empresa  = ''; } else { xdatos.empresa  = xdatos.empresa.trim();  }
        if ( xusuario.codigo == undefined  ) { xusuario.codigo = ''; } else { xusuario.codigo = xusuario.codigo.trim(); }
        //
        query = "exec "+ xsp +" '"+xusuario.codigo+"','"+xdatos.empresa+"' ;";
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.empresa );
        // 
    } else if ( xsp == 'ksp_ListasMias' ) {
        //
        if ( xdatos.empresa  == undefined  ) { xdatos.empresa  = ''; } else { xdatos.empresa  = xdatos.empresa.trim();  }
        if ( xusuario.codigo == undefined  ) { xusuario.codigo = ''; } else { xusuario.codigo = xusuario.codigo.trim(); }
        //
        query = "exec "+ xsp +" '"+xusuario.codigo+"','"+xdatos.empresa+"' ;"; 
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.empresa );
        //
    } else if ( xsp == 'ksp_EnImportaciones' ) {
        //
        if ( xdatos.codproducto == undefined  ) { xdatos.codproducto = ''; } else { xdatos.codproducto = xdatos.codproducto.trim(); }
        if ( xdatos.empresa     == undefined  ) { xdatos.empresa     = ''; } else { xdatos.empresa     = xdatos.empresa.trim();     }
        //
        query = "exec "+ xsp +" '"+xdatos.codproducto+"','"+xdatos.empresa+"' ;"; 
        _Activity.registra( sql, xusuario.codigo, xsp, xdatos.empresa );
        //
    }

    conex
    .then( function() {
        //
        console.log( query );
        var request = new sql.Request();
        // 
        request.query( query )
            .then(  function(rs) { 
                if( solorec ) {  res.json( rs.recordset ); }
                else          {  res.json( rs );           } 
            })
            .catch( function(er) { res.send(er); });
    })
    .catch( function(er) { 
        console.log( er );
        res.send('error en conexion POST ->'+er); 
    });

});

// activado: 31/07/2019
app.post('/ktp_stock_excel', 
function (req, res) {
    //  
    ++uuid;
    var prefix   = '';
    var fechaHoy = new Date();
    var fechaYMD = fechaHoy.getFullYear().toString()+'-'+(fechaHoy.getMonth()+1).toString()+'-'+fechaHoy.getDate().toString()
    //
    // console.log(fechaHoy);
    //
    query = "exec ksp_stockprod_caltex ";
    //
    var datos = req.body.datos;
    //
    if ( datos.empresa       === undefined  ) { datos.empresa       = ''; } else { datos.empresa     = datos.empresa.trim();     }
    if ( datos.codproducto   === undefined  ) { datos.codproducto   = ''; } else { datos.codproducto = datos.codproducto.trim(); }
	if ( datos.descripcion   === undefined  ) { datos.descripcion   = ''; } else { datos.descripcion = datos.descripcion.trim(); }
    if ( datos.superfamilias === undefined  )   datos.superfamilias = '';
    if ( datos.rubros        === undefined  )   datos.rubros        = '';
    if ( datos.marcas        === undefined  )   datos.marcas        = '';
    if ( datos.soloconstock  === undefined  ) { datos.soloconstock  = 'no'; }
    if ( datos.soloconprecio === undefined  ) { datos.soloconprecio = 'no'; }
    if ( datos.soloconocc    === undefined  ) { datos.soloconocc    = 'no'; }
    if ( datos.ordenar       === undefined  ) { datos.ordenar       = ''; } 
    // lista de correos 
    mailList = { emailTo: datos.emailTo, emailCc: datos.emailCc, nombreCli: datos.nombreCli };
    //
    query += "'";
    query += datos.empresa+"','"+datos.codproducto+"','"+datos.descripcion+"','"+datos.superfamilias+"','"+datos.rubros+"','"+datos.marcas+"','";
    query += datos.ordenar+"',"+datos.offset+",'";
	query += datos.soloconstock+"','"+datos.soloconprecio+"','"+datos.soloconocc+"','"+datos.usuario+"','XLS' ; "; 
    //
    console.log('desde stock 2 excel ->',query);
    //
    var request = new sql.Request();
    request.query( query )
    .then( function(results) { 
        var listas = results.recordset; 
        var imagenes = [];
        // imagenes únicas 
        listas.forEach( element => {
            if ( !imagenes.includes( element.codigoimagen ) ) {
                imagenes.push( element.codigoimagen );
            }
        });
        //
        // prefix = ( ++uuid ).toString()+'_';
        prefix = '';
        //
        createExcelFile( prefix, listas, imagenes, fechaYMD, generateUUID() )
                .then( fn => enviarCorreo( res, mailList, fn ) ) 
                .catch( e => console.log( e ) );
    })
    .catch( function( error ) { 
                    console.log('error en la consulta',error); 
    }) ;

});

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

enviarCorreo = function( res, mailList, filename ) {
    //
    xhoy = new Date();
    anno = xhoy.getFullYear().toString();    
    mes  = (xhoy.getMonth()+1).toString();    
    dia  = xhoy.getDate().toString();

    // sender = 'grupocaltex.kinetik@gmail.com';
    // psswrd = 'traqueral419';
    sender = 'jogv66@gmail.com';
    psswrd = 'murielybelen';    
    //
    cTo = mailList.emailTo;
    cCc = mailList.emailCc;
    cSu = 'Planillas de Stock al '+dia+'-'+mes+'-'+anno;
    // si no tiene correo se envia al vendedor
    if ( cTo === '' || cTo == undefined ) { 
        cTo = cCc; 
    }
    // datos del enviador
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: sender,
            pass: psswrd
        }
    });
    // opciones del correo
    var mailOptions = {
        from:       { name: "GrupoCaltex 👻", address: sender },
        to:         cTo,
        cc:         cCc,
        subject:    cSu,
        text:       "Adjunto Planilla de Stock al "+dia+"-"+mes+"-"+anno , // plain text body
        attachments:[{ filename: 'stock_al_'+anno+mes+dia+'.xlsx',
                       path:     filename /*,
                       content:  'application/octet-stream' */ }]
    };
    console.log( filename );

    // enviar el correo
    transporter.sendMail( mailOptions, function( error, info ){
        if ( error ) {
            console.log('error en sendmail->',error);
            // res.status( 500 ).send( error.message );
            res.json({ resultado: 'error', mensaje: error.message });
        } else {
            console.log("Email enviado a -> ", cTo, "Adjuntos : ", filename );
            // res.status(200).send(req.body);
            res.json({ resultado: 'ok' });
        }
    }); 
};

writeExcelFile = (filename, workbook ) => {
    console.log('Creating Excel file: ', filename);
    return workbook.xlsx.writeFile(filename);
};

createExcelFile = ( prefix, lista, imagenes, fechaYMD, id_unico ) => {

    console.log('creando planilla con %s imagenes', imagenes.length );

    // return new Promise( (resolve) => {
	// No es necesario crear una promesa (ver el return de mas abajo)
        var  workbook = new Excel.Workbook();
        workbook.creator        = 'kinetik.cl';
        workbook.lastModifiedBy = 'kinetik.cl';
        workbook.created        = new Date();
        workbook.modified       = new Date();
        
        var  worksheet = workbook.addWorksheet(`Stock al ${ fechaYMD }`,
        { 
            pageSetup: { paperSize: undefined, orientation: 'portrait', fitToPage: true } 
        });
        // titulos
        var  bgImg = workbook.addImage({
            buffer: fs.readFileSync(path.join( CARPETA_IMGS, `${prefix}banner_new_walk.jpg` )), 
            extension: 'jpeg',
        });
        worksheet.mergeCells ( 'A1:J7' );
        worksheet.addImage(bgImg, 'D1:G7');
        
        worksheet.getCell('A4').values  = new Date();
        worksheet.getColumn('D').width = 15.14  ;
        worksheet.getColumn('E').width = 17.3   ;
        worksheet.getColumn('F').width = 52     ;
        worksheet.getColumn('G').width = 10     ; worksheet.getColumn('G').numFmt = '"$"#,##0;[Red]\-"$"#,##0';
        worksheet.getColumn('H').width = 8.43   ;
        worksheet.getColumn('I').width = 27     ;
        worksheet.getColumn('J').width = 12.57  ;
        
        worksheet.mergeCells('A8:C8');
        worksheet.getRow(08).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('A08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('A08').value = "";
        worksheet.getCell('B08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('B08').value = "Imágen"; 
        worksheet.getCell('C08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('C08').value = "";
        worksheet.getCell('D08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('D08').value = "Código Interno";   
        worksheet.getCell('E08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('E08').value = "Código Técnico";   
        worksheet.getCell('F08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('F08').value = "Descripción";
        worksheet.getCell('G08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('G08').value = "Neto Unit."; 
        worksheet.getCell('H08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('H08').value = "Curva"; 
        worksheet.getCell('I08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('I08').value = "Distribución (mensaje3)"; 
        worksheet.getCell('J08').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } }; worksheet.getCell('J08').value = "Saldo Tareas"; 
        
        var  cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J'];
        cols.forEach(col => {
            worksheet.getCell( `${col}08`).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin' } };
        });
        worksheet.getCell( `A07`).border = { top: {style:'thin'}, left: {style:'thin'} };
        worksheet.getCell( `G07`).border = { top: {style:'thin'}, right: {style:'thin'} };
        
        // fila de inicio
        let rowIdx = 9;
        // =============
        imagenes.forEach( imagen => {
            
            var  mismos = lista.filter( item => item.codigoimagen === imagen );
            // console.log( imagen, mismos );

            let prodImg;
            let imgPath;
            
            try {
                imgPath = path.join( CARPETA_IMGS, `${ prefix + imagen }.jpg` );
                // console.log(imgPath);
                prodImg = workbook.addImage({
                    buffer: fs.readFileSync(imgPath),
                    extension: 'jpg',
                });
            } catch (err) {
                // console.error('File not found (?)', err.Error);
                prodImg = workbook.addImage({
                    buffer: fs.readFileSync(path.join( CARPETA_IMGS, `${ prefix }no_img.jpg`)),
                    extension: 'jpg',
                });
            }

            let filainterna = rowIdx + 2;
            mismos.forEach( prod => {                
                var  rowValues = [ null, null, null, prod.codigo, prod.codigotec, prod.descripcion, prod.precio, prod.rtu.toString()+' PRS', prod.distribucion, prod.saldo_ud1 ];
                worksheet.getRow(filainterna).values = rowValues;
                worksheet.getRow(rowIdx).alignment = { vertical: 'top' };

                cols.forEach(c => {
                    worksheet.getCell(`${c}${filainterna}`).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                });

                ++filainterna;
            });

            // imagen
            worksheet.mergeCells ( `A${rowIdx}:C${rowIdx+8}` );
            worksheet.getCell(     `A${rowIdx}:C${rowIdx+8}` ).alignment = { vertical: 'middle', horizontal: "center" };
            worksheet.getCell(     `A${rowIdx}:C${rowIdx+8}` ).border    = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            worksheet.addImage(prodImg, `A${rowIdx}:C${rowIdx+8}` );

            // siguiente imagen
            rowIdx = rowIdx + 9;
        });
        // Write file
        var  filename = path.join( CARPETA_XLSX, `Stock_${fechaYMD}_${id_unico}.xlsx`);
        return writeExcelFile(filename, workbook);
	// writeExcelFile ya es una promesa (revisa igual pq  el nombre del archivo no se donde se estaria devolviendo)
        //
        // resolve( filename );
	// No es necesario el resolve ya que ya tenemos una promesa en la funcion writeExcelFIle
	// Ojo para el futuro que aqui estabas resolviendo directamente sobre el nombre del archivo
	// y no necesariamente sobre el aarchivo ya creado (con contenido)
    // }); // Cierre bloque de promesa (ya no se usa)
};

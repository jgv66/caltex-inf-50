// console.log("hola mundo");
let express = require('express');
let app = express();
// tto asincrono para grabaciones
let async = require("async");
// configuracion
let _dbconex = require('./conexion_mssql.js');
let _configuracion = require('./configuracion_cliente.js');
let _correos = require('./k_sendmail.js');
let _elmail = require('./k_traemail.js');
let _lasEmpresas = require('./k_empresas.js');
let _funciones = require('./k_funciones.js');
let _Activity = require('./k_regactiv.js');
// exportar a excel
let fs = require('fs');
let excel_tto = require('./k_excel_gen');
let request = require('request');
let path = require('path');
//
let Excel = require('exceljs');
let fileExist = require('file-exists');
//
var uuid = 0;
//
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        // res.send(204);
        res.sendStatus(204)
    } else {
        next();
    }
});
//
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//
app.set('port', 8125);
var server = app.listen(8125, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Escuchando http-server en el puerto: %s", port);
});

// carpeta de imagenes: desde donde se levanta el servidor es esta ruta -> /root/trial-server-001/public
app.use(express.static('./public'));

publicpath = path.resolve(__dirname, 'public');
CARPETA_IMGS = publicpath + '/images/';
CARPETA_XLSX = publicpath + '/xlsx/';

// dejare el server myssql siempre activo
var sql = require('mssql');
var conex = sql.connect(_dbconex);

//---------------------- pruebas
app.get('/ping',
    (req, res) => {
        //
        console.log('PONG');
        res.json({ resultado: "ok", datos: 'hola mundo' });
        //
    });

app.post('/seteocliente',
    function(req, res) {
        res.json({ configp: _configuracion });
    });

app.post('/ktp_empresas',
    function(req, res) {
        //
        _lasEmpresas.configp(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', empresas: data });
            });
    });
app.get('/ktp_empresas_get',
    function(req, res) {
        //
        _lasEmpresas.configp(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', empresas: data });
            });
    });
app.post('/ktp_rubros',
    function(req, res) {
        //
        _lasEmpresas.rubros(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', rubros: data });
            });
    });
app.get('/ktp_rubros_get',
    function(req, res) {
        //
        _lasEmpresas.rubros(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', rubros: data });
            });
    });
app.post('/ktp_marcas',
    function(req, res) {
        //
        _lasEmpresas.marcas(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', marcas: data });
            });
    });
app.get('/ktp_marcas_get',
    function(req, res) {
        //
        _lasEmpresas.marcas(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', marcas: data });
            });
    });
app.post('/ktp_superfamilias',
    function(req, res) {
        //
        _lasEmpresas.superfamilias(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', superfamilias: data });
            });
    });
app.get('/ktp_superfam_get',
    function(req, res) {
        //
        _lasEmpresas.superfamilias(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', superfamilias: data });
            });
    });
app.post('/ktp_familias',
    function(req, res) {
        //
        _lasEmpresas.familias(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', familias: data });
            });
    });
app.get('/ktp_familias_get',
    function(req, res) {
        //
        _lasEmpresas.familias(sql)
            .then(function(data) {
                res.json({ resultado: 'ok', familias: data });
            });
    });
app.post('/ktp_variables',
    function(req, res) {
        //
        _lasEmpresas.variables(sql, req.body.cliente)
            .then(function(data) {
                //console.log("variables para "+req.body.cliente, data ); 
                res.json({ resultado: 'ok', variables: data });
            });
    });
// http://server:port/ktp_variables/:usr/:dato1/:dato2....
app.get('ktp_variables_get/:cliente',
    function(req, res) {
        _lasEmpresas.variables(sql, req.params.cliente)
            .then(function(data) {
                res.json({ resultado: 'ok', variables: data });
            });
    });
//agregado 12/01/2019
// se pasa parametro de empresa 11/03/2019
app.post('/ktp_stock',
    function(req, res) {
        _funciones.stock(sql, req.body)
            .then(function(rs) {
                res.json({ resultado: 'ok', data: rs });
            });
    });

app.get('/ktp_newid',
    function(req, res) {
        _funciones.newid(sql)
            .then(function(data) {
                //console.log("variables para "+req.body.cliente, data ); 
                res.json({ resultado: 'ok', newid: data });
            });
    });

app.post('/ktp_prod',
    function(req, res) {
        _funciones.producto(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });

app.post('/ktp_prodOCC',
    function(req, res) {
        _funciones.productoconOCC(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });

app.post('/ktp_buscarProductos',
    function(req, res) {
        _funciones.listaProductos(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });

app.post('/ktp_buscarClientes',
    function(req, res) {
        _funciones.listaClientes(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });

app.post('/ktp_nvvPendientes',
    function(req, res) {
        _funciones.NVVPendientes(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });
app.post('/ktp_detallepend',
    function(req, res) {
        _funciones.DetalleNVVPendiente(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });

app.post('/ktp_traeImpagos',
    function(req, res) {
        _funciones.impagos(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });

app.post('/ktp_geo',
    function(req, res) {
        console.log(req.body);
        _funciones.geo(sql, req.body)
            .then(function(rs) { res.json({ resultado: 'ok', data: rs }); });
    });

app.post('/ktp_resumenImpagos',
    function(req, res) {
        _funciones.resumenImpagos(sql, req.body)
            .then(function(rs) {
                res.json({ resultado: 'ok', data: rs });
            });
    });

app.post('/ktp_detalleImpagos',
    function(req, res) {
        _funciones.detalleImpagos(sql, req.body)
            .then(function(rs) {
                res.json({ resultado: 'ok', data: rs });
            });
    });

//agregado 12/01/2019
app.post('/ktp_traeDocumento',
    function(req, res) {
        _funciones.traeDocumento(sql, req.body)
            .then(function(rs) {
                res.json({ resultado: 'ok', data: rs });
            });
    });

app.post('/encorr2',
    async(req, res) => {
        //
        const carro = req.body.itemes || [];
        const xTo = req.body.cTo || '';
        const xCc = req.body.cCc || '';
        const xEmailVend = req.body.emailvend || '';
        const xnombre = req.body.nombre || '';
        const empresa = req.body.empresa || '';
        const xnombrecli = req.body.cNombreCli || '(no indicado)';
        const xemailobs = req.body.cEmailObs || '';
        //
        var lineas = '';
        var htmlBody = '';
        let respuestaCorreo = false;
        //
        const mailList = { cc: xEmailVend + (xCc === '' ? '' : ',' + xCc), to: xTo };
        //
        const xhoy = new Date();
        const anno = xhoy.getFullYear();
        const mes = xhoy.getMonth() + 1;
        const dia = xhoy.getDate();
        const rnd = (Math.random() * (100 - 1) + 1).toString();
        //
        var cfile = 'cotiz' + anno.toString() + mes.toString() + dia.toString() + rnd.replace(".", "") + '.csv';
        var pathfile = __dirname + '/public';
        //
        var header = '';
        var rows = '';
        var xpre = '';
        var xcan = 0;
        var xuni = '';
        // si es la textil los datos on otros 
        if (empresa === '04') {
            header += "Codigo Interno" + ";";
            header += "Cod.Tecnico" + ";";
            header += "Descripcion" + ";";
            header += "Precio x Mt." + ";";
            header += "Cantidad" + ";";
            header += "Unidad" + ";";
            //
            carro.forEach(function(element) {
                // excel
                xpre = element.precioxmetro.toLocaleString();
                xcan = (element.metros > 0) ? element.metros.toLocaleString() : element.rollos.toLocaleString();
                xuni = (element.metros > 0) ? 'MT' : 'ROLLO';
                //
                lineas += '<tr>';
                // lineas += '<td align="center"><img src="http://www.grupocaltex.cl/imagenes/fotos18/'+element.codigoimagen+'.jpg" width="150px" height="150px"/></td>';
                lineas += '<td align="center">' + element.codigo + '</td>';
                lineas += '<td align="center">' + element.codigotec + '</td>';
                lineas += '<td align="center">' + element.descrip + '</td>';
                lineas += '<td align="center">' + xpre + '</td>';
                lineas += '<td align="center">' + xcan + '</td>';
                lineas += '<td align="center">' + xuni + '</td>';
                lineas += '</tr>';
                //
                rows += '"' + element.codigo + '"' + ";";
                rows += '"' + element.codigotec + '"' + ";";
                rows += '"' + element.descrip + '"' + ";";
                rows += xpre.replace(',', '') + ";";
                rows += xcan.replace(',', '') + ";";
                rows += '"' + xuni + '"' + ";";
                //
            });
            // todas las demas empresas
        } else {
            header += "Codigo Interno" + ";";
            header += "Cod.Tecnico" + ";";
            header += "Descripcion" + ";";
            header += "Precio" + ";";
            header += "Curva" + ";";
            header += "Imagen (150 x 150 )\n;";
            //
            carro.forEach(function(element) {
                lineas += '<tr>';
                // lineas += '<td></td>';
                lineas += '<td align="center"><img src="http://www.grupocaltex.cl/imagenes/fotos18/' + element.codigoimagen + '.jpg" width="150px" height="150px"/></td>';
                lineas += '<td align="center">' + element.codigo + '</td>';
                lineas += '<td align="center">' + element.codigotec + '</td>';
                lineas += '<td align="center">' + element.descrip + '</td>';
                lineas += '<td align="center">' + element.precio.toLocaleString() + '</td>';
                lineas += '<td align="center">' + element.rtu.toString() + '</td>';
                lineas += '</tr>';
                // excel
                xpre = element.precio.toLocaleString();
                //
                rows += '"' + element.codigo + '"' + ";";
                rows += '"' + element.codigotec + '"' + ";";
                rows += '"' + element.descrip + '"' + ";";
                rows += xpre.replace(',', '') + ";";
                rows += element.rtu.toString() + ";";
                rows += '"http://www.grupocaltex.cl/imagenes/fotos18/' + element.codigoimagen + '.jpg"' + "\n";
                //
            });
        }
        //
        fs.writeFileSync(pathfile + '/' + cfile, header + rows);
        var xxxx = fs.readFileSync(pathfile + '/' + cfile);
        data_txt = new Buffer(xxxx).toString();
        // 
        htmlBody = _correos.cotizcuerpo(xnombre, xnombrecli, empresa, xemailobs) + lineas + _correos.cotizfin();
        // 
        await _correos.enCo2(res, mailList, htmlBody, cfile, pathfile, empresa);
        //
    });

// agregado el 23/05/2018
app.post('/grabadocumentos',
    async(req, res) => {
        // los parametros
        let carro = req.body.carro;
        let modalidad = req.body.modalidad;
        let tipodoc = req.body.tipodoc || 'PRE'; /* PRE, NVV, COV */
        let xObs = req.body.cObs || '';
        let xOcc = req.body.cOcc || ''; // incorporada 27/07/2018, se modifica ktp_encabezado -> occ varchar(40)
        let xFechaDesp = req.body.fechaDespacho || ''; // incorporrado el 30/110/2018
        const empresa = req.body.empresa;
        //
        let error;
        let xhoy = new Date();
        let hora = xhoy.getTime();
        //
        let htmlBody = '';
        let mailList;
        let respuestaCorreo = false;
        let xDatosVendedor = '',
            xDatosCliente = '',
            monto = 0,
            neto = 0,
            iva = 0,
            i = 0,
            bruto = 0,
            NoB = carro[0].metodolista;

        let carroConCompras = [],
            nrocon, nrosin;
        // 
        _elmail.delVendedorMas(sql, carro[0].vendedor).then(data => { xDatosVendedor = data; });
        _elmail.delClienteMas(sql, carro[0].cliente, carro[0].suc_cliente).then(data => { xDatosCliente = data; });
        // 
        _Activity.registra(sql, carro[0].vendedor, 'grabadocumentos', tipodoc);
        //
        carroConCompras = carro;
        //
        async.series([
            function(callback) {
                // carroConCompras
                if (carroConCompras.length > 0) {
                    //
                    query = _funciones.generaQuery(carroConCompras, modalidad, hora, tipodoc, xObs, xOcc, xFechaDesp);
                    console.log("generaQuery( CON ) " + query);
                    //
                    conex
                        .then(function() {
                            //
                            var lineas = '';
                            var request = new sql.Request();
                            // 
                            request.query(query)
                                .then(function(rs) {
                                    console.log("documento (" + tipodoc + ") grabado ", rs.recordset);
                                    nrocon = rs.recordset[0].numero;
                                    ok_con = 1;
                                    //if (carroSinCompras.length == 0) { res.json( { resultado: 'ok', numero: rs.recordset[0].numero } ); };
                                    _correos.componeBody(sql, rs.recordset[0].id)
                                        .then(async(data) => {
                                            console.log(data);
                                            data.recordset.forEach(element => {
                                                lineas += '<tr>';
                                                // lineas += '<td></td>';
                                                lineas += '<td align="center"><img src="http://www.grupocaltex.cl/imagenes/fotos18/' + element.codigoimagen + '.jpg" width="150px" height="150px"/></td>';
                                                lineas += '<td align="center">' + element.cantidad.toString() + '</td>';
                                                lineas += '<td align="center">' + element.codigo + '</td>';
                                                lineas += '<td align="center">' + element.descripcion + '</td>';
                                                lineas += '<td align="center">' + element.preciounit.toLocaleString() + '</td>';
                                                lineas += '<td align="center">' + element.descuentos.toString() + '</td>';
                                                lineas += '<td align="center">' + element.subtotal.toLocaleString() + '</td>';
                                                lineas += '</tr>';
                                                monto += element.subtotal;
                                                if (++i == data.recordset.length) {
                                                    if (NoB == 'N') {
                                                        neto = monto;
                                                        iva = Math.round(monto * 0.19);
                                                        bruto = neto + iva;
                                                    } else {
                                                        bruto = monto;
                                                        neto = Math.round(monto / (1 + 19));
                                                        iva = bruto - neto;
                                                    }
                                                    lineas += '<tr>';
                                                    lineas += '<td colspan="6" align="right"><strong>TOTAL NETO :</strong></td>';
                                                    lineas += '<td align="center">' + neto.toLocaleString() + '</td>';
                                                    lineas += '</tr>';
                                                    lineas += '<tr>';
                                                    lineas += '<td colspan="6" align="right"><strong>IVA :</strong></td>';
                                                    lineas += '<td align="center">' + iva.toLocaleString() + '</td>';
                                                    lineas += '</tr>';
                                                    lineas += '<tr>';
                                                    lineas += '<td colspan="6" align="right"><strong>TOTAL BRUTO :</strong></td>';
                                                    lineas += '<td align="center">' + bruto.toLocaleString() + '</td>';
                                                    lineas += '</tr>';
                                                    //            
                                                }
                                            });
                                            htmlBody = _correos.primeraParte(xObs, rs.recordset[0].numero, xOcc, xDatosVendedor, xDatosCliente) + lineas + _correos.segundaParte();
                                            mailList = { cc: xDatosVendedor.correo, to: xDatosCliente.correo };
                                            // console.log('mailList->', mailList);
                                            respuestaCorreo = await _correos.enviarCorreo(mailList, htmlBody, empresa);
                                            error = (respuestaCorreo === false ? 'Correo no se envió' : undefined);
                                        });
                                    callback();
                                })
                                .catch(function(er) {
                                    console.log('error al grabar', er);
                                    error = er;
                                    //res.send(er); 
                                    callback();
                                });
                        })
                        .catch(function(er) {
                            console.log(er);
                            error = er;
                            //res.send('error en conexion POST ->'+er); 
                            callback();
                        });
                } else {
                    callback();
                }
            },
            function(callback) {
                if (error == undefined) {
                    console.log("fin y devolviendo");
                    if (nrosin == undefined) {
                        res.json({ resultado: 'ok', numero: nrocon });
                        callback();
                    } else if (nrocon == undefined) {
                        res.json({ resultado: 'ok', numero: nrosin });
                        callback();
                    } else {
                        res.json({ resultado: 'ok', numero: nrocon + ' y ' + nrosin });
                        callback();
                    }
                } else {
                    console.log("error e informando", error);
                    res.send('error en grabacion: ' + error);
                    callback();
                }
            }
        ]);
    });

app.post('/proalma',
    function(req, res) {
        //
        // console.log(req.body);;
        // la tabla a leer
        var xsp = req.body.sp || '';
        var xdatos = req.body.datos || {};
        var xusuario = req.body.user || [];
        var listap = '';
        var query = '';
        var solorec = false;
        //
        var fechaHoy = new Date();
        console.log(fechaHoy);
        console.log(xusuario.codigo, xusuario.nombre, 'xsp -->>', xsp);
        //
        if (xsp == 'ksp_buscarClientes') {
            //
            if (xdatos.codcliente == undefined) { xdatos.codcliente = ''; } else { xdatos.codcliente = xdatos.codcliente.trim(); }
            if (xdatos.razonsocial == undefined) { xdatos.razonsocial = ''; } else { xdatos.razonsocial = xdatos.razonsocial.trim(); }
            if (xdatos.inilista == undefined) { xdatos.inilista = ''; } else { xdatos.inilista = xdatos.inilista.trim(); }
            if (xdatos.finlista == undefined) { xdatos.finlista = ''; } else { xdatos.finlista = xdatos.finlista.trim(); }
            //
            query = "exec " + xsp + " '" + xdatos.codcliente + "','" + xdatos.razonsocial + "','" + xusuario.codigo + "','" + xdatos.inilista + "','" + xdatos.finlista + "', 'b' ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.codcliente, xdatos.razonsocial);
            solorec = true;
            //
        } else if (xsp == 'ksp_buscarProductos_v2_caltex') {
            //
            if (xdatos.codproducto == undefined) { xdatos.codproducto = ''; } else { xdatos.codproducto = xdatos.codproducto.trim(); }
            if (xdatos.descripcion == undefined) { xdatos.descripcion = ''; } else { xdatos.descripcion = xdatos.descripcion.trim(); }
            // datos de seleccion
            if (xdatos.superfamilias == undefined) xdatos.superfamilias = '';
            if (xdatos.familias == undefined) xdatos.familias = '';
            if (xdatos.rubros == undefined) xdatos.rubros = '';
            if (xdatos.marcas == undefined) xdatos.marcas = '';
            // datos de configuracion
            if (xdatos.filtros.soloconstock == undefined) { xdatos.soloconstock = 'false'; } else { xdatos.soloconstock = xdatos.filtros.soloconstock; }
            if (xdatos.filtros.soloconprecio == undefined) { xdatos.soloconprecio = 'false'; } else { xdatos.soloconprecio = xdatos.filtros.soloconprecio; }
            if (xdatos.filtros.soloconocc == undefined) { xdatos.soloconocc = 'false'; } else { xdatos.soloconocc = xdatos.filtros.soloconocc; }
            // ordenar por ...
            if (xdatos.ordenar == undefined) { xdatos.ordenar = ''; } else { xdatos.ordenar = xdatos.ordenar.trim(); }
            // lista de precios a trabajar
            if (xdatos.usuario.LISTACLIENTE != '' && xdatos.usuario.LISTACLIENTE != xdatos.usuario.LISTAMODALIDAD) {
                listap = xdatos.usuario.LISTACLIENTE;
            } else {
                listap = xdatos.usuario.LISTAMODALIDAD;
            }
            //
            query = "exec " + xsp + " '" + xdatos.codproducto + "','" + xdatos.descripcion + "','";
            query += xdatos.bodega + "','" + listap + "','";
            query += xdatos.superfamilias + "','" + xdatos.familias + "','" + xdatos.rubros + "','" + xdatos.marcas + "','";
            query += xdatos.ordenar + "'," + xdatos.offset + ",";
            query += xdatos.soloconstock + "," + xdatos.soloconprecio + "," + xdatos.soloconocc + ",'";
            query += xusuario.empresa + "','" + xusuario.codigo + "','" + xdatos.cliente + "' ;";
            //
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.codproducto, xdatos.descripcion, xdatos.bodega);
            solorec = true;
            //

        } else if (xsp == 'ksp_buscarUsuario') {
            //
            if (xdatos.rutocorreo == undefined) { xdatos.rutocorreo = ''; } else { xdatos.rutocorreo = xdatos.rutocorreo.trim(); }
            if (xdatos.clave == undefined) { xdatos.clave = ''; } else { xdatos.clave = xdatos.clave.trim(); }
            if (xdatos.empresa == undefined) { xdatos.empresa = ''; } else { xdatos.empresa = xdatos.empresa.trim(); }
            //
            query = "exec " + xsp + " '" + xdatos.rutocorreo + "','" + xdatos.clave + "','" + xdatos.empresa + "' ;";
            _Activity.registra(sql, xdatos.uuid, xdatos.sistema, xdatos.rutocorreo, xdatos.clave, xdatos.empresa);
            //
        } else if (xsp == 'ksp_traeInfoProductos') {
            //
            if (xdatos.codigo == undefined) { xdatos.codigo = ''; } else { xdatos.codigo = xdatos.codigo.trim(); }
            if (xdatos.cliente == undefined) { xdatos.cliente = ''; } else { xdatos.cliente = xdatos.cliente.trim(); }
            if (xdatos.sucursal == undefined) { xdatos.sucursal = ''; } else { xdatos.sucursal = xdatos.sucursal.trim(); }
            if (xdatos.empresa == undefined) { xdatos.empresa = ''; } else { xdatos.empresa = xdatos.empresa.trim(); }
            if (xdatos.tipocon == undefined) { xdatos.tipocon = ''; } else { xdatos.tipocon = xdatos.tipocon.trim(); }
            //
            query = "exec " + xsp + " '" + xdatos.codigo + "','" + xdatos.tipocon + "','" + xdatos.cliente + "','" + xdatos.sucursal + "','" + xusuario.codigo + "','" + xdatos.empresa + "' ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.codigo, xdatos.tipocon, xdatos.cliente);
            //
        } else if (xsp == 'ksp_BodegaProducto' || xsp == 'ksp_ListasProducto') {
            //
            if (xdatos.codproducto == undefined) { xdatos.codproducto = ''; } else { xdatos.codproducto = xdatos.codproducto.trim(); }
            if (xdatos.usuario == undefined) { xdatos.usuario.KOFU = ''; } else { xdatos.usuario.KOFU = xdatos.usuario.KOFU.trim(); }
            if (xdatos.empresa == undefined) { xdatos.empresa = ''; } else { xdatos.empresa = xdatos.empresa.trim(); }
            //
            query = "exec " + xsp + " '" + xdatos.codproducto + "','" + xdatos.usuario.KOFU + "','" + xdatos.empresa + "' ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.codproducto, xdatos.usuario.KOFU, xdatos.empresa);
            //
        } else if (xsp == 'ksp_traeImpagos') {
            //
            if (xdatos.codigo == undefined) { xdatos.codigo = ''; } else { xdatos.codigo = xdatos.codigo.trim(); }
            if (xdatos.empresa == undefined) { xdatos.empresa = ''; } else { xdatos.empresa = xdatos.empresa.trim(); }
            //
            query = "exec " + xsp + " '" + xdatos.codigo + "','" + xdatos.empresa + "' ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.codigo, xdatos.empresa);
            //
        } else if (xsp == 'ksp_traeDocumento') {
            //
            query = "exec " + xsp + " " + xdatos.id.toString() + " ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.id.toString());

            //
        } else if (xsp == 'ksp_BodegaMias') {
            //
            if (xdatos.empresa == undefined) { xdatos.empresa = ''; } else { xdatos.empresa = xdatos.empresa.trim(); }
            if (xusuario.codigo == undefined) { xusuario.codigo = ''; } else { xusuario.codigo = xusuario.codigo.trim(); }
            //
            query = "exec " + xsp + " '" + xusuario.codigo + "','" + xdatos.empresa + "' ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.empresa);
            // 
        } else if (xsp == 'ksp_ListasMias') {
            //
            if (xdatos.empresa == undefined) { xdatos.empresa = ''; } else { xdatos.empresa = xdatos.empresa.trim(); }
            if (xusuario.codigo == undefined) { xusuario.codigo = ''; } else { xusuario.codigo = xusuario.codigo.trim(); }
            //
            query = "exec " + xsp + " '" + xusuario.codigo + "','" + xdatos.empresa + "' ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.empresa);
            //
        } else if (xsp == 'ksp_EnImportaciones') {
            //
            if (xdatos.codproducto == undefined) { xdatos.codproducto = ''; } else { xdatos.codproducto = xdatos.codproducto.trim(); }
            if (xdatos.empresa == undefined) { xdatos.empresa = ''; } else { xdatos.empresa = xdatos.empresa.trim(); }
            //
            query = "exec " + xsp + " '" + xdatos.codproducto + "','" + xdatos.empresa + "' ;";
            _Activity.registra(sql, xusuario.codigo, xsp, xdatos.empresa);
            //
        }

        conex
            .then(function() {
                //
                console.log(query);
                var request = new sql.Request();
                // 
                request.query(query)
                    .then(function(rs) {
                        if (solorec) { res.json(rs.recordset); } else { res.json(rs); }
                    })
                    .catch(function(er) { res.send(er); });
            })
            .catch(function(er) {
                console.log(er);
                res.send('error en conexion POST ->' + er);
            });

    });

// activado: 31/07/2019
app.post('/ktp_stock_excel',
    function(req, res) {
        //  
        ++uuid;
        var id_unico = generateUUID();
        var codigos = '';
        var prefix = '';
        var fechaHoy = new Date();
        var fechaYMD = fechaHoy.getFullYear().toString() + '-' + (fechaHoy.getMonth() + 1).toString() + '-' + fechaHoy.getDate().toString();
        //
        var datos = req.body.datos;
        var mailList = { emailTo: datos.emailTo, emailCc: datos.emailCc, nombreCli: datos.nombreCli };
        //
        console.log('%s : generando excel, usuario: %s ', fechaYMD, datos.usuario);
        // ----------------------------------------------------
        if (req.body.modo === 'lista_completa') {
            //
            query = "exec ksp_stockprod_caltex ";
            //
            if (datos.empresa === undefined) { datos.empresa = ''; } else { datos.empresa = datos.empresa.trim(); }
            if (datos.codproducto === undefined) { datos.codproducto = ''; } else { datos.codproducto = datos.codproducto.trim(); }
            if (datos.descripcion === undefined) { datos.descripcion = ''; } else { datos.descripcion = datos.descripcion.trim(); }
            if (datos.superfamilias === undefined) datos.superfamilias = '';
            if (datos.rubros === undefined) datos.rubros = '';
            if (datos.marcas === undefined) datos.marcas = '';
            if (datos.soloconstock === undefined) { datos.soloconstock = 'no'; }
            if (datos.soloconprecio === undefined) { datos.soloconprecio = 'no'; }
            if (datos.soloconocc === undefined) { datos.soloconocc = 'no'; }
            if (datos.ordenar === undefined) { datos.ordenar = ''; }
            //
            query += "'" + datos.empresa + "','" + datos.codproducto + "','" + datos.descripcion + "','" + datos.superfamilias + "','" + datos.rubros + "','" + datos.marcas + "','";
            query += datos.ordenar + "'," + datos.offset + ",'";
            query += datos.soloconstock + "','" + datos.soloconprecio + "','" + datos.soloconocc + "','" + datos.usuario + "','XLS' ; ";
            //
            console.log('desde stock 2 excel ->', query);
            // ----------------------------------------------------
        } else {
            req.body.codigos.forEach(element => {
                codigos += '"' + element.codigo + '",';
            });
            codigos = codigos.slice(0, -1);
            query = "exec ksp_stockprod_caltex_uau '" + datos.empresa + "','" + codigos + "','" + datos.ordenar + "','" + datos.usuario + "' ; ";
            //
            console.log('desde stock 2 excel_uau ->', query);
        }
        // ----------------------------------------------------
        var request = new sql.Request();
        request.query(query)
            .then(function(results) {
                var listas = results.recordset;
                var imagenes = [];
                // imagenes únicas 
                listas.forEach(element => {
                    if (!imagenes.includes(element.codigoimagen)) {
                        imagenes.push(element.codigoimagen);
                    }
                });
                //
                filename = path.join(CARPETA_XLSX, `Stock_${fechaYMD}_${id_unico}.xlsx`);
                //
                createExcelFile(prefix, listas, imagenes, filename, fechaYMD)
                    .then(async() => {
                        if (fileExist.sync(filename)) {
                            console.log('archivo existe ', filename);
                            await _correos.enviarCorreoExcel(res, mailList, filename);
                        }
                    })
                    .catch(e => console.log(e));
            })
            .catch(function(err) {
                console.log('error en la consulta', err, err.originalError);
                res.json({
                    resultado: 'error',
                    mensaje: err.RequestError
                });
            });

    });

app.post('/enviarDeuda',
    async(req, res) => {
        //
        let deuda = JSON.parse(req.body.deuda);
        let cliente = JSON.parse(req.body.cliente);
        let xTo = req.body.to || '';
        let xCc = req.body.cc || '';
        let vendedor = req.body.vendedor;
        //
        var lineas = '';
        var htmlBody = '';
        //
        _Activity.registra(sql, vendedor, 'enviarDeuda', xTo, xCc, x2);
        //
        deuda.forEach(element => {
            lineas += '<tr>';
            lineas += '<td align="center">' + element.documento + '</td>';
            lineas += '<td align="center">' + element.folio.toString() + '</td>';
            lineas += '<td align="center">' + element.emision + '</td>';
            lineas += '<td align="center">' + element.vencimiento + '</td>';
            lineas += '<td align="center">' + element.monto.toLocaleString() + '</td>';
            lineas += '<td align="center">' + element.abonos.toLocaleString() + '</td>';
            lineas += '<td align="center">' + element.saldo.toLocaleString() + '</td>';
            lineas += '</tr>';
        });
        htmlBody = _correos.deudaHeader(cliente) + lineas + _correos.deudaFooter();
        let mailList = { cc: xCc, to: xTo };
        await _correos.enviarCorreo(mailList, htmlBody, '');
        res.json({ resultado: 'ok', numero: 'Enviado' });
        //
    });

const generateUUID = () => {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

createExcelFile = (prefix, lista, imagenes, filename, fechaYMD) => {

    console.log('creando planilla con %s imagenes', imagenes.length);

    var workbook = new Excel.Workbook();
    workbook.creator = 'kinetik.cl';
    workbook.lastModifiedBy = 'kinetik.cl';
    workbook.created = new Date();
    workbook.modified = new Date();

    var worksheet = workbook.addWorksheet(`Stock al ${ fechaYMD }`, {
        pageSetup: { paperSize: undefined, orientation: 'portrait', fitToPage: true }
    });
    // titulos
    var bgImg = workbook.addImage({
        buffer: fs.readFileSync(path.join(CARPETA_IMGS, `${prefix}banner_new_walk.jpg`)),
        extension: 'jpeg',
    });
    worksheet.mergeCells('A1:J7');
    worksheet.addImage(bgImg, 'D1:G7');

    worksheet.getCell('A4').values = new Date();
    worksheet.getColumn('D').width = 0.15;
    worksheet.getColumn('E').width = 17.3;
    worksheet.getColumn('F').width = 52;
    worksheet.getColumn('G').width = 10;
    worksheet.getColumn('G').numFmt = '"$"#,##0;[Red]\-"$"#,##0';
    worksheet.getColumn('H').width = 8.43;
    worksheet.getColumn('I').width = 27;
    worksheet.getColumn('J').width = 12.57;

    worksheet.mergeCells('A8:C8');
    worksheet.getRow(8).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('A08').value = "";
    worksheet.getCell('B08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('B08').value = "Imágen";
    worksheet.getCell('C08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('C08').value = "";
    worksheet.getCell('D08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('D08').value = "Código Interno";
    worksheet.getCell('E08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('E08').value = "Código Técnico";
    worksheet.getCell('F08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('F08').value = "Descripción";
    worksheet.getCell('G08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('G08').value = "Neto Unit.";
    worksheet.getCell('H08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('H08').value = "Pares";
    worksheet.getCell('I08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('I08').value = "Distribución";
    worksheet.getCell('J08').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A6A6A6' } };
    worksheet.getCell('J08').value = "Saldo Tareas";

    var cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    cols.forEach(col => {
        worksheet.getCell(`${col}08`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getCell(`A07`).border = { top: { style: 'thin' }, left: { style: 'thin' } };
    worksheet.getCell(`G07`).border = { top: { style: 'thin' }, right: { style: 'thin' } };

    // fila de inicio
    let rowIdx = 9;
    // =============
    imagenes.forEach(imagen => {

        var mismos = lista.filter(item => item.codigoimagen === imagen);
        // console.log( imagen, mismos );

        let prodImg;
        let imgPath;

        console.log('imagen ', path.join(CARPETA_IMGS, `${ prefix + imagen }.jpg`));

        try {
            imgPath = path.join(CARPETA_IMGS, `${ prefix + imagen }.jpg`);
            prodImg = workbook.addImage({
                buffer: fs.readFileSync(imgPath),
                extension: 'jpg',
            });
        } catch (err) {
            prodImg = workbook.addImage({
                buffer: fs.readFileSync(path.join(CARPETA_IMGS, `${ prefix }no_img.jpg`)),
                extension: 'jpg',
            });
            console.log('NO encontrada -> ', err);
        }

        let filainterna = rowIdx + 2;
        mismos.forEach(prod => {
            var rowValues = [null, null, null, prod.codigo, prod.codigotec, prod.descripcion, prod.precio, prod.rtu.toString() + ' PRS', prod.distribucion, prod.saldo_ud1];
            worksheet.getRow(filainterna).values = rowValues;
            worksheet.getRow(rowIdx).alignment = { vertical: 'top' };

            cols.forEach(c => {
                worksheet.getCell(`${c}${filainterna}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });

            ++filainterna;
        });

        // imagen
        worksheet.mergeCells(`A${rowIdx}:C${rowIdx+8}`);
        worksheet.getCell(`A${rowIdx}:C${rowIdx+8}`).alignment = { vertical: 'middle', horizontal: "center" };
        worksheet.getCell(`A${rowIdx}:C${rowIdx+8}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.addImage(prodImg, `A${rowIdx}:C${rowIdx+8}`);

        // siguiente imagen
        rowIdx = rowIdx + 9;
    });
    // Write file
    return writeExcelFile(filename, workbook);
    //
};
writeExcelFile = (filename, workbook) => {
    console.log('Creando archivo Excel : ', filename);
    return workbook.xlsx.writeFile(filename);
};
// debo cambiarlo por ksp_

module.exports = {

    // cada funncion se separa por comas  
    generaQuery: function(carro, modalidad, hora, tipodoc, xObs, xOcc, xFechaDesp) {
        //
        // console.log( carro, modalidad, hora, tipodoc, xOcc, xFechaDesp );
        let query = '';
        let occ = (xOcc != null || xOcc != undefined) ? xOcc.trim() : "";
        let obs = (xObs != null || xObs != undefined) ? xObs.trim() : "";
        let fdesp = (xFechaDesp != null || xFechaDesp != undefined) ? "'" + xFechaDesp + "'" : "getdate()";
        //
        query = "declare @id     int      = 0 ; ";
        query += "declare @nrodoc char(10) = ''; ";
        query += "declare @Error nvarchar(250) ; ";
        query += "begin transaction ;";
        query += "insert into ktp_encabezado (empresa,cliente,suc_cliente,vendedor,fechaemision,";
        query += "monto,observacion,ordendecompra,modalidad,valido,fechaentrega,horainicio,horafinal) ";
        query += "values ('" + carro[0].empresa + "','" + carro[0].cliente + "','" + carro[0].suc_cliente + "','" + carro[0].vendedor + "',getdate(),";
        query += "0,'" + obs + "','" + occ + "','" + modalidad + "',''," + fdesp + ",'" + hora + "','" + hora + "') ;";
        query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
        query += "select @id = @@IDENTITY ;";
        query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
        //
        for (var i = 0; i < carro.length; i++) {
            //
            query += "insert into ktp_detalle (id_preventa,linea,sucursal,bodega,codigo,unidad_tr,unidad1,unidad2,cantidad1,cantidad2,";
            query += "listaprecio,metodolista,precio,";
            query += "porcedes,descuentos,porcerec,recargos,observacion,valido)";
            query += " values ";
            query += "(@id," + (i + 1).toString() + ",'" + carro[i].sucursal + "','" + carro[i].bodega + "','" + carro[i].codigo + "',";
            query += "1,'',''," + carro[i].cantidad.toString() + ", 0,'" + carro[i].listapre + "','" + carro[i].metodolista + "'," + carro[i].precio.toString() + ",";
            query += carro[i].dsctovend.toString() + "," + ((carro[i].precio - carro[i].preciomayor) * carro[i].cantidad).toString() + ",0,0,'', '' ) ; ";
            query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
            //
        }
        //    
        query += "update ktp_encabezado set monto=( select sum((d.cantidad1*d.precio)-d.descuentos) from ktp_detalle as d where d.id_preventa=ktp_encabezado.id_preventa ) ";
        query += " where id_preventa=@id ;";
        query += "set @Error = @@ERROR ; if (@Error<>0) goto TratarError ; ";
        //
        if (tipodoc == 'PRE') { query += "exec ksp_grabaDocumentoPre_v1 'Pendiente', 'NVV', @id, @nrodoc output ;"; } else if (tipodoc == 'NVV' || tipodoc == 'COV') { query += "exec ksp_grabaDocumentoDef_v1 '" + tipodoc + "', @id, @nrodoc output ;"; }
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
        return query;
    },

    stock: function(sql, body) {
        //
        var fechaHoy = new Date();
        // console.log(fechaHoy);
        // console.log(body);
        //
        query = "exec ksp_stockprod_caltex ";
        //
        var datos = body.datos;
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
        query += "'";
        query += datos.empresa + "','" + datos.codproducto + "','" + datos.descripcion + "','" + datos.superfamilias + "','" + datos.rubros + "','" + datos.marcas + "','";
        query += datos.ordenar + "'," + datos.offset + ",'";
        query += datos.soloconstock + "','" + datos.soloconprecio + "','" + datos.soloconocc + "','" + datos.usuario + "','' ; "; // ultimo parametro es hacia excel
        //
        console.log('desde stock->', query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then(function(results) { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });
    },

    producto: function(sql, datos) {
        //
        query = "exec ksp_producto_caltex '" + datos.codigo + "','" + datos.usuario + "','" + datos.empresa + "' ; ";
        //
        // console.log('desde producto->', query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });
    },

    g2sGetBuscar: function(sql, body) {
        //
        const cdato = body.texto === undefined ? null : "'" + body.texto + "'";
        const clanding = body.landing === undefined ? '0' : '1';
        const coferta = body.ofertas === undefined ? '0' : '1';
        query = "exec ksp_go2shop_buscarprod " + cdato + "," + body.offset + "," + clanding + "," + coferta + " ; ";
        //
        // console.log('desde  ksp_go2shop_buscarprod->', query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });
    },

    g2sGetBuscarCateg: function(sql, body) {
        //
        const cdato = body.texto === undefined ? null : "'" + body.texto + "'";
        query = "exec ksp_go2shop_buscarprodcateg " + cdato + "," + body.offset + " ; ";
        //
        // console.log('desde  ksp_go2shop_buscarprod->', query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });
    },

    g2sGetCategorias: function(sql, body) {
        //
        query = "exec ksp_go2shop_categorias ; ";
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });
    },

    g2sGetUsuario: function(sql, body) {
        //
        query = "exec ksp_go2shop_buscaruser '" + body.email + "','" + body.pssw + "' ; ";
        //
        console.log('desde ksp_go2shop_buscaruser->', query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return { resultado: 'error', mensaje: error };
            });
    },

    g2sPutUsuario: function(sql, body, id_unico) {
        //
        const celu = (body.celu === undefined || body.celu === '') ? null : "'" + body.celu + "'";
        const nomb = (body.nombre === undefined || body.nombre === '') ? null : "'" + body.nombre + "'";
        const dire = (body.direccion === undefined || body.direccion === '') ? null : "'" + body.direccion + "'";
        //
        query = "exec ksp_go2shop_crearuser '" + body.email + "'," + celu + ",'" + body.pssw + "'," + nomb + "," + dire + ",'" + id_unico + "' ;";
        //
        console.log('desde ksp_go2shop_crearuser->', query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return { resultado: 'error', mensaje: error };
            });
    },

    g2sGetClave: function(sql, body) {
        //
        query = "exec ksp_go2shop_getclave '" + body.email + "','" + body.celu + "' ;";
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });
    },

    g2sValidator: function(sql, body) {
        //
        query = "exec ksp_go2shop_validator '" + body.uuid + "' ;";
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });
    },

    productoconOCC: function(sql, datos) {
        //
        query = "exec ksp_productoconocc_caltex '" + datos.codigo + "','" + datos.usuario + "','" + datos.empresa + "' ; ";
        //
        // console.log('desde productoconocc->', query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => {
                console.log('error en la consulta', error);
                return 'error en la consulta';
            });

    },

    listaProductos: function(sql, body) {
        //
        console.log(body);
        let datos = body;
        let query = "";
        //
        datos.listap = (datos.listap == undefined) ? '' : datos.listap;
        datos.superfamilias = (datos.superfamilias == undefined) ? '' : datos.superfamilias;
        datos.familias = (datos.familias == undefined) ? '' : datos.familias;
        datos.rubros = (datos.rubros == undefined) ? '' : datos.rubros;
        datos.marcas = (datos.marcas == undefined) ? '' : datos.marcas;
        datos.soloconstock = (datos.soloconstock == undefined) ? 'false' : datos.soloconstock;
        datos.soloconprecio = (datos.soloconprecio == undefined) ? 'false' : datos.soloconprecio;
        datos.soloconocc = (datos.soloconocc == undefined) ? 'false' : datos.soloconocc;
        datos.ordenar = (datos.ordenar == undefined) ? '' : datos.ordenar;
        //
        query = "exec ksp_buscarProductos_v2_caltex ";
        query += "'" + datos.codigo + "','" + datos.descripcion + "','" + datos.bodega + "','" + datos.listap + "',";
        query += "'" + datos.superfamilias + "','" + datos.familias + "','" + datos.rubros + "','" + datos.marcas + "',";
        query += "'" + datos.ordenar + "'," + datos.offset + "," + datos.soloconstock + "," + datos.soloconprecio + "," + datos.soloconocc + ",";
        query += "'" + datos.empresa + "','" + datos.kofu + "','" + datos.cliente + "' ;";
        //
        fecha_ahora = new Date();
        // console.log(fecha_ahora);
        // console.log(query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => { console.log('error en la consulta', error); return 'error en la consulta'; });

    },

    listaClientes: function(sql, body) {
        //
        query = "exec ksp_buscarClientes_v3_caltex '" + body.dato + "','" + body.usuario + "','" + body.empresa + "' ;";
        //
        fecha_ahora = new Date();
        // console.log(fecha_ahora);
        // console.log(query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => { console.log('error en la consulta', error); return 'error en la consulta'; });
    },

    impagos: function(sql, body) {
        //
        query = "exec ksp_traeImpagos '" + body.codigo + "','" + body.empresa + "' ;";
        //
        fecha_ahora = new Date();
        // console.log(fecha_ahora);
        // console.log(query);
        //
        var request = new sql.Request();
        return request.query(query)
            .then((results) => { return results.recordset; })
            .catch((error) => { console.log('error en la consulta', error); return 'error en la consulta'; });

    },

    traeDocumento: function(sql, body) {
        //  
        var request = new sql.Request();
        //
        return request.query("exec ksp_traeDocumento " + body.id.toString() + " ;")
            .then(function(results) {
                return results.recordset;
            });
    },

    newid: function(sql) {
        //  
        var request = new sql.Request();
        //
        return request.query("select newid() as newid ;")
            .then(function(results) {
                return results.recordset;
            });
    },

    NVVPendientes: function(sql, body) {
        //  
        var request = new sql.Request();
        //
        // console.log(body);
        return request.query("exec ksp_traeNVVPendientes '" + body.vendedor + "','" + body.empresa + "' ;")
            .then(function(results) {
                return results.recordset;
            });
    },

    DetalleNVVPendiente: function(sql, body) {
        //  
        var request = new sql.Request();
        //
        // console.log(body);
        // console.log("exec ksp_traeDetalleNVV " + body.id.toString() + " ;");
        //
        return request.query("exec ksp_traeDetalleNVV " + body.id.toString() + " ;")
            .then(function(results) {
                return results.recordset;
            });
    },

};
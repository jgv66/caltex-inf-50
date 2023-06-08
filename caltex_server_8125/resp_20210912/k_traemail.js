// debo cambiarlo por ksp_

module.exports = {

    // cada funncion se separa por comas  
    delVendedor: function(sql, cVendedor) {
        //  
        var request = new sql.Request();
        //
        return request.query("select TOP 1 rtrim(EMAIL) as correo from TABFU where KOFU='" + cVendedor.trim() + "' ;")
            .then(function(results) {
                return results.recordset[0].correo;
            });
    },
    //
    delCliente: function(sql, cCodigo, cSucursal) {
        //  
        var request = new sql.Request();
        //
        return request.query("select TOP 1 rtrim(EMAILCOMER) as correo from MAEEN where KOEN='" + cCodigo.trim() + "' AND SUEN='" + cSucursal.trim() + "' ;")
            .then(function(results) {
                return results.recordset[0].correo;
            });
    },
    // cada funncion se separa por comas  
    delVendedorMas: function(sql, cVendedor) {
        //  
        var request = new sql.Request();
        //
        return request.query("select TOP 1 rtrim(EMAIL) as correo,rtrim(NOKOFU) as nombreVend from TABFU where KOFU='" + cVendedor.trim() + "' ;")
            .then(function(results) {
                return results.recordset[0];
            });
    },
    //
    delClienteMas: function(sql, cCodigo, cSucursal) {
        //  
        var request = new sql.Request();
        //
        return request.query("select TOP 1 rtrim(KOEN) as codCliente,rtrim(EMAILCOMER) as correo,rtrim(NOKOEN) as rsocial,SUEN as suc_cliente from MAEEN where KOEN='" + cCodigo.trim() + "' AND SUEN='" + cSucursal.trim() + "' ;")
            .then(function(results) {
                return results.recordset[0];
            });
    }

}
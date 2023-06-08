// debo cambiarlo por ksp_

module.exports = {
  
  // cada funncion se separa por comas  
  configp: function( sql ) { 
    //  
    var request = new sql.Request();
    //
    return request.query("select EMPRESA as codigo,RAZON as razonsocial from CONFIGP with (nolock)  ;") // where EMPRESA='02'
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  confiest: function( sql, empresa ) { 
    //  
    var request = new sql.Request();
    //
    return request.query("select MODALIDAD from CONFIEST where EMPRESA='"+empresa.trim()+"' ;")
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  tabfuem: function( sql, usuario, empresa ) { 
    //  
    var request = new sql.Request();
    //
    return request.query( "select 'SI' as existe from TABFUEM WHERE KOFU='"+usuario.trim()+" AND EMPRESA='"+empresa.trim()+"' ; " )
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  rubros: function( sql ) { 
    //  
    var request = new sql.Request();
    //
    return request.query("select KORU as rubro, NOKORU as descripcion from TABRU with (nolock) order by rubro ;")
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  marcas: function( sql ) { 
    //  
    var request = new sql.Request();
    //
    return request.query("select KOMR as marca, NOKOMR as descripcion from TABMR with (nolock) order by marca ;")
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  superfamilias: function( sql ) { 
    //  
    var request = new sql.Request();
    //
    return request.query("select KOFM as superfam, NOKOFM as nombresf from TABFM with (nolock) order by superfam ;")
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  familias: function( sql ) { 
    //  
    var request = new sql.Request();
    //
    return request.query( "select KOFM as superfam, KOPF as familia, NOKOPF as nombrefam from TABPF with (nolock) order by superfam,familia ;" )
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  variables: function( sql, cliente ) { 
    //  
    var request = new sql.Request();
    //
    return request.query( "select top 1 * from PDIMCLI with (nolock) WHERE CODIGO='"+cliente+"' ;" )
      .then( function(results) { 
        return results.recordset; 
      } )
  },
  //
  traeDocumento: function( sql, cliente ) { 
    //  
    var request = new sql.Request();
    //
    return request.query( "select * from PDIMCLI with (nolock) WHERE CODIGO='"+cliente.trim()+"' ;" )
      .then( function(results) { 
        return results.recordset; 
      } );
  },  
}

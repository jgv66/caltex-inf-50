//
const fs = require('fs');
//
const DOMAIN = 'mailer.kinetik.cl';
const api_key = 'df3843228fab5e3da44a6332c83a203b-4de08e90-4404475b';
const mailgun = require("mailgun-js")({ apiKey: api_key, domain: DOMAIN });
// configuracion de mail-gun
const SENDER_INTERNO = 'kinetik@grupocaltex.cl';
const COPIA_INTERNA = 'lsalinas@grupocaltex.cl';
const COPIA_TELAS = 'acuminao@grupocaltex.cl';
//
module.exports = {
    // cada funncion se separa por comas  
    enviarCorreo: (mailList, htmlBody, empresa) => {
        // si 'to' viene vacio
        if (mailList.to === '') {
            mailList.to = ((mailList.cc !== '') ? mailList.cc : COPIA_INTERNA);
        }
        const cSu = (empresa === '04') ? 'Información de Pre-Venta' : 'Cotización Grupo Caltex';
        //
        const data = {
            from: `GrupoCaltex <${SENDER_INTERNO}>`,
            to: mailList.to,
            cc: ((mailList.cc !== '') ? mailList.cc + ',' + COPIA_INTERNA : COPIA_INTERNA),
            subject: cSu,
            html: htmlBody
        };
        console.log('data->', data);
        //
        mailgun.messages()
            .send(data, function(error, body) {
                if (error) {
                    console.log('error en mailgun.messages().send()->', error);
                    return false;
                } else {
                    console.log("Email enviado a -> ", mailList.to);
                    console.log("Email con copia -> ", COPIA_INTERNA, mailList.cc);
                    return true;
                }
            });
    },

    enCo2: function(mailList, htmlBody, cfile, pathfile, empresa) {
        //
        cSu = (empresa === '04') ? 'Detalle de Pre-Venta' : 'Cotización Grupo Caltex';
        //
        const data = {
            from: `GrupoCaltex <${SENDER_INTERNO}>`,
            to: mailList.to,
            cc: mailList.cc,
            subject: cSu,
            html: htmlBody,
            attachment: pathfile + '/' + cfile
        };
        console.log('data->', data);
        //
        mailgun.messages()
            .send(data, function(error, body) {
                if (error) {
                    console.log('error en mailgun.enCo2()->', error);
                    return false;
                    // res.json({ resultado: 'error', numero: error });
                } else {
                    console.log("Email enviado a -> ", mailList.to);
                    console.log("Email con copia -> ", COPIA_INTERNA, mailList.cc);
                    return true;
                    // res.json({ resultado: 'ok', numero: 'Enviado' });
                }
            });
    },

    enviarCorreoExcel: (res, mailList, filename) => {
        //
        const xhoy = new Date();
        const anno = xhoy.getFullYear().toString();
        const mes = (xhoy.getMonth() + 1).toString();
        const dia = xhoy.getDate().toString();
        const hora = xhoy.getHours().toString();
        const minu = xhoy.getMinutes().toString();
        //
        // si no tiene correo se envia al vendedor
        if (mailList.emailTo === '' || mailList.emailTo == undefined) {
            mailList.emailTo = mailList.emailCc;
        }
        //
        const data = {
            from: `GrupoCaltex <${SENDER_INTERNO}>`,
            to: mailList.emailTo,
            cc: (mailList.emailCc !== '') ? mailList.emailCc : undefined,
            subject: 'Planillas de Stock al ' + dia + '-' + mes + '-' + anno,
            html: 'Adjunto Planilla de Stock al <b>' + dia + '-' + mes + '-' + anno + ' - ' + hora + ':' + minu + ' horas</b><br>Comentarios: ' + mailList.nombreCli,
            attachment: filename
        };
        console.log('data->', data);
        //
        mailgun.messages()
            .send(data, function(error, body) {
                if (error) {
                    console.log('error en mailgun.enCo2()->', error);
                    res.json({ resultado: 'error', numero: error });
                } else {
                    console.log("Email enviado a -> ", mailList.emailTo);
                    console.log("Email con copia -> ", mailList.emailCc);
                    res.json({ resultado: 'ok', numero: 'Enviado' });
                }
            });
        //
    },

    componeBody: function(sql, id) {
        //  
        var request = new sql.Request();
        request.input('id', sql.Int, id);
        return request.execute("ksp_TraeDetalleK");
        //
    },
    primeraParte: function(cObs, cNumero, cOcc, xDatosVendedor, xDatosCliente) {
        return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width" />
      
          <style type="text/css">
              * { margin: 0;  padding: 0; font-size: 100%; font-family: 'Avenir Next', "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; line-height: 1.65; }
              img { max-width: 100%;  margin: 0 auto; display: block; }
              body, .body-wrap { width: 100% !important; height: 100%; background: #efefef; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; }
              a { color: #71bc37; text-decoration: none; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .button { display: inline-block; color: white;  background: #71bc37; border: solid #71bc37; border-width: 10px 20px 8px; font-weight: bold; border-radius: 4px; }
              h1, h2,  h3, h4, h5, h6 { margin-bottom: 20px; line-height: 1.25; }
              h1 { font-size: 32px; }
              h2 { font-size: 28px; }
              h3 { font-size: 24px; }
              h4 { font-size: 20px; }
              h5 { font-size: 16px; }
              p, ul, ol { font-size: 16px; font-weight: normal; margin-bottom: 20px; }
              .container { display: block !important; clear: both !important; margin: 0 auto !important; max-width: 980px !important; }
              .container table { width: 100% !important; border-collapse: collapse; }
              .container .masthead { padding: 10px 0;  background: #222; color: white; }
              .container .masthead h1 { margin: 0 auto !important; max-width: 90%; text-transform: uppercase; }
              .container .content {  background: white; padding: 30px 35px; }
              .container .content.footer { background: none;  }
              .container .content.footer p { margin-bottom: 0; color: #888; text-align: center; font-size: 10px; }
              .container .content.footer a { color: #888; text-decoration: none; font-weight: bold; }
          </style>
      </head>
      
      <body>
          <table class="body-wrap">
              <tr>
                  <td class="container">
      
                      <!-- Message start -->
                      <table>
                          <tr>
                              <td align="center" class="masthead">
                              <img src="http://www.grupocaltex.cl/imagenes/fotos18/banner_logos_correo.png" alt="grupocaltex.cl"></img>
                              </td>
                          </tr>
                          <!-- KINETIK -->
                          <tr>
                              <td class="content">
                                  <p>Estimado cliente: Este documento es una copia de respaldo a la atención prestada. Tenga en cuenta que stocks y precios podrían variar en el tiempo. Sírvase revisar con el vendedor los datos definitivos de su pedido.</p>
                                    <br>
                                    <table border="1">
                                        ` + (xDatosCliente.codCliente != '' && xDatosCliente.codCliente != undefined ? '<tr><td>Código Cliente   </td><td align="left">' + xDatosCliente.codCliente + '  </td></tr>' : '') + `
                                        ` + (xDatosCliente.rsocial != '' && xDatosCliente.rsocial != undefined ? '<tr><td>Razón Social     </td><td align="left">' + xDatosCliente.rsocial + '     </td></tr>' : '') + `
                                        ` + (xDatosCliente.sucCliente != '' && xDatosCliente.sucCliente != undefined ? '<tr><td>Sucursal Cliente </td><td align="left">' + xDatosCliente.sucCliente + '  </td></tr>' : '') + `
                                        ` + (xDatosVendedor.nombreVend != '' && xDatosVendedor.nombreVend != undefined ? '<tr><td>Vendedor Asignado</td><td align="left">' + xDatosVendedor.nombreVend + ' </td></tr>' : '') + `
                                        ` + (cNumero != '' && cNumero != undefined ? '<tr><td>Documento        </td><td align="left">' + cNumero + '                      </td></tr>' : '') + `
                                        ` + (cObs != '' && cObs != undefined ? '<tr><td>Observaciones    </td><td align="left">' + cObs + '                         </td></tr>' : '') + `
                                        ` + (cOcc != '' && cOcc != undefined ? '<tr><td>Orden de Compra  </td><td align="left">' + cOcc + '                         </td></tr>' : '') + `
                                    <!--  KINETIK -->
                                    </table>
                                    <br>
                                    <h3>Detalle de la atención</h3>
                                    <table border="1">
                                        <tr>
                                            <td align="center">Imagen (150x150)</td>
                                            <td align="center">Cantidad</td>
                                            <td align="center">Código</td>
                                            <td align="center">Descripción</td>
                                            <td align="center">Precio Unit</td>
                                            <td align="center">Descto.</td>
                                            <td align="center">SubTotal</td>
                                        </tr>`;
    },
    segundaParte: function() {
        return `            </table>

            </td>
        </tr>
        <!--  KINETIK -->
        </table>

        </td>
        </tr>
        <tr>
        <td class="container">

        <!-- Message start -->
        <table>
        <tr>
            <td class="content footer" align="center">
                <p>Desarrollado por Kinetik - Soluciones Móviles</p>
            </td>
        </tr>
        </table>

        </td>
        </tr>
        </table>
        </body>

        </html>`;
    },
    cotizcuerpo: function(nombreVendedor, nombrecliente, empresa, xemailobs) {
        return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width" />
    
        <style type="text/css">
            * { margin: 0;  padding: 0; font-size: 100%; font-family: 'Avenir Next', "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; line-height: 1.65; }
            img { max-width: 100%;  margin: 0 auto; display: block; }
            body, .body-wrap { width: 100% !important; height: 100%; background: #efefef; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; }
            a { color: #71bc37; text-decoration: none; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .button { display: inline-block; color: white;  background: #71bc37; border: solid #71bc37; border-width: 10px 20px 8px; font-weight: bold; border-radius: 4px; }
            h1, h2,  h3, h4, h5, h6 { margin-bottom: 20px; line-height: 1.25; }
            h1 { font-size: 32px; }
            h2 { font-size: 28px; }
            h3 { font-size: 24px; }
            h4 { font-size: 20px; }
            h5 { font-size: 16px; }
            p, ul, ol { font-size: 16px; font-weight: normal; margin-bottom: 20px; }
            .container { display: block !important; clear: both !important; margin: 0 auto !important; max-width: 980px !important; }
            .container table { width: 100% !important; border-collapse: collapse; }
            .container .masthead { padding: 10px 0;  background: #222; color: white; }
            .container .masthead h1 { margin: 0 auto !important; max-width: 90%; text-transform: uppercase; }
            .container .content {  background: white; padding: 30px 35px; }
            .container .content.footer { background: none;  }
            .container .content.footer p { margin-bottom: 0; color: #888; text-align: center; font-size: 10px; }
            .container .content.footer a { color: #888; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    
    <body>
        <table class="body-wrap">
            <tr>
                <td class="container">
    
                    <!-- Message start -->
                    <table>
                        <tr>
                            <td align="center" class="masthead">
                            <img src="http://www.grupocaltex.cl/imagenes/fotos18/banner_logos_correo.png" alt="grupocaltex.cl"></img>
                            </td>
                        </tr>
                        <!-- KINETIK -->
                        <tr>
                            <td class="content">
                                <p>Estimado cliente: Este documento es una copia de respaldo a la atención prestada. Tenga en cuenta que stocks y precios podrían variar en el tiempo. Sírvase revisar con el vendedor los datos definitivos de su atención.</p>
                                  <br>
                                  <table border="1">
                                    ` + (nombreVendedor != '' && nombreVendedor != undefined ? '<tr><td>Vendedor Atendiendo</td><td align="left">' + nombreVendedor + '</td></tr>' : '') + `
                                    ` + (nombrecliente != '' && nombrecliente != undefined ? '<tr><td>Cliente Atendido</td><td align="left">' + nombrecliente + ' </td></tr>' : '') + `
                                    ` + (xemailobs != '' && xemailobs != undefined ? '<tr><td>Observaciones</td><td align="left">' + xemailobs + ' </td></tr>' : '') + `
                                  <!--  KINETIK -->
                                  </table>
                                  <br><h3>
                                  ` + (empresa === '04' ? 'Detalle de la Pre-Venta' : 'Detalle de la Cotización') + `
                                  </h3>
                                  <table border="1">
                                  ` + (empresa === '04' ? '<tr><td align="center">Código Principal</td><td align="center">Código Técnico</td><td align="center">Descripción</td><td align="center">Precio x Mt.</td><td align="center">Cantidad</td><td align="center">Unidad</td></tr>' : '<tr><td align="center">Imagen (150x150)</td><td align="center">Código Interno</td><td align="center">Cód.Técnico</td><td align="center">Descripción</td><td align="center">Precio Unit.</td><td align="center">Curva</td></tr>');
    },
    cotizfin: function() {
        return `            </table>

          </td>
      </tr>
      <!--  KINETIK -->
      </table>

      </td>
      </tr>
      <tr>
      <td class="container">

      <!-- Message start -->
      <table>
      <tr>
          <td class="content footer" align="center">
              <p>Desarrollado por Kinetik - Soluciones Móviles a su medida (2019)</p>
          </td>
      </tr>
      </table>

      </td>
      </tr>
      </table>
      </body>

      </html>`;
    },
    deudaHeader: function(cliente) {
        return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width" />
    
        <style type="text/css">
            * { margin: 0;  padding: 0; font-size: 100%; font-family: 'Avenir Next', "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; line-height: 1.65; }
            img { max-width: 100%;  margin: 0 auto; display: block; }
            body, .body-wrap { width: 100% !important; height: 100%; background: #efefef; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; }
            a { color: #71bc37; text-decoration: none; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .button { display: inline-block; color: white;  background: #71bc37; border: solid #71bc37; border-width: 10px 20px 8px; font-weight: bold; border-radius: 4px; }
            h1, h2,  h3, h4, h5, h6 { margin-bottom: 20px; line-height: 1.25; }
            h1 { font-size: 32px; }
            h2 { font-size: 28px; }
            h3 { font-size: 24px; }
            h4 { font-size: 20px; }
            h5 { font-size: 16px; }
            p, ul, ol { font-size: 16px; font-weight: normal; margin-bottom: 20px; }
            .container { display: block !important; clear: both !important; margin: 0 auto !important; max-width: 980px !important; }
            .container table { width: 100% !important; border-collapse: collapse; }
            .container .masthead { padding: 10px 0;  background: #222; color: white; }
            .container .masthead h1 { margin: 0 auto !important; max-width: 90%; text-transform: uppercase; }
            .container .content {  background: white; padding: 30px 35px; }
            .container .content.footer { background: none;  }
            .container .content.footer p { margin-bottom: 0; color: #888; text-align: center; font-size: 10px; }
            .container .content.footer a { color: #888; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    
    <body>
        <table class="body-wrap">
            <tr>
                <td class="container">
    
                    <!-- Message start -->
                    <table>
                        <tr>
                            <td align="center" class="masthead">
                            <img src="http://www.grupocaltex.cl/imagenes/fotos18/banner_logos_correo.png" alt="grupocaltex.cl"></img>
                            </td>
                        </tr>
                        <!-- KINETIK -->
                        <tr>
                            <td class="content">
                                <p>Estimado cliente: Este informe representa una copia fiel de su deuda en este momento. Si se han realizado pagos o asignaciones de documentos y estos aun no se han registrado en el sistema, solicite una actualización de este mismo reporte.</p>
                                  <br>
                                  <table border="1">
                                  ` + (cliente.razom != '' ? '<tr><td>Cliente</td><td align="left">' + cliente.razon + ' </td></tr>' : '') + `
                                  ` + (cliente.direccion != '' ? '<tr><td>Dirección</td><td align="left">' + cliente.direccion + ' </td></tr>' : '') + `
                                  ` + (cliente.comuna != '' ? '<tr><td>Comuna</td><td align="left">' + cliente.nomcomuna + ' </td></tr>' : '') + `
                                  ` + (cliente.ciudad != '' ? '<tr><td>Ciudad</td><td align="left">' + cliente.nomciudad + ' </td></tr>' : '') + `
                                  <!--  KINETIK -->
                                  </table>
                                  <br><h3>Detalle de Deuda</h3>
                                  <table border="1">
                                  ` + (empresa === '04' ? '<tr><td align="center">Documento</td><td align="center">Folio</td><td align="center">Emision</td><td align="center">Vencimiento</td><td align="center">Monto</td><td align="center">Abonos</td></tr>' : '<tr><td align="center">Imagen (150x150)</td><td align="center">Código Interno</td><td align="center">Cód.Técnico</td><td align="center">Descripción</td><td align="center">Precio Unit.</td><td align="center">Curva</td></tr>');
    },

};

eliminarArchivo = (filename) => {
    console.log('eliminando: ', filename);
    fs.unlink(filename, (err) => {
        if (err) throw err;
        console.log('File deleted!', filename);
    });
};
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox954bd8f7f0134a9c9eccebd014c08e75.mailgun.org';
const api_key = 'df3843228fab5e3da44a6332c83a203b-4de08e90-4404475b';

module.exports = {
    // cada funncion se separa por comas  
    componeBody: function(sql, id) {
        //  
        var request = new sql.Request();
        request.input('id', sql.Int, id);
        return request.execute("ksp_TraeDetalleK");
        //
    },

    enviarCorreo: (res, nodemailer, mailList, htmlBody) => {
        //
        sender = 'postmaster@sandbox954bd8f7f0134a9c9eccebd014c08e75.mailgun.org';
        psswrd = '36aff41967ac82e539b5df4a5d1ee96b-4de08e90-2d01ea0f';
        //
        cTo = mailList[0].to;
        cCc = mailList[0].cc;
        cSu = (empresa === '04') ? 'Información de Pre-Venta' : 'Cotización Grupo Caltex';
        // datos del enviador
        var transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
                user: sender,
                pass: psswrd
            },
            tls: { rejectUnauthorized: false },
            // logger: true,
            // debug: true
        });
        // opciones del correo
        var mailOptions = {
            from: { name: "GrupoCaltex", address: 'kinetik@grupocaltex.cl' },
            to: cTo,
            // cc: cCc, // [{ name: "julio gonzalez 👻", address: 'jogv66@gmail.com'}, 'pedroalfonsofrancisco@gmail.com' ],
            cc: [{ name: "Lucrecia Salinas S.", address: 'lsalinas@grupocaltex.cl' }, cCc],
            subject: cSu,
            html: htmlBody
        };
        //
        // enviar el correo
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log('error en sendmail->', error);
                res.json({ resultado: 'error', numero: error });
            } else {
                console.log("Email enviado a -> ", cTo);
                console.log("Email con copia -> ", cCc);
                res.json({ resultado: 'ok', numero: 'Enviado' });
            }
        });
    },

    enviarCotizacion: (res, nodemailer, mailList, htmlBody, empresa) => {
        //
        sender = 'postmaster@sandbox954bd8f7f0134a9c9eccebd014c08e75.mailgun.org';
        psswrd = '36aff41967ac82e539b5df4a5d1ee96b-4de08e90-2d01ea0f';
        //
        cTo = mailList[0].to;
        cCc = mailList[0].cc;
        cSu = (empresa === '04') ? 'Información de Pre-Venta' : 'Cotización Grupo Caltex';
        // datos del enviador
        var transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
                user: sender,
                pass: psswrd
            },
            tls: { rejectUnauthorized: false },
            // logger: true,
            // debug: true
        });
        console.log('transporter', transporter);
        // opciones del correo
        var mailOptions = {
            from: { name: "GrupoCaltex", address: 'kinetik@grupocaltex.cl' },
            to: cTo,
            // cc: cCc, // [{ name: "julio gonzalez 👻", address: 'jogv66@gmail.com'}, 'pedroalfonsofrancisco@gmail.com' ],
            cc: [{ name: "Lucrecia Salinas S.", address: 'lsalinas@grupocaltex.cl' }, cCc],
            subject: cSu,
            html: htmlBody
        };
        // enviar el correo
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log('error en sendmail->', error);
                return;
            } else {
                console.log("Email enviado a -> ", cTo);
                console.log("Email con copia -> ", cCc);
                return;
            }
        });
    },

    enCo2: function(res, nodemailer, mailList, htmlBody, cfile, pathfile, fs, empresa) {
        //
        sender = 'postmaster@sandbox954bd8f7f0134a9c9eccebd014c08e75.mailgun.org';
        psswrd = '36aff41967ac82e539b5df4a5d1ee96b-4de08e90-2d01ea0f';
        //
        cTo = mailList[0].to;
        cCc = mailList[0].cc;
        cSu = (empresa === '04') ? 'Detalle de Pre-Venta' : 'Cotización Grupo Caltex';
        //
        var transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
                user: sender,
                pass: psswrd
            },
            tls: { rejectUnauthorized: false },
            // logger: true,
            // debug: true
        });
        // opciones del correo
        var mailOptions = {
            // from: { name: "GrupoCaltex", address: sender },
            from: { name: "GrupoCaltex", address: 'kinetik@grupocaltex.cl' },
            to: cTo,
            // cc: (empresa === '04') ? [cCc, { name: "Andres Cuminao", address: 'acuminao@grupocaltex.cl' }] : [{ name: "Lucrecia Salinas S.", address: 'lsalinas@grupocaltex.cl' }, cCc],
            subject: cSu,
            html: htmlBody,
            attachments: [{ filename: cfile, path: pathfile + '/' + cfile }]
        };
        // enviar el correo
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log('error en sendmail->', error);
                return;
            } else {
                console.log("Email enviado a -> ", mailList[0].to);
                fs.unlinkSync(pathfile + '/' + cfile);
                return;
            }
        });
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
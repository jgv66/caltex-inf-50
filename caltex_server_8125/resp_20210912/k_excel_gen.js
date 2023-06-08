// jshint esversion: 6
const Excel   = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const CARPETA_IMGS = 'public/images/';
const CARPETA_XLSX = 'public/xls/';

const writeExcelFile = (filename, workbook) => {
    console.log('Creating Excel file: ', filename);
    return workbook.xlsx.writeFile(filename);
};

createExcelFile = ( prefix, lista, imagenes, fechaYMD, id_unico ) => {

    console.log('creando planilla');
    console.log(imagenes);

    return new Promise( (resolve) => {

        const workbook = new Excel.Workbook();
        workbook.creator        = 'kinetik.cl';
        workbook.lastModifiedBy = 'kinetik.cl';
        workbook.created        = new Date();
        workbook.modified       = new Date();
        
        const worksheet = workbook.addWorksheet(`Stock al ${ fechaYMD }`,
        { 
            pageSetup: { paperSize: undefined, orientation: 'portrait', fitToPage: true } 
        });
        // titulos
        const bgImg = workbook.addImage({
            buffer: fs.readFileSync(path.join(__dirname, CARPETA_IMGS, `${prefix}banner_new_walk.jpg` )), 
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
        
        const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J'];
        cols.forEach(col => {
            worksheet.getCell( `${col}08`).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin' } };
        });
        worksheet.getCell( `A07`).border = { top: {style:'thin'}, left: {style:'thin'} };
        worksheet.getCell( `G07`).border = { top: {style:'thin'}, right: {style:'thin'} };
        
        // fila de inicio
        let rowIdx = 9;
        // =============
        imagenes.forEach( imagen => {
            
            const mismos = lista.filter( item => item.codigoimagen === imagen );
            // console.log( imagen, mismos );

            let prodImg;
            let imgPath;
            
            try {
                imgPath = path.join(__dirname, CARPETA_IMGS, `${ prefix + imagen }.jpg` );
                console.log(imgPath);
                prodImg = workbook.addImage({
                    buffer: fs.readFileSync(imgPath),
                    extension: 'jpg',
                });
            } catch (err) {
                console.error('File not found (?)', err.Error);
                prodImg = workbook.addImage({
                    buffer: fs.readFileSync(path.join(__dirname, CARPETA_IMGS, `${ prefix }no_img.jpg`)),
                    extension: 'jpg',
                });
            }

            let filainterna = rowIdx + 1;
            mismos.forEach( prod => {                
                const rowValues = [ null, null, null, prod.codigo, prod.codigotec, prod.descripcion, prod.precio, prod.rtu.toString()+' PRS', prod.distribucion, prod.saldo_ud1 ];
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

        // const totalRowIdx = rowIdx - 1;
        // worksheet.getCell(`A${totalRowIdx + 2}`).value = 'Validez del stock: 1 día... con suerte';
        
        // Write file
        const filename = path.join( CARPETA_XLSX  `Stock_${fechaYMD}_${id_unico}.xlsx`);
        resolve( writeExcelFile(filename, workbook) );

    });
};

module.exports = createExcelFile ;
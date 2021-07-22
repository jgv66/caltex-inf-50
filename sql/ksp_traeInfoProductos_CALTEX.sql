/* solo seran extraidos desde MAEST, nrp/jogv
PENDIENTE as ( select KOPRCT,sum(CAPRCO1-CAPRAD1+CAPREX1) as pendi_ud1 from MAEDDO with (nolock) WHERE EMPRESA='+char(39)+@empresa+char(39)+' and TIDO='+char(39)+'NVV'+char(39)+' and BOSULIDO='+char(39)+@bodega+char(39)+' and CAPRCO1<>CAPRAD1+CAPREX1 GROUP BY KOPRCT ),';
PORLLEGAR as ( select KOPRCT,sum(CAPRCO1-CAPRAD1+CAPREX1) as llega_ud1 from MAEDDO with (nolock) WHERE EMPRESA='+char(39)+@empresa+char(39)+' and TIDO='+char(39)+'OCC'+char(39)+' and BOSULIDO='+char(39)+@bodega+char(39)+' and CAPRCO1<>CAPRAD1+CAPREX1 GROUP BY KOPRCT ) ';

select KOPRCT,BOSULIDO,sum(CAPRCO1-CAPRAD1+CAPREX1) as pendi_ud1 
from MAEDDO with (nolock)
inner join MAEPR on MAEPR.KOPR=MAEDDO.KOPRCT 
WHERE EMPRESA='02' 
  and TIDO='NVV' 
  and CAPRCO1<>CAPRAD1+CAPREX1 
  --and KOPRCT='19V112606190'
GROUP BY KOPRCT,BOSULIDO

*/

-- exec ksp_traeInfoProductos '19V066E109V','C','','','RCT','02' ;
-- exec ksp_traeInfoProductos '19V066E109V','V','','','RCT','02' ;
-- exec ksp_traeInfoProductos '19V1815Z14A','V','','','OSV','02' ;
IF OBJECT_ID('ksp_traeInfoProductos', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_traeInfoProductos;  
GO  
CREATE PROCEDURE ksp_traeInfoProductos (
    @kodigo		char(13) = '',
	@tipocon	char(1)  = '',
	@cliente	char(13) = '',
	@sucursal   char(10) = '',
	@vendedor	char(3)  = '',
	@empresa    char(2)  = '01' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON

print @tipocon

	if @tipocon = 'C' 
	begin
		select DDO.TIDO as tipodoc,DDO.NUDO as numero,
		       DDO.ENDO as cli_prod,DDO.SUENDO as suc_cli_prod,EN.NOKOEN as razonsoc, 
			   DDO.BOSULIDO as bodega,BO.NOKOBO as nombrebodega,
			   (case when DDO.UDTRPR=1 then (DDO.CAPRCO1-DDO.CAPRAD1+DDO.CAPREX1) else (DDO.CAPRCO1-DDO.CAPRAD1+DDO.CAPREX1) end ) as cantidad, 
			   (case when DDO.UDTRPR=1 then DDO.UD01PR else DDO.UD02PR end ) as unidad, 
			   convert( nvarchar(10),DDO.FEEMLI,103) as fecha_ped, convert( nvarchar(10),DDO.FEERLI,103) as fecha_ent 
		from MAEDDO as DDO with (nolock) 
		left join MAEEN as EN on EN.KOEN=DDO.ENDO and EN.SUEN=DDO.SUENDO
		left join TABBO as BO on BO.KOBO=DDO.BOSULIDO
		WHERE DDO.EMPRESA=@empresa 
		  and DDO.TIDO='OCC'
		  and DDO.KOPRCT=@kodigo
		  and DDO.CAPRCO1<>DDO.CAPRAD1+DDO.CAPREX1 
		ORDER BY DDO.FEEMLI desc
	end

	if @tipocon = 'V'
	begin
		select DDO.TIDO as tipodoc,DDO.NUDO as numero,
		       DDO.ENDO as cli_prod,DDO.SUENDO as suc_cli_prod,EN.NOKOEN as razonsoc, 
			   DDO.BOSULIDO as bodega,BO.NOKOBO as nombrebodega,
			   (case when DDO.UDTRPR=1 then (DDO.CAPRCO1-DDO.CAPRAD1+DDO.CAPREX1) else (DDO.CAPRCO1-DDO.CAPRAD1+DDO.CAPREX1) end ) as cantidad, 
			   (case when DDO.UDTRPR=1 then DDO.UD01PR else DDO.UD02PR end ) as unidad, 
			   convert( nvarchar(10),DDO.FEEMLI,103) as fecha_ped, convert( nvarchar(10),DDO.FEERLI,103) as fecha_ent,
			   DDO.KOFULIDO as vendedor 
		from MAEDDO as DDO with (nolock) 
		left join MAEEN as EN on EN.KOEN=DDO.ENDO and EN.SUEN=DDO.SUENDO
		left join TABBO as BO on BO.KOBO=DDO.BOSULIDO
		WHERE DDO.EMPRESA=@empresa 
		  and DDO.TIDO='NVV'
		  and DDO.KOPRCT=@kodigo
		  and DDO.CAPRCO1<>DDO.CAPRAD1+DDO.CAPREX1 
		  and DDO.KOFULIDO = @vendedor
		ORDER BY DDO.FEEMLI ASC
	end

END
go

 
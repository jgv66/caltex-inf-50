
-- exec ksp_producto_caltex '14ID3GD0C3010','HIC','02';
IF OBJECT_ID('ksp_producto_caltex', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_producto_caltex;  
GO  
CREATE PROCEDURE ksp_producto_caltex (
    @codproducto	char(13) =  '', 
    @usuario		char(3)  =  '',
	@empresa		char(2)  =	'' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON
 
    declare @bodega			char(3),
            @sucursal		char(3),
            @listapre		char(3),
	        @query			NVARCHAR(max) = '',
            @letraN			char(1) = 'N',
            @neto			char(5) = 'Neto ',
            @bruto			char(5) = 'Bruto',
			@occ			char(3)	= 'OCC';

	declare @docdecompra	varchar(250)	= '('+char(39)+'FCC'+char(39)+','+char(39)+'GRC'+char(39)+','+char(39)+'GRI'+char(39)+','+char(39)+'GRD'+char(39)+','+char(39)+'NCC'+char(39)+','+char(39)+'FCT'+char(39)+','+char(39)+'GRP'+char(39)+')),cast(0 as bit)';
 
 	select @bodega=EBODEGA,@sucursal=ESUCURSAL,@listapre=substring(ELISTAVEN,6,3)
	from CONFIEST with (nolock) 
	where EMPRESA	= @empresa
	  and MODALIDAD = (select MODALIDAD 
					   from TABFU with (nolock) 
					   where KOFU = @usuario ) ;

    set @query += 'with images ';
    set @query += 'as ( select PR.KOPR, (case when patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))>0 then substring(rtrim(PR.KOPRTE), 1, len(rtrim(PR.KOPRTE))-patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))) else rtrim(PR.KOPRTE) end) as codigosincolor ';
    set @query +=				'from MAEPR AS PR with (nolock) ) '; 
    set @query += 'select PR.KOPR as codigo,PR.KOPRTE as codigotec,';
    set @query +=         '( case ';
    set @query +=         ' when exists ( select * from ktp_images_caltex as im where im.img = rtrim(PR.KOPRTE) ) then rtrim(PR.KOPRTE) ';
    set @query +=         ' when exists ( select * from ktp_images_caltex as im where im.img = rtrim(img.codigosincolor) ) then rtrim(img.codigosincolor) ';
    set @query +=         ' else ''no-img'' end ) as codigoimagen,';
    set @query +=         'PR.NOKOPR AS descripcion,PR.UD01PR as unidad1, PR.RLUD as rtu,';
    set @query +=         'COALESCE(BO.STFI1,0) as fisico_ud1,';
    set @query +=         'coalesce(BO.STOCNV1,  0) as pendiente_ud1,';
    set @query +=         'coalesce(BO.STOCNV1C, 0) as porllegar_ud1, coalesce(BO.STOCNV2C,0) as porllegar_ud2,';
    set @query +=         'COALESCE(BO.STFI1,0)-coalesce(BO.STOCNV1,0)+coalesce(BO.STOCNV1C,0) as saldo_ud1,';
    set @query +=         'coalesce( (select top 1 cast(1 as bit) from MAEDDO as ddo with (nolock) WHERE ddo.EMPRESA='+char(39)+@empresa+char(39)+' and ddo.KOPRCT=PR.KOPR and ddo.TIDO='+char(39)+@occ+char(39)+' and ddo.CAPRCO1-ddo.CAPRAD1-ddo.CAPREX1>0),cast(0 as bit) ) as concompras,';
    set @query +=         'BO.KOSU as sucursal,'+char(39)+@bodega+char(39)+' as bodega,( select TB.NOKOBO from TABBO AS TB with (nolock) where TB.KOBO='+char(39)+@bodega+char(39)+' ) as nombrebodega,';
    set @query +=         'L.PP01UD as precio ,round((L.PP01UD-(L.PP01UD*L.DTMA01UD/100)),0) as preciomayor ,L.DTMA01UD as descuentomax ,round(L.PP01UD*L.DTMA01UD/100,0) as dsctovalor ,';
    set @query +=         'upper((case when patindex(''%#%'',reverse(rtrim(L.EDTMA01UD)))>0 then substring(rtrim(L.EDTMA01UD), 1, len(rtrim(L.EDTMA01UD))-patindex(''%#%'',reverse(rtrim(L.EDTMA01UD)))) else rtrim(L.EDTMA01UD) end)) as ecu_max1, ';
    set @query +=         'coalesce(MA.NOKOMR,'+char(39)+''+char(39)+') as marca,coalesce(SF.NOKOFM,'+char(39)+''+char(39)+') as superfam,';
    set @query +=         '(case when TL.MELT='+char(39)+@letraN+char(39)+' then '+char(39)+@neto+char(39)+' else '+char(39)+@bruto+char(39)+' end) as tipolista,TL.MELT as metodolista,'+char(39)+@listapre+char(39)+' as listaprecio, ';
    set @query +=         'cast(0 as decimal(18,3)) as metros, ';
    set @query +=         'cast(0 as decimal(18,3)) as rollos, ';
    set @query +=         'cast(0 as decimal(18,3)) as precioxmetro ';
    set @query += 'FROM MAEPR         AS PR  WITH (NOLOCK) ';
    set @query += 'inner join MAEPREM AS ME  WITH (NOLOCK) on PR.KOPR=ME.KOPR and ME.EMPRESA='+char(39)+@empresa+char(39)+' ';
    set @query += 'inner join images  AS img WITH (NOLOCK) on PR.KOPR=img.KOPR ';
    set @query += 'left  join MAEST   AS BO  WITH (NOLOCK) on BO.KOBO='+char(39)+@bodega+char(39)+' AND BO.KOPR = PR.KOPR ';
    set @query += 'left  join TABPRE  AS L   with (nolock) on L.KOLT='+char(39)+@listapre+char(39)+' AND L.KOPR=PR.KOPR ';
    set @query += 'left  join TABPP   AS TL  with (nolock) on L.KOLT=TL.KOLT ';
    set @query += 'left  join TABMR   AS MA  with (nolock) on MA.KOMR=PR.MRPR ';
    set @query += 'left  join TABFM   AS SF  with (nolock) on SF.KOFM=PR.FMPR ';
	--
	set @query = concat( @query, ' WHERE PR.KOPR=', char(39)+RTRIM(@codproducto)+char(39) ); 
	--print @query
	EXECUTE sp_executesql @query
	--
END;
go

-- exec ksp_productoconocc_caltex '19V682CVAD50','HIC','02';
IF OBJECT_ID('ksp_productoconocc_caltex', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_productoconocc_caltex;  
GO  
CREATE PROCEDURE ksp_productoconocc_caltex (
    @codproducto	char(13) =  '', 
    @usuario		char(3)  =  '',
	@empresa		char(2)  =	'' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON
 
    declare @bodega			char(3),
            @sucursal		char(3),
            @listapre		char(3),
	        @query			NVARCHAR(max) = '',
            @letraN			char(1) = 'N',
            @neto			char(5) = 'Neto ',
            @bruto			char(5) = 'Bruto',
			@occ			char(3)	= 'OCC';

	declare @docdecompra	varchar(250)	= '('+char(39)+'FCC'+char(39)+','+char(39)+'GRC'+char(39)+','+char(39)+'GRI'+char(39)+','+char(39)+'GRD'+char(39)+','+char(39)+'NCC'+char(39)+','+char(39)+'FCT'+char(39)+','+char(39)+'GRP'+char(39)+')),cast(0 as bit)';
 
 	select @bodega=EBODEGA,@sucursal=ESUCURSAL,@listapre=substring(ELISTAVEN,6,3)
	from CONFIEST with (nolock) 
	where EMPRESA	= @empresa
	  and MODALIDAD = (select MODALIDAD 
					   from TABFU with (nolock) 
					   where KOFU = @usuario ) ;
	--
	select	ddo.NUDO as numero,
			(ddo.CAPRCO1-ddo.CAPRAD1-ddo.CAPREX1) as pendiente_ud1,
			edo.FEEMDO as fechaemision,
			ddo.FEERLI as fechallegada,
			datediff( dd, getdate(), ddo.FEERLI ) as dias
	from MAEDDO as ddo with (nolock) 
	inner join MAEEDO as edo with (nolock) on edo.IDMAEEDO = ddo.IDMAEEDO
	WHERE ddo.EMPRESA=@empresa 
	  and ddo.KOPRCT=@codproducto 
	  and ddo.TIDO='OCC' 
	  and ddo.CAPRCO1-ddo.CAPRAD1-ddo.CAPREX1>0
	--
END;
go


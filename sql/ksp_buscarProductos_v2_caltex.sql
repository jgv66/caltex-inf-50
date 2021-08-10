
/*
exec ksp_buscarProductos_v2_caltex '','ZAPATILLA DAMA NW WHITE','001','01P','','','','','',20,false,false,false,'02','NRP','' ;
exec ksp_buscarProductos_v2_caltex '','ZAPATILLA DAMA NW WHITE','001','01P','','','','','',40,false,false,false,'02','NRP','' ;
*/

IF OBJECT_ID('ksp_buscarProductos_v2_caltex', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_buscarProductos_v2_caltex;  
GO  
CREATE PROCEDURE ksp_buscarProductos_v2_caltex (
    @codproducto   varchar(13)   =  '', 
    @descripcion   varchar(50)   =  '',
    @bodega        char(3)       =  '',
    @listapre      char(3)       =  '',
    @superfam      varchar(100)  =  '',
    @familias      varchar(100)  =  '',
    @rubros		   varchar(100)  =  '',
    @marcas		   varchar(100)  =  '',	
    @ordenar       varchar(50)   =  'codigo',
    @offset        int           =  0 ,   
    @soloconstock  bit           =  0 ,
    @soloconprecio bit           =  0 ,
    @soloconocc    bit           =  0 ,
    @empresa	   char(2)       =  '01',	
    @usuario       char(3)       =  '',
    @cliente	   char(13)		 =  '' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON
 
    declare @kodigo     varchar(60);
    declare @descri     varchar(2500);
    declare @xbodega    char(3);
    declare @xlistapre  char(3);
    declare @xempresa   char(2);
    declare @xusuario   char(3);
    declare @sucursal	char(3);
    declare @query      NVARCHAR(max) = '';
    declare @xnokopr    varchar(3500)  = '';
    declare @xkopr      varchar(300)   = '';
    declare @letraN     char(1)        = 'N';
    declare @neto       char(5)        = 'Neto ';
    declare @bruto      char(5)        = 'Bruto';
    declare @paginar	varchar(150)   = '';	

    declare @xsuperfam		varchar(400) = '';
    declare @xfamilia		varchar(400) = '';
    declare @xrubros		varchar(400) = '';
    declare @xmarcas		varchar(400) = '';

    declare @stock			varchar(800) = '';
    declare @soloimportados varchar(800) = ''; 
    declare @soloconprecios varchar(800) = '';

    declare @solodesplegar	varchar(60)		= '';
    declare @occ			char(3)			= 'OCC';
    declare @xorden			varchar(250)	= ' ORDER BY PR.KOPRTE ';
    declare @docdecompra	varchar(250)	= '('+char(39)+'FCC'+char(39)+','+char(39)+'GRC'+char(39)+','+char(39)+'GRI'+char(39)+','+char(39)+'GRD'+char(39)+','+char(39)+'NCC'+char(39)+','+char(39)+'FCT'+char(39)+','+char(39)+'GRP'+char(39)+')),cast(0 as bit)';
    declare @dsctocli decimal(18,5) = 0;
 
    set @codproducto    = RTRIM(@codproducto);
    set @descripcion    = RTRIM(@descripcion);
    set @xbodega        = RTRIM(@bodega);
    set @xlistapre      = RTRIM(@listapre);
    set @xempresa		= RTRIM(@empresa);
    set @xusuario		= RTRIM(@usuario);
	--
	if ( @cliente <> '' ) begin
		select @dsctocli=DSCTOCLI from PDIMCLI with (nolock) WHERE CODIGO=@cliente ;
	end;
	--
	select @sucursal = KOSU from TABBO with (nolock) where EMPRESA=@empresa AND KOBO = @bodega;
	--
	set @query += 'with precios ';
	set @query += 'as ( select L.KOPR,TL.MELT,(case when TL.MELT='+char(39)+@letraN+char(39)+' then '+char(39)+@neto+char(39)+' else '+char(39)+@bruto+char(39)+' end) as tipolista,';
	set @query +=             'L.PP01UD,L.DTMA01UD,L.EDTMA01UD,';
	set @query +=					    'L.PP02UD,L.DTMA02UD,L.EDTMA02UD ';
	set @query +=				'from TABPRE  AS L with (nolock) ';
	set @query +=				'inner join TABPP TL  with (nolock) on L.KOLT=TL.KOLT ';
	set @query +=				'where L.KOLT='+char(39)+@listapre+char(39)+' ),';
  set @query += 'images ';
  set @query += 'as ( select PR.KOPR, (case when patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))>0 then substring(rtrim(PR.KOPRTE), 1, len(rtrim(PR.KOPRTE))-patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))) else rtrim(PR.KOPRTE) end) as codigosincolor ';
  set @query +=				'from MAEPR AS PR with (nolock) ) ';
	set @query += 'select PR.KOPR as codigo,PR.KOPRTE as codigotec,';
	set @query +=         '( case ';
	set @query +=         ' when exists ( select * from ktp_images_caltex as im where im.img = rtrim(PR.KOPRTE) ) then rtrim(PR.KOPRTE) ';
	set @query +=         ' when exists ( select * from ktp_images_caltex as im where im.img = rtrim(img.codigosincolor) ) then rtrim(img.codigosincolor) ';
	set @query +=         ' else ''no-img'' end ) as codigosincolor,';
  set @query +=         'rtrim(PR.NOKOPR) AS descripcion,PR.UD01PR as unidad1, PR.RLUD as rtu,';
  set @query +=         'COALESCE(BO.STFI1,0) as fisico_ud1,';
	set @query +=         'coalesce(BO.STOCNV1,  0) as pendiente_ud1, ';
	set @query +=         'coalesce(BO.STOCNV1C, 0) as porllegar_ud1, ';
	set @query +=         'COALESCE(BO.STFI1,0)-coalesce(BO.STOCNV1,0)+coalesce(BO.STOCNV1C,0) as saldo_ud1,';
  set @query +=         '0.0 as apedir,';
	set @query +=         'coalesce( (select top 1 cast(1 as bit) from MAEDDO as ddo with (nolock) WHERE ddo.EMPRESA='+char(39)+@empresa+char(39)+' and ddo.KOPRCT=PR.KOPR and ddo.TIDO='+char(39)+@occ+char(39)+' and ddo.CAPRCO1-ddo.CAPRAD1-ddo.CAPREX1>0),cast(0 as bit) ) as concompras,';
  set @query +=         'BO.KOSU as sucursal,'+char(39)+@bodega+char(39)+' as bodega,( select rtrim(TB.NOKOBO) from TABBO AS TB with (nolock) where TB.KOBO='+char(39)+@bodega+char(39)+' ) as nombrebodega,';
  set @query +=         'L.PP01UD as precio ,round((L.PP01UD-(L.PP01UD*L.DTMA01UD/100)),0) as preciomayor ,L.DTMA01UD as descuentomax ,round(L.PP01UD*L.DTMA01UD/100,0) as dsctovalor ,';
  set @query +=         'upper((case when patindex(''%#%'',reverse(rtrim(L.EDTMA01UD)))>0 then substring(rtrim(L.EDTMA01UD), 1, len(rtrim(L.EDTMA01UD))-patindex(''%#%'',reverse(rtrim(L.EDTMA01UD)))) else rtrim(L.EDTMA01UD) end)) as ecu_max1, ';
  set @query +=         char(39)+'1'+char(39)+' as ud_venta,0.0 as montolinea, ' + CAST( @dsctocli as varchar(20) ) + ' as dsctovend,';
  set @query +=         'coalesce(MA.NOKOMR,'+char(39)+''+char(39)+') as marca,';
  set @query +=         'coalesce(SF.NOKOFM,'+char(39)+''+char(39)+') as superfam,';
  set @query +=         'L.tipolista,L.MELT as metodolista,'+char(39)+@xlistapre+char(39)+' as listaprecio ';
  set @query += 'FROM MAEPR         AS PR  WITH (NOLOCK) ';
  set @query += 'inner join MAEPREM AS ME  WITH (NOLOCK) on PR.KOPR=ME.KOPR and ME.EMPRESA='+char(39)+@empresa+char(39)+' ';
  set @query += 'inner join images  AS img WITH (NOLOCK) on PR.KOPR=img.KOPR ';
  set @query += 'left  join MAEST   AS BO  WITH (NOLOCK) on BO.EMPRESA='+char(39)+@empresa+char(39)+' and BO.KOSU='+char(39)+@sucursal+char(39)+' AND BO.KOBO='+char(39)+@bodega+char(39)+' AND BO.KOPR = PR.KOPR ';
  set @query += 'left  join precios AS L   with (nolock) on L.KOPR=PR.KOPR ';
  set @query += 'left  join TABMR   AS MA  with (nolock) on MA.KOMR=PR.MRPR ';
  set @query += 'left  join TABFM   AS SF  with (nolock) on SF.KOFM=PR.FMPR ';
 
  if @superfam<>''    set @xsuperfam      = ' AND PR.FMPR IN ('+char(39)+ replace(@superfam,',',char(39)+','+char(39)) +char(39)+') ';
  if @familias<>''    set @xfamilia       = ' AND PR.PFPR IN ('+char(39)+ replace(@familias,',',char(39)+','+char(39)) +char(39)+') ';
  if @rubros<>''      set @xrubros        = ' AND PR.RUPR IN ('+char(39)+ replace(@rubros,',',char(39)+','+char(39)) +char(39)+') ';
  if @marcas<>''      set @xmarcas        = ' AND PR.MRPR IN ('+char(39)+ replace(@marcas,',',char(39)+','+char(39)) +char(39)+') ';

  if @soloconstock=1  set @stock		    = ' AND COALESCE(BO.STFI1,0)-coalesce(BO.STOCNV1,0)+coalesce(BO.STOCNV1C,0) > 0 ';
	if @soloconocc=1    set @soloimportados = ' AND coalesce(BO.STOCNV1C, 0) > 0 ';  
	if @soloconprecio=1 set @soloconprecios = ' AND coalesce(L.PP01UD, 0) > 0 ';
	
	set @solodesplegar	= ''; 
	set @paginar		= ' OFFSET '+rtrim(cast(@offset as varchar(5)))+' ROWS FETCH NEXT 20 ROWS ONLY; ';

    if @ordenar='codigo'            set @xorden = ' ORDER BY PR.KOPRTE ';
    if @ordenar='descripcion'       set @xorden = ' ORDER BY PR.NOKOPR ';
    if @ordenar='preciomenormayor'  set @xorden = ' ORDER BY preciomayor ASC ,PR.KOPRTE ';
    if @ordenar='preciomayormenor'  set @xorden = ' ORDER BY preciomayor DESC,PR.KOPRTE ';
    if @ordenar='stockmenormayor'   set @xorden = ' ORDER BY saldo_ud1 ASC ,PR.KOPRTE ';
    if @ordenar='stockmayormenor'   set @xorden = ' ORDER BY saldo_ud1 DESC,PR.KOPRTE ';

    -- pasadas por ksp_cambiatodo
    exec ksp_cambiatodo @descripcion, @salida = @descri OUTPUT ;
    set @descri = case when @descri<>'' then @descri else '' end;
    set @kodigo = case when @codproducto<>'' then @codproducto else '' end;

    if ( @xsuperfam<>'' or @xfamilia<>'' or @xrubros<>'' or @xmarcas<>'' ) and ( @descri='' and @kodigo='' ) -- solo superfamilia
    begin
		if @xsuperfam<>'' 
		begin
			set @xsuperfam = replace( @xsuperfam, ' AND ', ' ' ); 
			set @query = concat( @query, ' WHERE ', @xsuperfam, @xfamilia, @xrubros, @xmarcas, @solodesplegar, @stock, @soloimportados, @soloconprecios, @xorden, @paginar ); 
		end
		else
		begin 
			if @xfamilia<>'' 
			begin
				set @xfamilia = replace( @xfamilia, ' AND ', ' ' ); 
				set @query = concat( @query, ' WHERE ', @xfamilia, @xsuperfam, @xrubros, @xmarcas, @solodesplegar, @stock, @soloimportados, @soloconprecios, @xorden, @paginar ); 
			end
			else
			begin
				if @xrubros<>'' 
				begin
					set @xrubros = replace( @xrubros, ' AND ', ' ' ); 
					set @query = concat( @query, ' WHERE ', @xrubros, @xsuperfam, @xfamilia, @xmarcas, @solodesplegar, @stock, @soloimportados, @soloconprecios, @soloconprecios, @xorden, @paginar ); 
				end
				else
				begin
					set @xmarcas = replace( @xmarcas, ' AND ', ' ' ); 
					set @query = concat( @query, ' WHERE ', @xmarcas, @xsuperfam, @xfamilia, @xrubros, @solodesplegar, @stock, @soloimportados, @soloconprecios, @xorden, @paginar ); 
				end
			end
		end
        EXECUTE sp_executesql @query
    end
    else
    begin
        if @descri<>'' and @kodigo<>''                  -- ambos con datos
        begin
			--exec ksp_TipoGoogle 'PR.KOPRTE', @kodigo, @salida = @xkopr   output;
			exec ksp_TipoGoogle 'PR.NOKOPR', @descri, @salida = @xnokopr output;
			set @xkopr   += CONCAT( ' charIndex( upper(', char(39)+LTRIM(RTRIM(@kodigo))+char(39), '),', 'upper(PR.KOPRTE)',' )>0 ' );
			--set @xnokopr += CONCAT( ' charIndex( upper(', char(39)+LTRIM(RTRIM(@descri))+char(39), '),', 'upper(PR.NOKOPR)',' )>0 ' );
			--
			set @query = concat( @query, ' WHERE ', @xkopr, ' AND ',  @xnokopr, @solodesplegar, @stock, @xsuperfam, @xfamilia, @xrubros, @xmarcas, @soloimportados, @soloconprecios, @xorden, @paginar ); 
			print @query;
			EXECUTE sp_executesql @query
        end
        else
        begin
            if @descri<>'' and @kodigo=''               -- solo descripcion con datos
            begin
                exec ksp_TipoGoogle 'PR.NOKOPR',@descri, @salida = @xnokopr output;
				--set @xnokopr += CONCAT( ' charIndex( upper(', char(39)+LTRIM(RTRIM(@descri))+char(39), '),', 'upper(PR.NOKOPR)',' )>0 ' );
                set @query = concat( @query, ' WHERE ', @xnokopr, @solodesplegar, @stock, @xsuperfam, @xfamilia, @xrubros, @xmarcas, @soloimportados, @soloconprecios, @xorden, @paginar ); 
				print @query;
                EXECUTE sp_executesql @query
            end         
        else
        begin 
            if @descri='' and @kodigo<>''               -- solo codigo con datos
            begin
                --exec ksp_TipoGoogle 'PR.KOPRTE',@kodigo, @salida = @xkopr output;
				set @xkopr += CONCAT( ' charIndex( upper(', char(39)+LTRIM(RTRIM(@kodigo))+char(39), '),', 'upper(PR.KOPRTE)',' )>0 ' );
                set @query = concat( @query, ' WHERE ', @xkopr, @solodesplegar, @stock, @xsuperfam, @xfamilia, @xrubros, @xmarcas, @soloimportados, @soloconprecios, @xorden, @paginar ); 
				print @query;
                EXECUTE sp_executesql @query
            end 
        end
    end 
	end
END
go



-- exec ksp_buscarProductos_v8_caltex '','GRIS','001',20,'01P',true,'preciomenormayor','','','','',0,'02','ZOP';
IF OBJECT_ID('ksp_buscarProductos_v8_caltex', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_buscarProductos_v8_caltex;  
GO  
CREATE PROCEDURE ksp_buscarProductos_v8_caltex (
    @codproducto  varchar(13)   =  '', 
    @descripcion  varchar(50)   =  '',
    @bodega       char(3)       =  '',
    @offset       int           =  0 ,   
    @listapre     char(3)       =  '',
    @soloconstock bit           =  0 ,
    @ordenar      varchar(50)   =  '',
	@superfam     varchar(100)  =  '',
	@familias     varchar(100)  =  '',
	@rubros		  varchar(100)  =  '',
	@marcas		  varchar(100)  =  '',	
	@soloimport   bit           =  0 ,
	@empresa	  char(2)       =  '01',	
	@usuario      char(3)       =  '' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON
 
    declare @kodigo     varchar(60);
    declare @descri     varchar(2500);
    declare @xbodega    char(3);
    declare @xlistapre  char(3);
    declare @query      NVARCHAR(3500) = '';
    declare @xnokopr    varchar(3500) = '';
    declare @xkopr      varchar(200)  = '';
    declare @letraN     char(1)       = 'N';
    declare @neto       char(5)       = 'Neto ';
    declare @bruto      char(5)       = 'Bruto';
    declare @stock      varchar(250)  = '';
    declare @xorden     varchar(250)  = ' ORDER BY PR.KOPR ';
	declare @xempresa   char(2);
	declare @xusuario   char(3);
	declare @paginar	varchar(100) = '';	

	declare @xsuperfam		varchar(500) = '';
	declare @xfamilia		varchar(500) = '';
	declare @xrubros		varchar(500) = '';
	declare @xmarcas		varchar(500) = '';
	declare @soloimportados varchar(500) = ''; 
	declare @campoimportado varchar(500) = '0 as importado,';
 
    set @codproducto    = RTRIM(@codproducto);
    set @descripcion    = RTRIM(@descripcion);
    set @xbodega        = RTRIM(@bodega);
    set @xlistapre      = RTRIM(@listapre);
	set @xempresa		= RTRIM(@empresa);
	set @xusuario		= RTRIM(@usuario);
 
    if @soloimport=1 set @campoimportado = '0 as importado,';  

	set @query += 'with ';
	set @query += 'PENDIENTE as ( select KOPRCT,sum(CAPRCO1-CAPRAD1+CAPREX1) as pendi_ud1 from MAEDDO with (nolock) WHERE EMPRESA='+char(39)+@empresa+char(39)+' and TIDO='+char(39)+'NVV'+char(39)+' AND FEEMLI>'+char(39)+'20171231'+char(39)+' and BOSULIDO='+char(39)+@bodega+char(39)+' and CAPRCO1<>CAPRAD1+CAPREX1 GROUP BY KOPRCT ),';
	set @query += 'PORLLEGAR as ( select KOPRCT,sum(CAPRCO1-CAPRAD1+CAPREX1) as llega_ud1 from MAEDDO with (nolock) WHERE EMPRESA='+char(39)+@empresa+char(39)+' and TIDO='+char(39)+'OCC'+char(39)+' AND FEEMLI>'+char(39)+'20171231'+char(39)+' and BOSULIDO='+char(39)+@bodega+char(39)+' and CAPRCO1<>CAPRAD1+CAPREX1 GROUP BY KOPRCT ) ';
    set @query += 'select PR.KOPRTE as codigo,PR.NOKOPR AS descripcion, ';
    set @query +=         '0 as stock_total_ud1,';  /* no usado en caltex */
    set @query +=         '0 as stock_total_ud2,';  /* no usado en caltex */
    set @query +=         'COALESCE(BO.STFI1,0) as stock_ud1,';
    set @query +=         'COALESCE(BO.STFI2,0) as stock_ud2,';
	set @query +=         'coalesce(PEN.pendi_ud1, 0) as pendiente_ud1, coalesce(PEN.pendi_ud1, 0)/PR.RLUD as pendiente_ud2,';
	set @query +=         'coalesce(LLE.llega_ud1, 0) as porllegar_ud1, coalesce(LLE.llega_ud1, 0)/PR.RLUD as porllegar_ud2,';
	set @query +=         'COALESCE(BO.STFI1,0)- coalesce(PEN.pendi_ud1, 0)         + coalesce(LLE.llega_ud1, 0)          as saldo_ud1,';
	set @query +=         'COALESCE(BO.STFI2,0)-(coalesce(PEN.pendi_ud1, 0)/PR.RLUD)+(coalesce(LLE.llega_ud1, 0)/PR.RLUD) as saldo_ud2,';
    set @query +=         '(case when BO.KOSU is null then 0 else 1 end) as apedir,'+@campoimportado;
    set @query +=         'BO.KOSU as sucursal,'+char(39)+@bodega+char(39)+' as bodega,( select TB.NOKOBO from TABBO AS TB where TB.KOBO='+char(39)+@bodega+char(39)+' ) as nombrebodega,';
    set @query +=         'L.PP01UD as precio,round((L.PP01UD-(L.PP01UD*L.DTMA01UD/100)),0) as preciomayor,0.0 as montolinea,L.DTMA01UD as descuentomax,round(L.PP01UD*L.DTMA01UD/100,0) as dsctovalor,';
    set @query +=         '(case when TL.MELT='+char(39)+@letraN+char(39)+' then '+char(39)+@neto+char(39)+' else '+char(39)+@bruto+char(39)+' end) as tipolista,TL.MELT as metodolista,'+char(39)+@xlistapre+char(39)+' as listaprecio ';
    set @query += 'FROM MAEPR           AS PR  WITH (NOLOCK) ';
    set @query += 'inner join MAEPREM   AS ME  WITH (NOLOCK) on PR.KOPR=ME.KOPR and ME.EMPRESA='+char(39)+@empresa+char(39)+' ';
    set @query += 'left  join MAEST     AS BO  WITH (NOLOCK) ON BO.KOBO='+char(39)+@bodega+char(39)+' AND BO.KOPR = PR.KOPR ';
    set @query += 'left  join TABPRE    AS L   with (nolock) ON L.KOLT='+char(39)+@xlistapre+char(39)+' AND L.KOPR=PR.KOPR ';
    set @query += 'left  join TABPP     AS TL  with (nolock) ON L.KOLT=TL.KOLT ';
    set @query += 'left  join PENDIENTE AS PEN with (nolock) ON PEN.KOPRCT=PR.KOPR ';
    set @query += 'left  join PORLLEGAR AS LLE with (nolock) ON LLE.KOPRCT=PR.KOPR ';
 
    if @soloconstock=1  set @stock		    = ' AND COALESCE(BO.STFI1,0)-coalesce(PEN.pendi_ud1, 0)+coalesce(LLE.llega_ud1, 0) > 0 ';
    if @superfam<>''    set @xsuperfam      = ' AND PR.FMPR IN ('+char(39)+ replace(@superfam,',',char(39)+','+char(39)) +char(39)+') ';
    if @familias<>''    set @xfamilia       = ' AND PR.PFPR IN ('+char(39)+ replace(@familias,',',char(39)+','+char(39)) +char(39)+') ';
    if @rubros<>''      set @xrubros        = ' AND PR.RUPR IN ('+char(39)+ replace(@rubros,',',char(39)+','+char(39)) +char(39)+') ';
    if @marcas<>''      set @xmarcas        = ' AND PR.MRPR IN ('+char(39)+ replace(@marcas,',',char(39)+','+char(39)) +char(39)+') ';
	if @soloimport=1    set @soloimportados = '';  

	set @paginar = ' OFFSET '+rtrim(cast(@offset as varchar(5)))+' ROWS FETCH NEXT 20 ROWS ONLY; ';

    if @ordenar=''                  set @xorden = ' ORDER BY PR.KOPR ';
    if @ordenar='preciomenormayor'  set @xorden = ' ORDER BY preciomayor ASC ,PR.KOPR ';
    if @ordenar='preciomayormenor'  set @xorden = ' ORDER BY preciomayor DESC,PR.KOPR ';
    if @ordenar='stockmenormayor'   set @xorden = ' ORDER BY stock_ud1 ASC ,PR.KOPR ';
    if @ordenar='stockmayormenor'   set @xorden = ' ORDER BY stock_ud1 DESC,PR.KOPR ';

    -- pasadas por ksp_cambiatodo
    exec ksp_cambiatodo @codproducto, @salida = @kodigo OUTPUT ;
    exec ksp_cambiatodo @descripcion, @salida = @descri OUTPUT ;
 
    set @kodigo = case when @kodigo<>'' then @kodigo else '' end;
    set @descri = case when @descri<>'' then @descri else '' end;

    if ( @xsuperfam<>'' or @xfamilia<>'' or @xrubros<>'' or @xmarcas<>'' ) and ( @descri='' and @kodigo='' ) -- solo superfamilia
    begin
		if @xsuperfam<>'' 
		begin
			set @xsuperfam = replace( @xsuperfam, ' AND ', ' ' ); 
			set @query = concat( @query, ' WHERE ', @xsuperfam, @xfamilia, @xrubros, @xmarcas, @stock, @soloimportados, @xorden, @paginar ); 
		end
		else
		begin 
			if @xfamilia<>'' 
			begin
				set @xfamilia = replace( @xfamilia, ' AND ', ' ' ); 
				set @query = concat( @query, ' WHERE ', @xfamilia, @xsuperfam, @xrubros, @xmarcas, @stock, @soloimportados, @xorden, @paginar ); 
			end
			else
			begin
				if @xrubros<>'' 
				begin
					set @xrubros = replace( @xrubros, ' AND ', ' ' ); 
					set @query = concat( @query, ' WHERE ', @xrubros, @xsuperfam, @xfamilia, @xmarcas, @stock, @soloimportados, @xorden, @paginar ); 
				end
				else
				begin
					set @xmarcas = replace( @xmarcas, ' AND ', ' ' ); 
					set @query = concat( @query, ' WHERE ', @xmarcas, @xsuperfam, @xfamilia, @xrubros, @stock, @soloimportados, @xorden, @paginar ); 
				end
			end
		end
        EXECUTE sp_executesql @query
    end
    else
    begin
        if @descri<>'' and @kodigo<>''                  -- ambos con datos
        begin
			exec ksp_TipoGoogle 'PR.KOPR',  @kodigo, @salida = @xkopr   output;
			exec ksp_TipoGoogle 'PR.NOKOPR',@descri, @salida = @xnokopr output;
			set @query = concat( @query, ' WHERE ', @xkopr, ' AND ',  @xnokopr, @stock, @xsuperfam, @xfamilia, @xrubros, @xmarcas, @soloimportados, @xorden, @paginar ); 
print 1
print @query
			EXECUTE sp_executesql @query
        end
        else
        begin
            if @descri<>'' and @kodigo=''               -- solo descripcion con datos
            begin
                exec ksp_TipoGoogle 'PR.NOKOPR',@descri, @salida = @xnokopr output;
                set @query = concat( @query, ' WHERE ', @xnokopr, @stock, @xsuperfam, @xfamilia, @xrubros, @xmarcas, @soloimportados, @xorden, @paginar ); 
print 2
print @query
                EXECUTE sp_executesql @query
            end         
        else
        begin 
            if @descri='' and @kodigo<>''               -- solo codigo con datos
            begin
                exec ksp_TipoGoogle 'PR.KOPR',@kodigo, @salida = @xkopr output;
                set @query = concat( @query, ' WHERE ', @xkopr, @stock, @xsuperfam, @xfamilia, @xrubros, @xmarcas, @soloimportados, @xorden, @paginar ); 
print 3
print @query
                EXECUTE sp_executesql @query
            end 
        end
    end 
	end
END
go

 

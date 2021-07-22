-- exec ksp_stockprod_caltex '04','','amalfi','','','','CODIGO',0,'si','no','no','RVV', '' ;

-- exec ksp_stockprod_caltex '02','8f','','','','','',0,'si','si','no','HIC','' ;
-- exec ksp_stockprod_caltex '04','ama','','','','','CODIGO',0,'si','no','no','HIC' ;
-- exec ksp_stockprod_caltex '05','','negro','','','','',0,'si','si','no','HIC', '' ;  
IF OBJECT_ID('ksp_stockprod_caltex', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_stockprod_caltex;  
GO  
CREATE PROCEDURE ksp_stockprod_caltex (
    @empresa		char(2)		 = '', 
    @codproducto	varchar(13)  = '', 
    @descripcion	varchar(50)  = '',
	@superfam		varchar(100) = '',
	@rubros			varchar(100) = '',
	@marcas			varchar(100) = '',	
    @ordenar		varchar(50)  = 'codigo',
    @offset			int          = 0 ,   
    @soloconstock	char(2)      = 'no' ,
    @soloconprecio	char(2)      = 'no' ,
    @soloconocc		char(2)      = 'no' ,
	@usuario		char(3)      = '',
	@2excel			varchar(3)	 = '' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON
 
    declare @kodigo			varchar(60)		= @codproducto,
			@descri			varchar(2500)	= @descripcion,
			@xbodega		char(3),
			@xsucursal		char(3),
			@xlistapre		char(3),
			@xempresa		char(2) = @empresa,
			@xusuario		char(3) = @usuario,
			@query			NVARCHAR(max) = '',
			@xnokopr		varchar(3500)  = '',
			@xkopr			varchar(300)   = '',
			@occ			char(3)        = 'OCC',
			@neto			char(5)        = 'Neto ',
			@bruto			char(5)        = 'Bruto',
			@paginar		varchar(150)   = '',	
	        @xsuperfam		varchar(400) = '',
			@xrubros		varchar(400) = '',
			@xmarcas		varchar(400) = '',
            @stock			varchar(800) = '',
			@precio			varchar(800) = '',
			@conocc			varchar(800) = '',
			@xorden			varchar(250) = ' ORDER BY PR.KOPRTE ',
			@docdecompra	varchar(250) = '('+char(39)+'FCC'+char(39)+','+char(39)+'GRC'+char(39)+','+char(39)+'GRI'+char(39)+','+char(39)+'GRD'+char(39)+','+char(39)+'NCC'+char(39)+','+char(39)+'FCT'+char(39)+','+char(39)+'GRP'+char(39)+')),cast(0 as bit)';

	-- sacar datos de la  modalidad
	select	@xbodega=EBODEGA,@xsucursal=ESUCURSAL,@xlistapre=substring(ELISTAVEN,6,3)
	from CONFIEST with (nolock) 
	where @xempresa=EMPRESA
	  and MODALIDAD = (select MODALIDAD 
					   from TABFU with (nolock) 
					   where KOFU = @usuario ) ;

    set @codproducto    = RTRIM(@codproducto);
    set @descripcion    = RTRIM(@descripcion);
	set @xusuario		= RTRIM(@usuario);
 
    set @query +=  'select PR.KOPR as codigo,PR.KOPRTE as codigotec,';
	set @query +=         '(case when patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))>0 then substring(rtrim(PR.KOPRTE), 1, len(rtrim(PR.KOPRTE))-patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))) else rtrim(PR.KOPRTE) end) as codigosincolor,';
	set @query +=         '(case when patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))>0 then substring(rtrim(PR.KOPRTE), 1, len(rtrim(PR.KOPRTE))-patindex(''%-%'',reverse(rtrim(PR.KOPRTE)))) else rtrim(PR.KOPRTE) end) as codigoimagen,';
    set @query +=         'PR.NOKOPR AS descripcion,coalesce(OB.MENSAJE03,'''') as distribucion,';
	set @query +=         'L.PP01UD as precio,PR.RLUD as rtu,';
    set @query +=         'COALESCE(BO.STFI1,0) as fisico_ud1,';
	set @query +=         'coalesce(BO.STOCNV1,  0) as pendiente_ud1,';
	set @query +=         'coalesce(BO.STOCNV1C, 0) as porllegar_ud1,';
	set @query +=         'COALESCE(BO.STFI1,0)-coalesce(BO.STOCNV1,0)+coalesce(BO.STOCNV1C,0) as saldo_ud1,';
	set @query +=         'cast(0 as decimal(18,3)) as metros, ';
	set @query +=         'cast(0 as decimal(18,3)) as rollos, ';
	set @query +=         'cast(0 as decimal(18,3)) as precioxmetro ';
    set @query += 'FROM MAEPR          AS PR  WITH (NOLOCK) ';
    set @query += 'inner join MAEPREM  AS ME  WITH (NOLOCK) on PR.KOPR=ME.KOPR and ME.EMPRESA='+char(39)+@xempresa+char(39)+' ';
    set @query += 'left  join MAEPROBS AS OB  WITH (NOLOCK) on PR.KOPR=OB.KOPR ';
    set @query += 'left  join MAEST    AS BO  WITH (NOLOCK) on BO.KOBO='+char(39)+@xbodega+char(39)+' AND BO.KOPR = PR.KOPR ';
    set @query += 'left  join TABPRE   AS L   with (nolock) on L.KOLT='+char(39)+@xlistapre+char(39)+' AND L.KOPR=PR.KOPR ';
    if @superfam<>''    set @xsuperfam      = ' AND PR.FMPR IN ('+char(39)+ replace(@superfam,',',char(39)+','+char(39)) +char(39)+') ';
    if @rubros<>''      set @xrubros        = ' AND PR.RUPR IN ('+char(39)+ replace(@rubros,',',char(39)+','+char(39)) +char(39)+') ';
    if @marcas<>''      set @xmarcas        = ' AND PR.MRPR IN ('+char(39)+ replace(@marcas,',',char(39)+','+char(39)) +char(39)+') ';
    if @soloconstock ='si' set @stock	    = ' AND COALESCE(BO.STFI1,0)-coalesce(BO.STOCNV1,0)+coalesce(BO.STOCNV1C,0) > 0 ';
    if @soloconprecio='si' set @precio	    = ' AND COALESCE((select pre.PP01UD from TABPRE as pre with (nolock) where pre.KOPR=PR.KOPR and pre.KOLT='+char(39)+@xlistapre+char(39)+' ),0) > 0 ';
	if @soloconocc	 ='si' set @conocc		= ' AND coalesce( (select top 1 cast(1 as bit) from MAEDDO as ddo with (nolock) WHERE ddo.EMPRESA='+char(39)+@xempresa+char(39)+' and ddo.KOPRCT=PR.KOPR and ddo.TIDO='+char(39)+@occ+char(39)+' and ddo.CAPRCO1-ddo.CAPRAD1-ddo.CAPREX1>0),cast(0 as bit) )>0 ';

	-- si va a excel, va todo
	set @paginar = ' OFFSET '+rtrim(cast(@offset as varchar(5)))+' ROWS FETCH NEXT 60 ROWS ONLY; ';
	if ( @2excel = 'XLS' ) begin
		set @paginar = '';
	end

    if @ordenar='CODIGO'        set @xorden = ' ORDER BY PR.KOPRTE ';
    if @ordenar='DESCRIPCION'   set @xorden = ' ORDER BY PR.NOKOPR ';
    if @ordenar='MARCA'			set @xorden = ' ORDER BY PR.MRPR,PR.KOPRTE ASC ';
    if @ordenar='SUPERFAM'		set @xorden = ' ORDER BY PR.FMPR,PR.KOPRTE ASC ';

    -- pasadas por ksp_cambiatodo
    exec ksp_cambiatodo @codproducto, @salida = @kodigo OUTPUT ;
    exec ksp_cambiatodo @descripcion, @salida = @descri OUTPUT ;
 
    set @kodigo = case when @kodigo<>'' then @kodigo else '' end;
    set @descri = case when @descri<>'' then @descri else '' end;

    if ( @xsuperfam<>'' or @xrubros<>'' or @xmarcas<>'' ) and ( @descri='' and @kodigo='' ) -- solo superfamilia
    begin
		if @xsuperfam<>'' 
		begin
			set @xsuperfam = replace( @xsuperfam, ' AND ', ' ' ); 
			set @query = concat( @query, ' WHERE ', @xsuperfam, @xrubros, @xmarcas, @stock, @precio, @conocc, @xorden, @paginar ); 
		end
		else
		begin 
			if @xrubros<>'' 
			begin
				set @xrubros = replace( @xrubros, ' AND ', ' ' ); 
				set @query = concat( @query, ' WHERE ', @xrubros, @xsuperfam, @xmarcas, @stock, @precio, @conocc, @xorden, @paginar ); 
			end
			else
			begin
				set @xmarcas = replace( @xmarcas, ' AND ', ' ' ); 
				set @query = concat( @query, ' WHERE ', @xmarcas, @xsuperfam, @xrubros, @stock, @precio, @conocc, @xorden, @paginar ); 
			end
		end
		-- print @query;
        EXECUTE sp_executesql @query
    end
    else
    begin
        if @descri<>'' and @kodigo<>''  -- ambos con datos
        begin
			exec ksp_TipoGoogle 'PR.KOPRTE', @kodigo, @salida = @xkopr   output;
			exec ksp_TipoGoogle 'PR.NOKOPR', @descri, @salida = @xnokopr output;
			set @query = concat( @query, ' WHERE ', @xkopr, ' AND ',  @xnokopr, @stock, @precio, @conocc, @xsuperfam, @xrubros, @xmarcas, @xorden, @paginar ); 
			-- print @query;
			EXECUTE sp_executesql @query
        end
        else
        begin
            if @descri<>'' and @kodigo=''  -- solo descripcion trae datos
            begin
                exec ksp_TipoGoogle 'PR.NOKOPR',@descri, @salida = @xnokopr output;
                set @query = concat( @query, ' WHERE ', @xnokopr, @stock, @precio, @conocc, @xsuperfam, @xrubros, @xmarcas, @xorden, @paginar ); 
				-- print @query;
                EXECUTE sp_executesql @query
            end         
        else
        begin 
            if @descri='' and @kodigo<>''  -- solo codigo trae datos
            begin
                exec ksp_TipoGoogle 'PR.KOPRTE',@kodigo, @salida = @xkopr output;
                set @query = concat( @query, ' WHERE ', @xkopr, @stock, @precio, @conocc, @xsuperfam, @xrubros, @xmarcas, @xorden, @paginar ); 
				-- print @query;
                EXECUTE sp_executesql @query
            end 
        end
    end 
	end
END;
go



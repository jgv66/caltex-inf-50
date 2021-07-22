
-- exec ksp_stockprod_caltex_uau '02','"16V0052290","16V00522CA","17I0621T0240","17I11208H11A0"','CODIGO','HIC' ;  
IF OBJECT_ID('ksp_stockprod_caltex_uau', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_stockprod_caltex_uau;  
GO  
CREATE PROCEDURE ksp_stockprod_caltex_uau (
    @empresa		char(2)			= '', 
    @codigos		varchar(3500)	= '', 
    @ordenar		varchar(50)  = 'codigo',
	@usuario		char(3)      = '' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON
 
    declare @xkodigos		varchar(3500),
			@xbodega		char(3),
			@xsucursal		char(3),
			@xlistapre		char(3),
			@xempresa		char(2) = @empresa,
			@xusuario		char(3) = @usuario,
			@query			NVARCHAR(max) = '',
			@occ			char(3)        = 'OCC',
			@neto			char(5)        = 'Neto ',
			@bruto			char(5)        = 'Bruto',
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

	set @xusuario = RTRIM(@usuario);
	SET @xkodigos = replace( @codigos, char(34), char(39) );
	 
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
    set @query += 'left  join MAEST    AS BO  WITH (NOLOCK) on BO.EMPRESA=ME.EMPRESA AND BO.KOBO='+char(39)+@xbodega+char(39)+' AND BO.KOPR = PR.KOPR ';
    set @query += 'left  join TABPRE   AS L   with (nolock) on L.KOLT='+char(39)+@xlistapre+char(39)+' AND L.KOPR=PR.KOPR ';

    if @ordenar='CODIGO'        set @xorden = ' ORDER BY PR.KOPRTE ';
    if @ordenar='DESCRIPCION'   set @xorden = ' ORDER BY PR.NOKOPR ';
    if @ordenar='MARCA'			set @xorden = ' ORDER BY PR.MRPR,PR.KOPRTE ASC ';
    if @ordenar='SUPERFAM'		set @xorden = ' ORDER BY PR.FMPR,PR.KOPRTE ASC ';

	set @query = concat( @query, ' WHERE PR.KOPR in (', @xkodigos,')', @xorden ); 
	-- print @query;
	EXECUTE sp_executesql @query

END;
go



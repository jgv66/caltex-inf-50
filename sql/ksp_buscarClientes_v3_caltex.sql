
-- exec ksp_buscarClientes_v3_caltex 'gonzalez pinche','HIC','02' ;
IF OBJECT_ID('ksp_buscarClientes_v3_caltex', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_buscarClientes_v3_caltex;  
GO  
CREATE PROCEDURE ksp_buscarClientes_v3_caltex (
    @dato	  varchar(50), 
    @usuario  char(3), 
    @empresa  char(2) ) 
With Encryption
AS
BEGIN
 
    SET NOCOUNT ON;
 
    declare @query			NVARCHAR(2500),
			@xkoen			varchar(500),
			@xnokoen		varchar(500),
			@filtrovendedor	varchar(500),
			@kodigo			varchar(200);
	--
    set @dato = RTRIM(@dato);
	--
	set @filtrovendedor = ' AND EN.KOFUEN IN ('''','+char(39)+@usuario+char(39)+') ';
	if ( @usuario in ('HIC') ) begin 
		set @filtrovendedor = '';
	end;
	-- 
    set @query   = 'select top 30 rtrim(EN.KOEN) as codigo,rtrim(EN.SUEN) AS sucursal, rtrim(EN.NOKOEN) as razonsocial,rtrim(EN.DIEN) as direccion,';
	set @query	+=				 'rtrim(cast(cast(EN.RTEN as int) as varchar(8)))+''-''+dbo.kfn_digitoVerificador(cast(RTEN as int )) as rut,';
    set @query  +=               'EN.KOFUEN as vendedor, PP.KOLT as listaprecio,';
    set @query  +=               'rtrim(FU.NOKOFU) as nombrevendedor, rtrim(PP.NOKOLT) as nombrelista,';
    set @query  +=               'rtrim(CI.NOKOCI) as ciudad, rtrim(CM.NOKOCM) as comuna, rtrim(EN.EMAILCOMER) as email,rtrim(EN.FOEN) as telefonos,';
    set @query  +=               '( case when EN.TIPOSUC='+char(39)+'S'+char(39)+' then '+char(39)+'suc'+char(39)+' else '+char(39)+char(39)+' end ) as tiposuc ';
    set @query  += 'FROM MAEEN AS EN WITH (NOLOCK) ';
    set @query  += 'left join TABFU as FU with (nolock) on FU.KOFU=EN.KOFUEN ';
    set @query  += 'left join TABPP as PP with (nolock) on '+char(39)+'TABPP'+char(39)+'+PP.KOLT=EN.LVEN ';
    set @query  += 'left join TABCI as CI with (nolock) on CI.KOPA=EN.PAEN AND CI.KOCI=EN.CIEN ';
    set @query  += 'left join TABCM as CM with (nolock) on CM.KOPA=EN.PAEN AND CM.KOCI=EN.CIEN AND CM.KOCM=EN.CMEN ';
 
    -- pasadas por ksp_cambiatodo
    exec ksp_cambiatodo @dato, @salida = @kodigo OUTPUT ;
    --
    exec ksp_TipoGoogle 'EN.KOEN',  @kodigo, @salida = @xkoen output;
    exec ksp_TipoGoogle 'EN.NOKOEN',@kodigo, @salida = @xnokoen output;
    --
    set @query = concat( @query, ' WHERE ( (', @xkoen, ') OR (',  @xnokoen, ') ) ', @filtrovendedor, ' ORDER BY EN.KOEN ' ); 
	print @query;
    EXECUTE sp_executesql @query
    --
END
GO

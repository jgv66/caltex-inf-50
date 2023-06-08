
-- exec ksp_traeNVVPendientes 'JJG','02', '*','2021-07-01', '2021-07-31';
-- exec ksp_traeNVVPendientes 'JJG','02', 'P','2021-07-01', '2021-07-31';
-- exec ksp_traeNVVPendientes 'JJG','02', 'C','2021-07-01', '2021-07-31';
IF OBJECT_ID('ksp_traeNVVPendientes', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_traeNVVPendientes;  
GO
-- 
CREATE PROCEDURE ksp_traeNVVPendientes (
    @vendedor varchar(3), 
    @empresa  char(2), 
    @estado  char(1) = '*',
    @fechaDesde varchar(10) = '', 
    @fechaHasta varchar(10) = '' ) With Encryption
AS
BEGIN
    --
    SET NOCOUNT ON
	  --
	  declare @Error  nvarchar(250),
			      @ErrMsg nvarchar(2048);
	  --
    if ( @fechaDesde = '' ) begin
        --
	      with documentos 
	      as (select distinct edo.IDMAEEDO as id
		      from MAEEDO as edo with (nolock)
		      inner join MAEDDO as ddo with (nolock) on edo.IDMAEEDO=ddo.IDMAEEDO
		      where edo.EMPRESA= @empresa
			      and edo.TIDO = 'NVV'
			      and edo.ESDO = ( case when @estado = 'P' then ''
								        when @estado = 'C' then 'C'
							            else edo.ESDO
							       end )
			      and ddo.KOFULIDO = @vendedor )
	      select	edo.IDMAEEDO as id
			      ,edo.TIDO as td, edo.NUDO as numero
			      ,convert(varchar(10), edo.FEEMDO, 103 ) as emision
			      ,(case when edo.ESDO='' then 'Pendiente' else 'Cerrada' end) as estado
			      ,rtrim(en.NOKOEN) as cliente
			      ,edo.VABRDO as bruto,edo.VANEDO as neto
	      from MAEEDO as edo with (nolock)
	      inner join documentos as doc on edo.IDMAEEDO=doc.id
	      left join MAEEN as en with (nolock) on en.KOEN = edo. ENDO and en.SUEN = edo.SUENDO
	      order by emision desc,cliente;
    end
    else begin
      with documentos 
	    as (select distinct edo.IDMAEEDO as id
		    from MAEEDO as edo with (nolock)
		    inner join MAEDDO as ddo with (nolock) on edo.IDMAEEDO=ddo.IDMAEEDO
		    where edo.EMPRESA= @empresa
			    and edo.TIDO = 'NVV'
			    and cast(edo.FEEMDO as date) between cast(@fechaDesde as date) and cast(@fechaHasta as date)
			      and edo.ESDO = ( case when @estado = 'P' then ''
										when @estado = 'C' then 'C'
							            else edo.ESDO
							        end )
			    and ddo.KOFULIDO = @vendedor )
	    select	edo.IDMAEEDO as id
			    ,edo.TIDO as td, edo.NUDO as numero
			    ,convert(varchar(10), edo.FEEMDO, 103 ) as emision
			    ,(case when edo.ESDO='' then 'Pendiente' else 'Cerrada' end) as estado
			    ,rtrim(en.NOKOEN) as cliente
			    ,edo.VABRDO as bruto,edo.VANEDO as neto
	    from MAEEDO as edo with (nolock)
	    inner join documentos as doc on edo.IDMAEEDO=doc.id
	    left join MAEEN as en with (nolock) on en.KOEN = edo. ENDO and en.SUEN = edo.SUENDO
	    order by emision desc,cliente;
    end;
	  --
END;
go

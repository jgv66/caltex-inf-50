 
-- exec ksp_traeDocumento 310778 
IF OBJECT_ID('ksp_traeDocumento', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_traeDocumento;  
GO  
CREATE PROCEDURE ksp_traeDocumento (
    @id int = 0 ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON

    select	DDO.BOSULIDO AS bodega, 
			cast(DDO.KOPRCT as varchar(13)) AS codigo,
			(case when DDO.UDTRPR = 1 then DDO.CAPRCO1 else DDO.CAPRCO2 END ) as cantidad,
			DDO.PPPRNE as precio, 
			cast(DDO.NOKOPR as varchar(50)) as descrip,
			DDO.EMPRESA as empresa
    from MAEDDO AS DDO with (nolock)
	left join TABFU as FU with (nolock) ON FU.KOFU=DDO.KOFULIDO
    where DDO.IDMAEEDO = @id
    order by DDO.IDMAEDDO
END;
go

exec ksp_traeImpagos '09055143','02' ;
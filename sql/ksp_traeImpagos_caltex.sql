-- exec ksp_traeImpagos '14726400','01' ;
IF OBJECT_ID('ksp_traeImpagos', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_traeImpagos;  
GO  
CREATE PROCEDURE ksp_traeImpagos (
    @codigo  char(13)   = '', 
    @empresa char(2)    = '' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON
 
    declare @kodigo     char(13);
    declare @xempresa   char(2);
 
    set @kodigo     = RTRIM(@codigo) ;
    set @xempresa   = RTRIM(@empresa);
 
    select top 50 EDO.IDMAEEDO as id,EDO.TIDO,cast(EDO.NUDO as int) as numero,EDO.NUVEDO as cuotas,
           convert( nvarchar(10),EDO.FEEMDO,103) AS emision,
           convert( nvarchar(10),EDO.FE01VEDO,103) AS f1ervenc,
           convert( nvarchar(10),EDO.FEULVEDO,103) AS fultvenc,
           EDO.VABRDO as monto, EDO.VABRDO-EDO.VAABDO as saldo,
           (CASE WHEN EDO.TIDO='BLV' THEN 'Boleta ' ELSE 'Factura' END ) AS tipo,
           rtrim(CAST((CASE WHEN DATEDIFF( dd, getdate(), EDO.FEULVEDO ) >=0 THEN 'por vencer' ELSE 'vencido' END) AS char(10) )) AS estado,
		   DATEDIFF( dd, EDO.FEULVEDO, getdate() ) as dias
    from MAEEDO AS EDO with (nolock)
    left join MAEEN AS EN with (nolock) ON EN.KOEN=EDO.ENDO AND EN.SUEN=EDO.SUENDO
    where EDO.EMPRESA=@xempresa
      and EDO.ENDO=@kodigo
      and EDO.TIDO IN ('FCV','BLV')
      and EDO.ESPGDO='P'
      and EDO.NUDONODEFI = 0
      order by EDO.FEEMDO ASC
END
go




/*
declare @date datetime = '2012-09-01' 
select datepart(day, datediff(day, 0, @date)/7 * 7)/7 + 1 

select top 100 edo.TIDO,edo.NUDO,edo.FEEMDO,
		datepart(ww, edo.FEEMDO ) as semana_sql,
		dbo.kfn_periodoSemana(year(edo.FEEMDO), datepart(ww, edo.FEEMDO ) ) as rango,DATENAME(dw, edo.FEEMDO)
from MAEEDO as edo with (nolock)
where year(edo.FEEMDO)=2019
order by edo.FEEMDO DESC

*/

ALTER FUNCTION [dbo].[kfn_periodoSemana](@Anio AS INT, @SemanaNum AS INT, @Formato as INT)
RETURNS VARCHAR(100)
AS
BEGIN
DECLARE @PeriodoDescripcion AS VARCHAR(100),
		@SemenaFecha		AS DATETIME,
		@periLargo			AS VARCHAR(100);

SET @SemenaFecha = CONVERT(DATETIME, CAST(@Anio AS VARCHAR(4))+'-01-01')

IF DATENAME(dw, @SemenaFecha) in ('Sunday','Domingo')
	BEGIN 
		SELECT @PeriodoDescripcion = CONVERT(VARCHAR(100), (DATEADD(d, -7, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103) + ' al ' + CONVERT(VARCHAR(100), (DATEADD(d, -1, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103)
	END
IF DATENAME(dw, @SemenaFecha) in ('Monday','Lunes')
	BEGIN 
		SELECT @PeriodoDescripcion = CONVERT(VARCHAR(100), (DATEADD(d, -8, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103) + ' al ' + CONVERT(VARCHAR(100), (DATEADD(d, -2, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103)
	END
IF DATENAME(dw, @SemenaFecha) in ('Tuesday','Martes')
	BEGIN 
		SELECT @PeriodoDescripcion = CONVERT(VARCHAR(100), (DATEADD(d, -9, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103) + ' al ' + CONVERT(VARCHAR(100), (DATEADD(d, -3, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103)
	END
IF DATENAME(dw, @SemenaFecha) in ('Wednesday','Miércoles')
	BEGIN 
		SELECT @PeriodoDescripcion = CONVERT(VARCHAR(100), (DATEADD(d, -10, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103) + ' al ' + CONVERT(VARCHAR(100), (DATEADD(d, -4, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103)
	END
IF DATENAME(dw, @SemenaFecha) in ('Thursday','Jueves')
	BEGIN 
		SELECT @PeriodoDescripcion = CONVERT(VARCHAR(100), (DATEADD(d, -11, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103) + ' al ' + CONVERT(VARCHAR(100), (DATEADD(d, -5, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103)
	END
IF DATENAME(dw, @SemenaFecha) in ('Friday','Viernes')
	BEGIN 
		SELECT @PeriodoDescripcion = CONVERT(VARCHAR(100), (DATEADD(d, -12, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103) + ' al ' + CONVERT(VARCHAR(100), (DATEADD(d, -6, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103)
	END
IF DATENAME(dw, @SemenaFecha) in ('Saturday','Sábado')
	BEGIN 
		SELECT @PeriodoDescripcion = CONVERT(VARCHAR(100), (DATEADD(d, -13, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103) + ' al ' + CONVERT(VARCHAR(100), (DATEADD(d, -7, DATEADD(ww, @SemanaNum, @SemenaFecha))), 103)
	END
if @Formato = 0 set @periLargo = @PeriodoDescripcion;
if @Formato = 1 set @periLargo = substring(@PeriodoDescripcion,1,5 )+' al '+substring(@PeriodoDescripcion,15,5) ;
Return @periLargo
END

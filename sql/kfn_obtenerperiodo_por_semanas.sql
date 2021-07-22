
-- select  * from ktb_tabla_semanas
-- exec ksp_crear_tabla_semanas ;
IF OBJECT_ID('ksp_crear_tabla_semanas', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_crear_tabla_semanas;  
GO  
CREATE PROCEDURE ksp_crear_tabla_semanas With Encryption
as
begin
	-- borrar si existe 
	if object_id('ktb_tabla_semanas')>0 drop table ktb_tabla_semanas;
	-- crearla 
	create table ktb_tabla_semanas ( fechaini datetime not null, fechafin datetime null,semana smallint not null, anno int not null );
	create index ktb_tabla_semanas_ix1 on ktb_tabla_semanas ( fechaini );
	create index ktb_tabla_semanas_ix2 on ktb_tabla_semanas ( semana, anno );
	--
	declare @dia	int = 0,
			@fecha  datetime,
			@semana	int,
			@anno	int,
			@inicio datetime = cast('20151228' as datetime);

	while ( @dia <= 2000 )
	begin
		-- 
	  	set @fecha	= DATEADD(d, @dia, @inicio );
		set @semana = DATEPART( ISO_WEEK, @fecha );
		set @anno	= year( @fecha );
		-- 
		if not exists (select * from ktb_tabla_semanas where semana = @semana and anno = (case when @semana >51 and month(@fecha)=1 then @anno-1 when @semana=1 and month(@fecha)=12 then @anno+1 else @anno end ) )
		begin 
            print 'insertado '+cast( @semana as varchar(5))+cast( (case when @semana >51 and month(@fecha)=1 then @anno-1 else @anno end ) as varchar(10))+cast( @fecha as varchar(20) )
			insert into ktb_tabla_semanas (fechaini, fechafin, semana, anno ) values ( @fecha, dateadd(d,6,@fecha), @semana, (case when @semana >51 and month(@fecha)=1 then @anno-1 when @semana=1 and month(@fecha)=12 then @anno+1 else @anno end ) );
		end;
		else
		begin
        print 'NO insertado '+cast( @semana as varchar(5))+cast( (case when @semana >51 and month(@fecha)=1 then @anno-1 else @anno end ) as varchar(10))+cast( @fecha as varchar(20) )
		end;
		set @dia += 1;
	end;

end;
go

-- semana
IF OBJECT_ID (N'dbo.kfn_obtenerSemana', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_obtenerSemana;  
GO  
CREATE FUNCTION dbo.kfn_obtenerSemana( @fecha datetime )  
RETURNS integer
With Encryption 
AS   
BEGIN  
    DECLARE @ret integer;  
	select @ret = semana from ktb_tabla_semanas where @fecha between fechaini and fechafin ;  
	--
    --  IF (@ret IS NULL) SET @ret = null;  
	--
    RETURN @ret;  
END; 
go

-- fecha inicial ->  print  dbo.kfn_obtenerFechaIni( getdate(), 0,0,0 )
declare @x datetime = getdate();
set @x = dbo.kfn_obtenerFechaIni( cast ( getdate() as date ), 0,0,0 );
print cast ( getdate() as date )
print @x
print 3

select getdate()
select * from ktb_tabla_semanas where getdate() between fechaini and fechafin ; 


IF OBJECT_ID (N'dbo.kfn_obtenerFechaIni', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_obtenerFechaIni;  
GO  
CREATE FUNCTION dbo.kfn_obtenerFechaIni( @fecha datetime, @caso int=0, @anio int=0, @semana int=0 )  
RETURNS Datetime   
With Encryption 
AS   
BEGIN  
    DECLARE @ret datetime;  
	if ( @caso = 0 )
		select @ret = fechaini from ktb_tabla_semanas where @fecha between fechaini and fechafin ;  
	else
		select @ret = fechaini from ktb_tabla_semanas where anno = @anio and semana = @semana ;  
	--
    RETURN @ret;  
END; 
go

-- fecha final
IF OBJECT_ID (N'dbo.kfn_obtenerFechaFin', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_obtenerFechaFin;  
GO  
CREATE FUNCTION dbo.kfn_obtenerFechaFin( @fecha datetime, @caso int=0, @anio int=0, @semana int=0 )  
RETURNS Datetime
With Encryption 
AS   
BEGIN  
    DECLARE @ret datetime;  
	if ( @caso = 0 )
		select @ret = fechafin from ktb_tabla_semanas where @fecha between fechaini and fechafin ;  
	else
		select @ret = fechafin from ktb_tabla_semanas where anno = @anio and semana = @semana ;  
	--
    --  IF (@ret IS NULL) SET @ret = null;  
	--
    RETURN @ret;  
END; 
go

-- año de la fecha
IF OBJECT_ID (N'dbo.kfn_obtenerAnno', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_obtenerAnno;  
GO  
CREATE FUNCTION dbo.kfn_obtenerAnno( @fecha datetime )  
RETURNS int   
With Encryption 
AS   
BEGIN  
    DECLARE @ret int;  
	select @ret = anno from ktb_tabla_semanas where @fecha between fechaini and fechafin ;  
	--
    --  IF (@ret IS NULL) SET @ret = null;  
	--
    RETURN @ret;  
END; 
go


-- periodo del rango de fechas
IF OBJECT_ID (N'dbo.kfn_periodoSemana', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_periodoSemana;  
GO  
CREATE FUNCTION dbo.kfn_periodoSemana( @anio as int, @semana as int, @formato as int )  
RETURNS varchar(25)   
With Encryption 
AS   
BEGIN  
    DECLARE @ret varchar(25);  

	select @ret = case when @formato = 0 then cast(day(s.fechaini) as char(2))+'/'+cast(month(s.fechaini) as char(2))+'/'+cast(year(s.fechaini) as char(4))+' al '+  
											  cast(day(s.fechafin) as char(2))+'/'+cast(month(s.fechafin) as char(2))+'/'+cast(year(s.fechafin) as char(4)) 
					   when @formato = 1 then cast(day(s.fechaini) as char(2))+'/'+cast(month(s.fechaini) as char(2))+' al '+  
											  cast(day(s.fechafin) as char(2))+'/'+cast(month(s.fechafin) as char(2)) 
					   when @formato = 2 then dbo.kfn_strZero(day(s.fechaini),2)+'/'+dbo.kfn_strZero(month(s.fechaini),2)+'/'+substring(cast(year(s.fechaini) as char(4)),3,2)+' al '+  
											  dbo.kfn_strZero(day(s.fechafin),2)+'/'+dbo.kfn_strZero(month(s.fechafin),2)+'/'+substring(cast(year(s.fechafin) as char(4)),3,2) 
					   else ''
				  end
	from ktb_tabla_semanas as s with (nolock)
	where anno = @anio and semana = @semana ;  
	--
    RETURN @ret;  
END; 
go

IF OBJECT_ID (N'dbo.kfn_strZero', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_strZero;  
GO  
CREATE FUNCTION dbo.kfn_strZero( @numero as int, @ceros as int )  
RETURNS varchar(10)   
With Encryption 
AS   
BEGIN  
	declare @dato as varchar(25)

	set @dato = right('0000000000'+rtrim(cast( @numero as varchar(25) )),@ceros );

	return @dato;
end;
go

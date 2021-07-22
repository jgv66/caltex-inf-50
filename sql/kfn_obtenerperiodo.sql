
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
            --print 'insertado'+cast( @semana as varchar(5))+cast( (case when @semana >51 and month(@fecha)=1 then @anno-1 else @anno end ) as varchar(10))+cast( @fecha as varchar(20) )
			insert into ktb_tabla_semanas (fechaini, fechafin, semana, anno ) values ( @fecha, dateadd(d,6,@fecha), @semana, (case when @semana >51 and month(@fecha)=1 then @anno-1 when @semana=1 and month(@fecha)=12 then @anno+1 else @anno end ) );
		end;
		--else
		--begin
        --print 'NO insertado'+cast( @semana as varchar(5))+cast( (case when @semana >51 and month(@fecha)=1 then @anno-1 else @anno end ) as varchar(10))+cast( @fecha as varchar(20) )
		--end;
		set @dia += 1;
	end;

end;
go

-- fecha inicial 
IF OBJECT_ID (N'dbo.kfn_obtenerFechaIni', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_obtenerFechaIni;  
GO  
CREATE FUNCTION dbo.kfn_obtenerFechaIni( @fecha datetime )  
RETURNS Datetime   
AS   
BEGIN  
    DECLARE @ret datetime;  
	select @ret = fechaini from ktb_tabla_semanas where @fecha between fechaini and fechafin ;  
	--
    --  IF (@ret IS NULL) SET @ret = null;  
	--
    RETURN @ret;  
END; 
go

-- fecha final
IF OBJECT_ID (N'dbo.kfn_obtenerFechaFin', N'FN') IS NOT NULL  
    DROP FUNCTION kfn_obtenerFechaFin;  
GO  
CREATE FUNCTION dbo.kfn_obtenerFechaFin( @fecha datetime )  
RETURNS Datetime
AS   
BEGIN  
    DECLARE @ret datetime;  
	select @ret = fechafin from ktb_tabla_semanas where @fecha between fechaini and fechafin ;  
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
AS   
BEGIN  
    DECLARE @ret int;  
	select @ret = anno from ktb_tabla_semanas where @fecha between fechaini and fechafin ;  
	--
    --  IF (@ret IS NULL) SET @ret = null;  
	--
    RETURN @ret;  
END; 



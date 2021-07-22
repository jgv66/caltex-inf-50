
-->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
/*
  declare @ss varchar(100);
  exec ksp_StrToken 'papa;mama;hijo;',3,';',@salida = @ss output;
  print @ss
*/
IF OBJECT_ID('ksp_StrToken', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_StrToken;  
GO  
create procedure ksp_StrToken ( 
        @cadena  varchar(2500), 
        @pos     int, 
        @token   varchar(10),
        @salida  varchar(2500) OUTPUT ) --With Encryption
AS 
BEGIN
    set NOCOUNT ON
 
    declare @i      int, @j int, @k int, @largo int;
    declare @xpos   int;
    declare @car    char(1);
    declare @dev    varchar(2500);
 
    set @cadena = RTRIM( @cadena );
    set @largo  = LEN( @cadena );
    set @i      = 0;
    set @j      = 1;
    set @k      = 0;
 
    set @dev    = '';
    set @xpos   = 0
 
    WHILE ( @i <= @largo )
    BEGIN
        --
        set @i      = @i + 1;
        set @car    = substring( @cadena, @i, 1 );
        set @k      = @k + 1;
 
        --
        if @car = @token        -- encontró un token
        begin
            set @xpos += 1;     
            if @xpos = @pos     -- posicion encontrada es la buscada?
                begin
                    if @k > 1
                        set @dev = substring( @cadena, @j, @k-1 );      
                    else
                        set @dev = '';      
                    --
                    set @salida = @dev;
                    set @i = @largo+1; -- ya se encontró, salir !!
                end
            else
                begin
                    set @k  = 0;
                    set @j  = @i+1;
                end
        end
     END
     select @salida = @dev;
     RETURN
END ;
GO

-->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
/*
declare @nro char(10) = '0000000010';
exec ksp_NumeroDocumento_v1 '01','1CM00','NVV', @nro output ;
print @nro
*/
IF OBJECT_ID('ksp_NumeroDocumento_v1', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_NumeroDocumento_v1;  
GO  
CREATE PROCEDURE ksp_NumeroDocumento_v1 ( 
       @empresa		char(2) = '01', 
	   @modalidad	char(5) = '',
	   @tipodoc		char(3),
	   @numero		char(10) output ) With Encryption
AS
BEGIN
 
	declare @campo		char(3),
			@campolsr	varchar(10),
			@ndev		char(10),
			@ndev2		bit,
			@xelmodo    char(5),
			@maxnudo	char(10),
			@query      NVARCHAR(2500);		

	set @xelmodo	= @modalidad
	set @campo		= UPPER(@tipodoc) ;
	set @campolsr	= UPPER(@tipodoc)+'LSR' ;

	SET NOCOUNT ON

	--
	set @query = 'select @ndev = '+@campo+' from CONFIEST where EMPRESA = '+char(39)+@empresa+char(39)+' and MODALIDAD = '+char(39)+@xelmodo+char(39)+' ;';
	--
	EXECUTE sp_executesql @query,N' @ndev char(10) output ',@ndev output;

	-- si esta vacio debe tomar valor de configuracion central
	if (coalesce(@ndev,'') = '' )
	begin
		set @xelmodo = char(5)+' '+char(5)+' '+char(5);
		--
		if exists ( select * from CONFIEST with (nolock) where EMPRESA = @empresa and MODALIDAD = @xelmodo ) 
		begin
			select	@ndev = @campo, 
					@ndev2 = case when ( @campolsr <> UPPER(@campolsr) ) or @campolsr='5' or @campolsr='6' or @campolsr='7' or @campolsr='8' then 1 else 0 end
			from CONFIEST with (nolock)
			where EMPRESA	= @empresa 
			  and MODALIDAD = @xelmodo ;
			--
			set @numero = @ndev ;
			--
		end
		else
		begin
			-- no se encontro numero en confiest
			set @numero = '0000000000' ;
		end
	end
	else
	-- de lo contrario se revisa la configuracion de estacion correspondiente
	begin
		if ( @ndev = '0000000000' ) 
		begin 
			if ( @campo = 'GDV' )
			begin
                select @maxnudo = coalesce( max(NUDO),'0000000000')
				from MAEEDO with (nolock)
                where TIDO IN ('GDV','GDD','GDP','GTI')
				  and EMPRESA = @empresa
			end
			else
			begin
                select @maxnudo = coalesce( max(NUDO),'0000000000')
				from MAEEDO with (nolock)
                where TIDO=@campo
				  and EMPRESA = @empresa
			end
            --
			exec ksp_valsgtecar @maxnudo, @numero output ;
			--
			-- existen pendientes con numeros mayores o iguales?
			if ( @campo = 'NVV' or @campo = 'OCC' ) and exists ( select * from KASIEDO with (nolock) where EMPRESA=@empresa and TIDO=@campo and LIBRO=@numero )
			begin
                select @maxnudo = coalesce( max(LIBRO),'0000000000')
				from KASIEDO with (nolock)
                where TIDO=@campo
				  and EMPRESA = @empresa ;
                --
				exec ksp_valsgtecar @maxnudo, @numero output ;
				--
			end
		end
		else
		-- el numero que esta es el que deberia servir
		begin
            --
			set @numero = @ndev;
			--
		end
		-- verificar si existe... pero devuelvo el mismo ... y el grabador lo desecha
		if exists ( select * from MAEEDO with (nolock) where EMPRESA=@empresa and TIDO=@campo and NUDO=@numero )
		begin
			-- nada pasa
			set @numero = @numero ;	
		end
   	end

END;
go

-->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
-- ult. modificacion: 27/07/2018-> agregado observaiones y occ
IF OBJECT_ID('ksp_grabaDocumentoPre_v1', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_grabaDocumentoPre_v1;  
GO  
CREATE PROCEDURE ksp_grabaDocumentoPre_v1 (
    @tipograba varchar(10), 
	@tipodoc   char(3) = '',
    @id_ktp    int = 0,
	@nudoreal  char(10) OUTPUT ) With Encryption
AS
BEGIN
    SET NOCOUNT ON
	--
	declare @id				int,
			@empresa		char(3),
			@cliente		char(13),
			@suc_cliente	char(10),
			@vendedor		char(3),
			@fechaemision   datetime,
			@fechaultvenc	datetime,
			@fecha1ervenc 	datetime,
			@fechadespacho	datetime,
			@xft			datetime,
			@modalidad		char(5),
			@nudo			char(10),
			@sudo			char(3),
			@luvt			char(10),
			@meardo			char(1),
			@listaactiva	char(8),
			@nuvecr			int,
			@dias1ven		int,
			@diasvenci		int,
			@cpen			varchar(40),
			@monedaprecio	char(3),
			@tipomonedapre	char(1),
			@tasamon		decimal(18,5),
			@Error			nvarchar(250),
			@horagrab		int = 0,
			@iva			decimal (18,5),
			@linea			int,
			@xtido			char(3),
			@kocrypt		varchar(30),
			@bodegawms		char(3),
			@query			varchar(2500),
			@nudorealmas1   char(10),
			@obs			varchar(250),
			@occ			varchar(40)
    --
	set @kocrypt = '442E6BAEAE90000E0D03879B8DC334'
	set @xtido   = case 
					when @tipodoc = 'PRE' THEN 'NVV' 
	                when @tipodoc = 'COV' then 'COV' 
					else 'NVV' 
				   end
	--
	declare @sucursal char(3),@bodega char(3),@codigo char(13),@unidad_tr int,@unidad1 char(3),@unidad2 char(3),@cantidad1 decimal(18,5),@cantidad2 decimal(18,5),@listaprecio char(3),
			@metodolista char(1),@precio  decimal(18,5),@porcedes decimal(18,5), @descuentos decimal(18,5), @porcerec decimal(18,5), @recargos decimal(18,5),@observacion varchar(50),@valido char(1), 
		    @TIPR char(3),@RLUD decimal(18,5),@UD01PR char(3),@UD02PR char(3),@NOKOPR char(50),@PM  decimal(18,5),@PMSUC  decimal(18,5),@PMIFRS  decimal(18,5),@COSTOTRIB  decimal(18,5),@COSTOIFRS  decimal(18,5)
	--
	declare @PPPRNELT decimal(18,5), @PPPRNE decimal(18,5), @PPPRBRLT decimal(18,5),@PPPRBR decimal(18,5), @POIVLI decimal (18,5), @VAIVLI decimal(18,5), @VADTNELI decimal(18,5), @VADTBRLI decimal(18,5),
			@NUIMLI decimal(18,5),@POIMGLLI  decimal(18,5),@VAIMLI  decimal(18,5), @VANELI decimal(18,5), @VABRLI decimal(18,5), @PPPRNERE1 decimal(18,5), @PPPRNERE2 decimal(18,5)
	--
	select	@empresa=empresa,@cliente=cliente,@suc_cliente=suc_cliente,
			@vendedor=vendedor,@fechaemision=cast(fechaemision as smalldatetime),@fechadespacho=cast(fechaentrega as smalldatetime),
			@modalidad=modalidad,@obs=observacion,@occ=ordendecompra
	from ktp_encabezado 
	where id_preventa = @id_ktp ;
	--
	select @iva=IVAPAIS from CONFIGP where EMPRESA=@empresa
	select @sudo=ESUCURSAL,@luvt=LUVTVEN,@listaactiva=ELISTAVEN from CONFIEST where EMPRESA=@empresa and MODALIDAD=@modalidad ;
	select @meardo=MEARDO from TABTIDO WHERE TIDO=@xtido ;
	select @nuvecr=COALESCE(NUVECR,0),@dias1ven=COALESCE(DIPRVE,0),@diasvenci=COALESCE(DIASVENCI,0),@cpen=CPEN from MAEEN where KOEN=@cliente and SUEN=@suc_cliente ;
	select @monedaprecio=MOLT,@tipomonedapre=TIMOLT,@metodolista=MELT from TABPP WHERE 'TABPP'+KOLT=@listaactiva ;
	--
	if ( rtrim(@monedaprecio)<>'$' )
		select @tasamon=VAMO from TABMO WHERE KOMO=@monedaprecio ;
	else
		select @tasamon=VAMO from TABMO WHERE KOMO='US$' ;
	-- 
	set @Error = @@ERROR
	if (@Error=0)
	begin
		select @nudoreal=MAX(NUDO) from KASIEDO where EMPRESA=@empresa and TIDO=@xtido  ;
		if @nudoreal is null 
		begin
			set @nudoreal = '0000000000'
		end
		exec ksp_valsgtecar @nudoreal, @nudoreal output;
 	end
	--
	set @Error = @@ERROR
	if (@Error=0)
	begin
		set @fecha1ervenc = DATEADD( dd, @dias1ven, @fechaemision );
		exec ksp_sumaMes @fecha1ervenc, @nuvecr, @dias1ven, @fechaultvenc output ;
	end
	--
	set @Error = @@ERROR
	if (@Error=0)
	begin
		set @horagrab = 0;
		exec ksp_HoraGrab @horagrab output ;
	end
	--
	set @Error = @@ERROR
	if ( @Error=0 )  
	begin
		-- fecha + 00:00:00
	    set @xft = @fechaemision ; set @fechaemision = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		set @xft = @fecha1ervenc ; set @fecha1ervenc = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		set @xft = @fechaultvenc ; set @fechaultvenc = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		set @xft = getdate()     ; set @xft          = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		--
		insert into KASIEDO (EMPRESA,TIDO,NUDO,ENDO,SUENDO,ENDOFI,TIGEDO,SUDO,LUVTDO,FEEMDO,KOFUDO,ESDO,ESPGDO,CAPRCO,CAPRAD,CAPREX,CAPRNC,MEARDO,
							 MODO,TIMODO,TAMODO,NUCTAP,VACTDTNEDO,VACTDTBRDO,
							 NUIVDO,POIVDO,VAIVDO,NUIMDO,VAIMDO,VANEDO,VABRDO,POPIDO,VAPIDO,FE01VEDO,FEULVEDO,NUVEDO,VAABDO,MARCA,FEER,NUTRANSMI,NUCOCO,KOTU,
							 LIBRO,LCLV,ESFADO,KOTRPCVH,NULICO,PERIODO,NUDONODEFI,TRANSMASI,POIVARET,VAIVARET,RESUMEN,LAHORA,KOFUAUDO,KOOPDO,ESPRODDO,DESPACHO,HORAGRAB,RUTCONTACT,
							 SUBTIDO,TIDOELEC,ESDOIMP,CUOGASDIF,BODESTI,PROYECTO,FECHATRIB,NUMOPERVEN,BLOQUEAPAG,VALORRET,FLIQUIFCV,VADEIVDO,KOCANAL,KOCRYPT,LEYZONA,KOSIFIC,
							 LISACTIVA,KOFUAUTO,SUENDOFI,VAIVDOZF,ENDOMANDA,FLUVTCALZA)
		select empresa,@xtido,@nudoreal,cliente,suc_cliente,'','I',@sudo,@luvt,@fechaemision,@vendedor,'','S',0,0,0,0,@meardo,
			   '$','N',@tasamon,0,0,0,
			   0,0,0,0,0,0,0,0,0,@fecha1ervenc,@fechaultvenc,@nuvecr,0,'',@fechadespacho,'','','1',
			   @nudoreal,NULL,'','','','',0,'',0,0,'',@xft,'','','','1',@horagrab,'',
			   '',0,'',0,'','',NULL,0,'',0,@xft,0,'',@kocrypt,'','',
			   @listaactiva,'','',0,'',''
		from ktp_encabezado 
		where id_preventa = @id_ktp ;
		--
		select @id = @@IDENTITY ;

		-- observaciones y orden de compra
		INSERT INTO KASIEDOB ( IDMAEEDO,OBDO,OCDO,CPDO, DIENDESP,MOTIVO,TEXTO1,TEXTO2,TEXTO3,TEXTO4,TEXTO5,TEXTO6,TEXTO7,TEXTO8,TEXTO9,TEXTO10,TEXTO11,TEXTO12,TEXTO13,TEXTO14,TEXTO15,TEXTO16,TEXTO17,TEXTO18,TEXTO19,TEXTO20,TEXTO21,TEXTO22,TEXTO23,TEXTO24,TEXTO25,TEXTO26,TEXTO27,TEXTO28,TEXTO29,TEXTO30,TEXTO31,TEXTO32,CARRIER,BOOKING,LADING,AGENTE,MEDIOPAGO,TIPOTRANS,KOPAE,KOCIE,KOCME,FECHAE,HORAE,KOPAD,KOCID,KOCMD,FECHAD,HORAD,OBDOEXPO,PLACAPAT) 
		            VALUES   ( @id,     @obs,@occ,@cpen,'',      '',    'KTP#'+cast( @id_ktp as varchar(20)),'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',NULL,'','','','',NULL,'','','')
	end
	--
	set @Error = @@ERROR
	if (@Error=0)
	begin
		DECLARE detalle_cursor CURSOR 
		FORWARD_ONLY
		STATIC
		READ_ONLY
		FOR select d.linea,d.sucursal,d.bodega,d.codigo,d.unidad_tr,d.unidad1,d.unidad2,d.cantidad1,d.cantidad2,
		           d.listaprecio,d.metodolista,d.precio,d.porcedes,d.descuentos,d.porcerec,d.recargos,d.observacion,d.valido, 
				   PR.TIPR,PR.RLUD,PR.UD01PR,PR.UD02PR,PR.NOKOPR,PR.PM,SU.PMSUC,PR.PMIFRS
			from ktp_detalle   as d
			inner join MAEPR   as PR on PR.KOPR=d.codigo
			left join MAEPMSUC as SU on d.codigo=SU.KOPR AND d.sucursal=SU.KOSU AND SU.EMPRESA=@empresa
			where d.id_preventa = @id_ktp ;

		OPEN detalle_cursor  

		FETCH NEXT FROM detalle_cursor   
		INTO @linea,@sucursal,@bodega,@codigo,@unidad_tr,@unidad1,@unidad2,@cantidad1,@cantidad2,
			 @listaprecio, @metodolista,@precio,@porcedes,@descuentos,@porcerec,@recargos,  @observacion,@valido, 
			 @TIPR,@RLUD,@UD01PR,@UD02PR,@NOKOPR,@PM,@PMSUC,@PMIFRS

		WHILE @@FETCH_STATUS = 0  
		BEGIN     
			set @Error = @@ERROR
			if ( @Error=0 )
			begin 
				-- faltan los impuestos aqui
				set @NUIMLI   = 0;
				set @POIMGLLI = 0;
				set @VAIMLI	  = 0;	
				set @VADTNELI = 0;
				set @VADTBRLI = 0;
				-- faltan los impuestos aqui
				set @POIVLI = @iva;
				--
				if ( @metodolista='N' )
					begin
						set @PPPRNELT = round(@precio,0);
						set @PPPRNE   = round(@precio,0);
						set @PPPRBRLT = round( ( @precio * ( 1+(@iva/100) )), 0 );
						set @PPPRBR   = round( ( @precio * ( 1+(@iva/100) )), 0 );
						--
						if ( @porcedes>0 )
						begin
							set @VADTNELI = @descuentos;
							set @VADTBRLI = round( @descuentos * ( 1+(@iva/100) ), 0);
						end
						--
					end
				else
					begin 
						set @PPPRBRLT = @precio;
						set @PPPRBR   = @precio;
						set @PPPRNELT = round( ( @precio / ( 1+(@iva/100) )), 0 );
						set @PPPRNE   = round( ( @precio / ( 1+(@iva/100) )), 0 );
						--
						if ( @porcedes>0 )
						begin
							set @VADTNELI = round( @descuentos / ( 1+(@iva/100) ), 0);
							set @VADTBRLI = @descuentos;
						end
						--
						set @VAIVLI	  = round((@PPPRNE * @cantidad1 ) * ( @iva/100 ),0);	
					end
				--
				set @VANELI		= round( ( @PPPRNE * @cantidad1 ) - @VADTNELI, 0 );				
				set @VAIVLI	    = round( @VANELI * ( @iva/100 ),0);	
				set @VABRLI		= round( @VANELI + @VAIVLI, 0 ); 
				set @PPPRNERE1	= round( @VANELI / @cantidad1, 0 );
				set @PPPRNERE2	= round( @PPPRNERE1 * @RLUD, 0 );
				--
				insert into KASIDDO (IDMAEDDO,IDMAEEDO,ARCHIRST,IDRST,EMPRESA,TIDO,NUDO,ENDO,SUENDO,ENDOFI,LILG,NULIDO,SULIDO,LUVTLIDO,
									 BOSULIDO,KOFULIDO,NULILG,PRCT,TICT,TIPR,NUSEPR,KOPRCT,
									 UDTRPR,RLUDPR,CAPRCO1,CAPRAD1,CAPREX1,CAPRNC1,UD01PR,CAPRCO2,CAPRAD2,CAPREX2,CAPRNC2,UD02PR,
									 KOLTPR,MOPPPR,TIMOPPPR,TAMOPPPR,
									 PPPRNELT,PPPRNE,PPPRBRLT,PPPRBR,
									 NUDTLI,PODTGLLI,VADTNELI,VADTBRLI,
									 POIVLI,VAIVLI,NUIMLI,POIMGLLI,
									 VAIMLI,VANELI,VABRLI,
									 TIGELI,EMPREPA,TIDOPA,NUDOPA,ENDOPA,NULIDOPA,LLEVADESP,FEEMLI,FEERLI,PPPRPM,OPERACION,CODMAQ,ESLIDO,PPPRNERE1,PPPRNERE2,
									 ESFALI,CAFACO,CAFAAD,CAFAEX,CMLIDO,NULOTE,FVENLOTE,ARPROD,NULIPROD,NUCOCO,NULICO,PERIODO,FCRELOTE,SUBLOTE,NOKOPR,ALTERNAT,
									 PRENDIDO,OBSERVA,KOFUAULIDO,KOOPLIDO,MGLTPR,PPOPPR,TIPOMG,ESPRODLI,CAPRODCO,CAPRODAD,CAPRODEX,CAPRODRE,TASADORIG,CUOGASDIF,
									 SEMILLA,PROYECTO,POTENCIA,HUMEDAD,IDTABITPRE,IDODDGDV,LINCONDESP,PODEIVLI,VADEIVLI,PRIIDETIQ,KOLORESCA,KOENVASE,PPPRPMSUC,
									 PPPRPMIFRS,COSTOTRIB,COSTOIFRS,SUENDOFI,COMISION,FLUVTCALZA,FEERLIMODI)
				values (0,@id,'',0,@empresa,@xtido,@nudoreal,@cliente,@suc_cliente,'','SI',right('0000'+rtrim(cast(@linea as varchar(9))),5),@sucursal,@luvt,
					    @bodega,@vendedor,'',0,'',@TIPR,'',@codigo,
					    @unidad_tr,@RLUD,
						case when @unidad_tr=1 then @cantidad1 else @cantidad1*@RLUD end,
						0,0,0,@UD01PR,
						case when @unidad_tr=1 then @cantidad1/@RLUD else @cantidad1 end,
						0,0,0,@UD02PR,
					    'TABPP'+@listaprecio,@monedaprecio,@tipomonedapre,1,
					    @PPPRNELT,@PPPRNE,@PPPRBRLT,@PPPRBR,
					    (case when @descuentos>0 then 1 else 0 end),@porcedes,@VADTNELI,@VADTBRLI,
					    @POIVLI,@VAIVLI,@NUIMLI,@POIMGLLI,@VAIMLI,
					    @VANELI,@VABRLI,
					    'I','','','','','',0,@fechaemision,@fechadespacho,@PM,'','','',@PPPRNERE1,@PPPRNERE2,
					    '',0,0,0,0,'',NULL,'','','','','',NULL,'',@NOKOPR,'',
					    0,'','','',0,0,0,'',0,0,0,0,1,0,
					    0,'',0,0,0,0,1,0,0,0,'','',@PMSUC,
					    @PMIFRS,@VANELI,@VANELI,'',0,'',@xft )

				-- insercion del descuento si existe
				if ( @VADTNELI <> 0 ) 
				begin
					insert into KASIDTLI ( IDMAEEDO, NULIDO, KODT, PODT, VADT, LILG, OPERA,UNITAR )
								 values ( @id, right('0000'+rtrim(cast(@linea as varchar(9))),5), 'D_SIN_TIPO', @porcedes, @VADTNELI, '',   '',   0 )
				end
				--
			end

			FETCH NEXT FROM detalle_cursor   
			INTO @linea,@sucursal,@bodega,@codigo,@unidad_tr,@unidad1,@unidad2,@cantidad1,@cantidad2,
				 @listaprecio, @metodolista,@precio,@porcedes,@descuentos,@porcerec,@recargos,  @observacion,@valido, 
				 @TIPR,@RLUD,@UD01PR,@UD02PR,@NOKOPR,@PM,@PMSUC,@PMIFRS

		END

		--
		CLOSE detalle_cursor  
		DEALLOCATE detalle_cursor  
		--
	end
	--
	set @Error = @@ERROR
	if (@Error=0)
	begin
	    --
		-- CAPRCO = ( select sum((case when UDTRPR=1 then CAPRCO1 else CAPRCO2 end)) from KASIDDO WHERE IDMAEEDO=@id ),
		--                   
	    UPDATE KASIEDO set VANEDO = round(( select sum(VANELI)  from KASIDDO WHERE IDMAEEDO=@id ),0),
		                   VAIVDO = round(( select sum(VANELI)  from KASIDDO WHERE IDMAEEDO=@id ) * (@iva/100),0)
		where IDMAEEDO = @id ;
		--
	    UPDATE KASIEDO set VABRDO = VANEDO + VAIVDO 
		where IDMAEEDO = @id ;
        --
        update ktp_encabezado set id_externo = @id, nro_externo = @nudoreal
        where id_preventa = @id_ktp ;
        --
	end
	--
END;
go

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
-- ult. modificacion: 27/07/2018-> agregado observaiones y occ
-- ult. modificacion: 27/06/2018 agregado: mejora en numeracion definitiva, corregido uso de doble unidad
IF OBJECT_ID('ksp_grabaDocumentoDef_v1', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_grabaDocumentoDef_v1;  
GO  
CREATE PROCEDURE ksp_grabaDocumentoDef_v1 (
	@tipodoc   char(3) = '',
    @id_ktp    int = 0,
	@nudoreal  char(10) OUTPUT ) With Encryption
AS
BEGIN
    SET NOCOUNT ON
	--
	declare @id				int,
			@empresa		char(3),
			@cliente		char(13),
			@suc_cliente	char(10),
			@cpen			varchar(40),
			@vendedor		char(3),
			@fechaemision   datetime,
			@fechaultvenc	datetime,
			@fecha1ervenc 	datetime,
			@fechadespacho	datetime,
			@xft			datetime,
			@modalidad		char(5),
			@nudo			char(10),
			@sudo			char(3),
			@luvt			char(10),
			@meardo			char(1),
			@listaactiva	char(8),
			@nuvecr			int,
			@dias1ven		int,
			@diasvenci		int,
			@monedaprecio	char(3),
			@tipomonedapre	char(1),
			@tasamon		decimal(18,5),
			@Error			nvarchar(250),
			@horagrab		int = 0,
			@iva			decimal (18,5),
			@linea			int,
			@xtido			char(3),
			@kocrypt		varchar(30),
			@bodegawms		char(3),
			@query			varchar(2500),
			@nudorealmas1   char(10),
			@obs			varchar(250),
			@occ			varchar(40);

    --
	set @kocrypt = '442E6BAEAE90000E0D03879B8DC334' 
	set @xtido   = @tipodoc 
	--
	declare @sucursal char(3),@bodega char(3),@codigo char(13),@unidad_tr int,@unidad1 char(3),@unidad2 char(3),@cantidad1 decimal(18,5),@cantidad2 decimal(18,5),@listaprecio char(3),
			@metodolista char(1),@precio  decimal(18,5),@porcedes decimal(18,5), @descuentos decimal(18,5), @porcerec decimal(18,5), @recargos decimal(18,5),@observacion varchar(50),@valido char(1), 
		    @TIPR char(3),@RLUD decimal(18,5),@UD01PR char(3),@UD02PR char(3),@NOKOPR char(50),@PM  decimal(18,5),@PMSUC  decimal(18,5),@PMIFRS  decimal(18,5),
			@COSTOTRIB  decimal(18,5),@COSTOIFRS  decimal(18,5) ;
	--
	declare @PPPRNELT decimal(18,5), @PPPRNE decimal(18,5), @PPPRBRLT decimal(18,5),@PPPRBR decimal(18,5), @POIVLI decimal (18,5), @VAIVLI decimal(18,5), 
	        @VADTNELI decimal(18,5), @VADTBRLI decimal(18,5),
			@NUIMLI decimal(18,5),@POIMGLLI  decimal(18,5),@VAIMLI  decimal(18,5), @VANELI decimal(18,5), @VABRLI decimal(18,5), @PPPRNERE1 decimal(18,5), @PPPRNERE2 decimal(18,5) ;

	--  >>>>>>>>> lectura de encabezado
	select	@empresa=empresa,@cliente=cliente,@suc_cliente=suc_cliente,@vendedor=vendedor,
			@fechaemision=cast(fechaemision as smalldatetime),@fechadespacho=cast(fechaentrega as smalldatetime),
			@modalidad=modalidad,@obs=observacion,@occ=ordendecompra
	from ktp_encabezado 
	where id_preventa = @id_ktp ;

	-- para tener el dato en la insercion WMS: ktp_nvv_hacia_wms
	select top 1 @bodegawms=bodega from ktp_detalle  where id_preventa = @id_ktp ;
	--
	select @iva=IVAPAIS from CONFIGP where EMPRESA=@empresa ;
	select @sudo=ESUCURSAL,@luvt=LUVTVEN,@listaactiva=ELISTAVEN from CONFIEST where EMPRESA=@empresa and MODALIDAD=@modalidad ;
	select @meardo=MEARDO from TABTIDO WHERE TIDO=@xtido ;
	select @nuvecr=COALESCE(NUVECR,0),@dias1ven=COALESCE(DIPRVE,0),@diasvenci=COALESCE(DIASVENCI,0),@cpen=CPEN from MAEEN where KOEN=@cliente and TIPOSUC='P' ; /* SUEN=@suc_cliente ;*/
	select @monedaprecio=MOLT,@tipomonedapre=TIMOLT,@metodolista=MELT from TABPP WHERE 'TABPP'+KOLT=@listaactiva ;
	--
	if ( rtrim(@monedaprecio)<>'$' )
		select @tasamon=VAMO from TABMO WHERE KOMO=@monedaprecio ;
	else
		select @tasamon=VAMO from TABMO WHERE KOMO='US$' ;
	-- 
	set @Error = @@ERROR
	if (@Error=0)
	begin
	    exec ksp_NumeroDocumento_v1 @empresa,@modalidad,'NVV', @nudoreal output ;
 	end
	--
	set @Error = @@ERROR
	if (@Error=0)
	begin
		set @fecha1ervenc = DATEADD( dd, @dias1ven, @fechaemision );
		exec ksp_sumaMes @fecha1ervenc, @nuvecr, @dias1ven, @fechaultvenc output ;
	end
	--
	set @Error = @@ERROR
	if (@Error=0)
	begin
		set @horagrab = 0;
		exec ksp_HoraGrab @horagrab output ;
	end
	--
	set @Error = @@ERROR
	if ( @Error=0 )  
	begin
	    -- fecha + 00:00:00
	    set @xft = @fechaemision ; set @fechaemision = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		set @xft = @fecha1ervenc ; set @fecha1ervenc = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		set @xft = @fechaultvenc ; set @fechaultvenc = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		set @xft = getdate()     ; set @xft          = CAST( cast(year(@xft) as char(4))+right('0'+rtrim(cast(month(@xft) as char(2))),2)+right('0'+rtrim(cast(day(@xft) as char(2))),2) as datetime) ;
		--
		insert into MAEEDO (EMPRESA,TIDO,NUDO,ENDO,SUENDO,ENDOFI,TIGEDO,SUDO,LUVTDO,FEEMDO,KOFUDO,ESDO,ESPGDO,CAPRCO,CAPRAD,CAPREX,CAPRNC,MEARDO,
							 MODO,TIMODO,TAMODO,NUCTAP,VACTDTNEDO,VACTDTBRDO,
							 NUIVDO,POIVDO,VAIVDO,NUIMDO,VAIMDO,VANEDO,VABRDO,POPIDO,VAPIDO,FE01VEDO,FEULVEDO,NUVEDO,VAABDO,MARCA,FEER,NUTRANSMI,NUCOCO,KOTU,
							 LIBRO,LCLV,ESFADO,KOTRPCVH,NULICO,PERIODO,NUDONODEFI,TRANSMASI,POIVARET,VAIVARET,RESUMEN,LAHORA,KOFUAUDO,KOOPDO,ESPRODDO,DESPACHO,HORAGRAB,RUTCONTACT,
							 SUBTIDO,TIDOELEC,ESDOIMP,CUOGASDIF,BODESTI,PROYECTO,FECHATRIB,NUMOPERVEN,BLOQUEAPAG,VALORRET,FLIQUIFCV,VADEIVDO,KOCANAL,KOCRYPT,LEYZONA,KOSIFIC,
							 LISACTIVA,KOFUAUTO,SUENDOFI,VAIVDOZF,ENDOMANDA,FLUVTCALZA)
		select empresa,@xtido,@nudoreal,cliente,suc_cliente,'','I',@sudo,@luvt,@fechaemision,vendedor,'','S',0,0,0,0,@meardo,
			   '$','N',@tasamon,0,0,0,
			   0,0,0,0,0,0,0,0,0,@fecha1ervenc,@fechaultvenc,@nuvecr,0,'',@fechadespacho,'','','1',
			   '',NULL,'','','','',0,'',0,0,'',@xft,'','','','1',@horagrab,'',
			   '',0,'',0,'','',NULL,0,'',0,@xft,0,'',@kocrypt,'','',
			   @listaactiva,'','',0,'',''
		from ktp_encabezado 
		where id_preventa = @id_ktp ;
		--
		select @id = @@IDENTITY ;

		-- observaciones y orden de compra
		INSERT INTO MAEEDOOB ( IDMAEEDO,OBDO,OCDO,CPDO, DIENDESP,MOTIVO,TEXTO1,TEXTO2,TEXTO3,TEXTO4,TEXTO5,TEXTO6,TEXTO7,TEXTO8,TEXTO9,TEXTO10,TEXTO11,TEXTO12,TEXTO13,TEXTO14,TEXTO15,TEXTO16,TEXTO17,TEXTO18,TEXTO19,TEXTO20,TEXTO21,TEXTO22,TEXTO23,TEXTO24,TEXTO25,TEXTO26,TEXTO27,TEXTO28,TEXTO29,TEXTO30,TEXTO31,TEXTO32,CARRIER,BOOKING,LADING,AGENTE,MEDIOPAGO,TIPOTRANS,KOPAE,KOCIE,KOCME,FECHAE,HORAE,KOPAD,KOCID,KOCMD,FECHAD,HORAD,OBDOEXPO,PLACAPAT) 
		              VALUES ( @id,     @obs,@occ,@cpen,'',      '',    'KTP#'+cast( @id_ktp as varchar(20)),'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',NULL,'','','','',NULL,'','','')
		--
	end
	-- al detalle
	set @Error = @@ERROR
	if (@Error=0)
	begin
		DECLARE detalle_cursor CURSOR 
		FORWARD_ONLY
		STATIC
		READ_ONLY
		FOR select d.linea,d.sucursal,d.bodega,d.codigo,d.unidad_tr,d.unidad1,d.unidad2,d.cantidad1,d.cantidad2,
		           d.listaprecio,d.metodolista,d.precio,d.porcedes,d.descuentos,d.porcerec,d.recargos,d.observacion,d.valido, 
				   PR.TIPR,PR.RLUD,PR.UD01PR,PR.UD02PR,PR.NOKOPR,PR.PM,SU.PMSUC,PR.PMIFRS
			from ktp_detalle   as d
			inner join MAEPR   as PR on PR.KOPR=d.codigo
			left join MAEPMSUC as SU on d.codigo=SU.KOPR AND d.sucursal=SU.KOSU AND SU.EMPRESA=@empresa
			where d.id_preventa = @id_ktp ;

		OPEN detalle_cursor  

		FETCH NEXT FROM detalle_cursor   
		INTO @linea,@sucursal,@bodega,@codigo,@unidad_tr,@unidad1,@unidad2,@cantidad1,@cantidad2,
			 @listaprecio, @metodolista,@precio,@porcedes,@descuentos,@porcerec,@recargos,  @observacion,@valido, 
			 @TIPR,@RLUD,@UD01PR,@UD02PR,@NOKOPR,@PM,@PMSUC,@PMIFRS

		WHILE @@FETCH_STATUS = 0  
		BEGIN     
			set @Error = @@ERROR
			if ( @Error=0 )
			begin 
				-- faltan los impuestos aqui
				set @NUIMLI   = 0;
				set @POIMGLLI = 0;
				set @VAIMLI	  = 0;	
				set @VADTNELI = 0;
				set @VADTBRLI = 0;
				-- faltan los impuestos aqui
				set @POIVLI = @iva;
				--
				if ( @metodolista='N' )
					begin
						set @PPPRNELT = round(@precio,0);
						set @PPPRNE   = round(@precio,0);
						set @PPPRBRLT = round( ( @precio * ( 1+(@iva/100) )), 0 );
						set @PPPRBR   = round( ( @precio * ( 1+(@iva/100) )), 0 );
						--
						if ( @porcedes>0 )
						begin
							set @VADTNELI = @descuentos;
							set @VADTBRLI = round( @descuentos * ( 1+(@iva/100) ), 0);
						end
						--
					end
				else
					begin 
						set @PPPRBRLT = @precio;
						set @PPPRBR   = @precio;
						set @PPPRNELT = round( ( @precio / ( 1+(@iva/100) )), 0 );
						set @PPPRNE   = round( ( @precio / ( 1+(@iva/100) )), 0 );
						--
						if ( @porcedes>0 )
						begin
							set @VADTNELI = round( @descuentos / ( 1+(@iva/100) ), 0);
							set @VADTBRLI = @descuentos;
						end
						--
						set @VAIVLI	  = round((@PPPRNE * @cantidad1 ) * ( @iva/100 ),0);	
					end
				--
				set @VANELI		= round( ( @PPPRNE * @cantidad1 ) - @VADTNELI, 0 );				
				set @VAIVLI	    = round( @VANELI * ( @iva/100 ),0);	
				set @VABRLI		= round( @VANELI + @VAIVLI, 0 ); 
				set @PPPRNERE1	= round( @VANELI / @cantidad1, 0 );
				set @PPPRNERE2	= round( @PPPRNERE1 * @RLUD, 0 );
				--
				if ( @xtido = 'NVV' )
				begin													
					update MAEPREM SET STOCNV1 = coalesce(STOCNV1,0) + (case when @unidad_tr=1 then @cantidad1 else @cantidad1*@RLUD end), 
									   STOCNV2 = coalesce(STOCNV2,0) + (case when @unidad_tr=1 then @cantidad1/@RLUD else @cantidad1 end) 
					WHERE EMPRESA = @empresa AND KOPR = @codigo ;
					--
					update MAEPR SET STOCNV1 = coalesce(STOCNV1,0) + (case when @unidad_tr=1 then @cantidad1 else @cantidad1*@RLUD end), 
									 STOCNV2 = coalesce(STOCNV2,0) + (case when @unidad_tr=1 then @cantidad1/@RLUD else @cantidad1 end) 
					WHERE KOPR = @codigo ;
					--
					if not exists ( select * from MAEST WHERE EMPRESA=@empresa AND KOSU=@sucursal AND KOBO=@bodega AND KOPR=@codigo )
					begin
						insert into MAEST (EMPRESA,KOSU,KOBO,KOPR) VALUES (@empresa,@sucursal,@bodega,@codigo)
					end
					update MAEST SET STOCNV1 = coalesce(STOCNV1,0) + (case when @unidad_tr=1 then @cantidad1 else @cantidad1*@RLUD end), 
									 STOCNV2 = coalesce(STOCNV2,0) + (case when @unidad_tr=1 then @cantidad1/@RLUD else @cantidad1 end) 
					WHERE EMPRESA=@empresa AND KOSU=@sucursal AND KOBO=@bodega AND KOPR=@codigo
				end
				--
				insert into MAEDDO (IDMAEEDO,ARCHIRST,IDRST,EMPRESA,TIDO,NUDO,ENDO,SUENDO,ENDOFI,LILG,NULIDO,SULIDO,LUVTLIDO,
									 BOSULIDO,KOFULIDO,NULILG,PRCT,TICT,TIPR,NUSEPR,KOPRCT,
									 UDTRPR,RLUDPR,CAPRCO1,CAPRAD1,CAPREX1,CAPRNC1,UD01PR,CAPRCO2,CAPRAD2,CAPREX2,CAPRNC2,UD02PR,
									 KOLTPR,MOPPPR,TIMOPPPR,TAMOPPPR,
									 PPPRNELT,PPPRNE,PPPRBRLT,PPPRBR,
									 NUDTLI,PODTGLLI,VADTNELI,VADTBRLI,
									 POIVLI,VAIVLI,NUIMLI,POIMGLLI,
									 VAIMLI,VANELI,VABRLI,
									 TIGELI,EMPREPA,TIDOPA,NUDOPA,ENDOPA,NULIDOPA,LLEVADESP,FEEMLI,FEERLI,PPPRPM,OPERACION,CODMAQ,ESLIDO,PPPRNERE1,PPPRNERE2,
									 ESFALI,CAFACO,CAFAAD,CAFAEX,CMLIDO,NULOTE,FVENLOTE,ARPROD,NULIPROD,NUCOCO,NULICO,PERIODO,FCRELOTE,SUBLOTE,NOKOPR,ALTERNAT,
									 PRENDIDO,OBSERVA,KOFUAULIDO,KOOPLIDO,MGLTPR,PPOPPR,TIPOMG,ESPRODLI,CAPRODCO,CAPRODAD,CAPRODEX,CAPRODRE,TASADORIG,CUOGASDIF,
									 SEMILLA,PROYECTO,POTENCIA,HUMEDAD,IDTABITPRE,IDODDGDV,LINCONDESP,PODEIVLI,VADEIVLI,PRIIDETIQ,KOLORESCA,KOENVASE,PPPRPMSUC,
									 PPPRPMIFRS,COSTOTRIB,COSTOIFRS,SUENDOFI,COMISION,FLUVTCALZA,FEERLIMODI)
				values ( @id,'',0,@empresa,@xtido,@nudoreal,@cliente,@suc_cliente,'','SI',right('0000'+rtrim(cast(@linea as varchar(9))),5),@sucursal,@luvt,
					    @bodega,@vendedor,'',0,'',@TIPR,'',@codigo,
					    @unidad_tr,@RLUD,
						case when @unidad_tr=1 then @cantidad1 else @cantidad1*@RLUD end,
						0,0,0,@UD01PR,
						case when @unidad_tr=1 then @cantidad1/@RLUD else @cantidad1 end,
						0,0,0,@UD02PR,
					    'TABPP'+@listaprecio,@monedaprecio,@tipomonedapre,1,
					    @PPPRNELT,@PPPRNE,@PPPRBRLT,@PPPRBR,
					    (case when @descuentos>0 then 1 else 0 end),@porcedes,@VADTNELI,@VADTBRLI,
					    @POIVLI,@VAIVLI,@NUIMLI,@POIMGLLI,@VAIMLI,
					    @VANELI,@VABRLI,
					    'I','','','','','',0,@fechaemision,@fechadespacho,@PM,'','','',@PPPRNERE1,@PPPRNERE2,
					    '',0,0,0,0,'',NULL,'','','','','',NULL,'',@NOKOPR,'',
					    0,'','','',0,0,0,'',0,0,0,0,1,0,
					    0,'',0,0,0,0,0,0,0,0,'','',@PMSUC,
					    @PMIFRS,@VANELI,@VANELI,'',0,'',@fechaemision )

				-- insercion del descuento si existe
				if ( @VADTNELI <> 0 ) 
				begin
					insert into MAEDTLI ( IDMAEEDO, NULIDO, KODT, PODT, VADT, LILG, OPERA,UNITAR )
								 values ( @id, right('0000'+rtrim(cast(@linea as varchar(9))),5), 'D_SIN_TIPO', @porcedes, @VADTNELI, '',   '',   0 )
				end
				--
			end

			FETCH NEXT FROM detalle_cursor   
			INTO @linea,@sucursal,@bodega,@codigo,@unidad_tr,@unidad1,@unidad2,@cantidad1,@cantidad2,
				 @listaprecio, @metodolista,@precio,@porcedes,@descuentos,@porcerec,@recargos,  @observacion,@valido, 
				 @TIPR,@RLUD,@UD01PR,@UD02PR,@NOKOPR,@PM,@PMSUC,@PMIFRS

		END
		--
		CLOSE detalle_cursor  
		DEALLOCATE detalle_cursor  
		--
	end
	--
	set @Error = @@ERROR
	if (@Error=0)
	begin
	    --
	    UPDATE MAEEDO set VANEDO = round(( select sum(VANELI)  from MAEDDO WHERE IDMAEEDO=@id ),0),
		                  VAIVDO = round(( select sum(VANELI)  from MAEDDO WHERE IDMAEEDO=@id ) * (@iva/100),0),
						  VAIMDO = 0,
						  CAPRCO = round(( select sum(case when UDTRPR=1 THEN CAPRCO1 ELSE CAPRCO2 END)  from MAEDDO WHERE IDMAEEDO=@id ),5)
		where IDMAEEDO = @id ;
		--
	    UPDATE MAEEDO set VABRDO = VANEDO + VAIVDO + VAIMDO
		where IDMAEEDO = @id ;
        --
        update ktp_encabezado set id_externo = @id, nro_externo = @nudoreal
        where id_preventa = @id_ktp ;

        -- sumas uno al numero para actualizar confiest si corresponde 
		exec ksp_valsgtecar @nudoreal, @nudorealmas1 output ;

		-- actualiza confiest
		if ( @xtido = 'NVV' )
		begin
			if not exists ( select * from CONFIEST with (nolock) where MODALIDAD=@modalidad AND EMPRESA=@empresa and ( NVV='' or NVV='0000000000' ) ) 
			begin
				update CONFIEST set NVV=@nudorealmas1 WHERE MODALIDAD=@modalidad AND EMPRESA = @empresa;
			end
		end
		else
		begin
			if not exists ( select * from CONFIEST with (nolock) where MODALIDAD=@modalidad AND EMPRESA=@empresa and ( COV='' or COV='0000000000' ) ) 
			begin
				update CONFIEST set COV=@nudorealmas1 WHERE MODALIDAD=@modalidad AND EMPRESA = @empresa;
			end
		end
		--

	end
	--
END;
go

--select top 10 * from MAEEDO order by IDMAEEDO DESC 
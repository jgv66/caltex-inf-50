-- ult modif. 24/08/2018: agregado telefonos a respuesta
-- select * from MAEEN WHERE KOEN LIKE '%10444%'
-- update MAEEN SET EMAILCOMER='jogv66@gmail.com' where KOEN LIKE '%10444%'

-- exec ksp_buscarClientes '','tobar gonza';
IF OBJECT_ID('ksp_buscarClientes', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_buscarClientes;  
GO  
CREATE PROCEDURE ksp_buscarClientes (
    @codcliente varchar(13) = '', 
    @razonsoc   varchar(50) = '',
    @inilista   varchar(13) = '',   
    @finlista   varchar(13) = '',
    @tipo       char(1)     = 'b' ) With Encryption
AS
BEGIN
 
    SET NOCOUNT ON;
 
    declare @kodigo     varchar(60);
    declare @descri     varchar(200);
    declare @query      NVARCHAR(2500);
    declare @xkoen      varchar(500);
    declare @xnokoen    varchar(500);
    declare @anterior   varchar(100) = '';
    declare @posterior  varchar(100) = '';
    declare @principal  varchar(100) = '';
 
    set @codcliente = RTRIM(@codcliente);
    set @razonsoc   = RTRIM(@razonsoc);
    set @inilista   = RTRIM(@inilista);
    set @finlista   = RTRIM(@finlista);
 
    set @query   = 'select top 20 EN.KOEN as codigo,EN.SUEN AS sucursal, EN.NOKOEN as razonsocial,EN.DIEN as direccion,';
    set @query  +=               'EN.KOFUEN as vendedor, PP.KOLT as listaprecios,PP.KOLT as listaprecio,';
    set @query  +=               'FU.NOKOFU as nombrevendedor, PP.NOKOLT as nombrelista,';
    set @query  +=               'CI.NOKOCI as ciudad, CM.NOKOCM as comuna, EN.EMAILCOMER as email,EN.FOEN as telefonos,';
    set @query  +=               '( case when EN.TIPOSUC='+char(39)+'S'+char(39)+' then '+char(39)+'suc'+char(39)+' else '+char(39)+char(39)+' end ) as tiposuc ';
    set @query  += 'FROM MAEEN AS EN WITH (NOLOCK) ';
    set @query  += 'left join TABFU as FU with (nolock) on FU.KOFU=EN.KOFUEN ';
    set @query  += 'left join TABPP as PP with (nolock) on '+char(39)+'TABPP'+char(39)+'+PP.KOLT=EN.LVEN ';
    set @query  += 'left join TABCI as CI with (nolock) on CI.KOPA=EN.PAEN AND CI.KOCI=EN.CIEN ';
    set @query  += 'left join TABCM as CM with (nolock) on CM.KOPA=EN.PAEN AND CM.KOCI=EN.CIEN AND CM.KOCM=EN.CMEN ';
 
    if @inilista<>'' set @anterior  = ' AND EN.KOEN < '+char(39)+@inilista+char(39)+' ';
    if @finlista<>'' set @posterior = ' AND EN.KOEN > '+char(39)+@finlista+char(39)+' ';
 
    -- pasadas por ksp_cambiatodo
    exec ksp_cambiatodo @codcliente, @salida = @kodigo OUTPUT ;
    exec ksp_cambiatodo @razonsoc,   @salida = @descri OUTPUT ;
 
    set @kodigo     = case when @kodigo<>'' then '%'+@kodigo+'%' else '' end;
    set @descri     = case when @descri<>'' then '%'+@descri+'%' else '' end;
 
    set @principal  = case when @tipo='p'   then ' AND EN.TIPOSUC='+char(39)+'P'+char(39)+' ' else '' end;
 
    if @descri<>'' and @kodigo<>''
    begin
        --
        exec ksp_TipoGoogle 'EN.KOEN',  @kodigo, @salida = @xkoen   output;
        exec ksp_TipoGoogle 'EN.NOKOEN',@descri, @salida = @xnokoen output;
        --
        if @inilista ='' AND @finlista=''
        begin
            set @query = concat( @query, ' WHERE ', @xkoen, ' AND ',  @xnokoen, @principal, ' ORDER BY EN.KOEN ' ); 
            EXECUTE sp_executesql @query
        end
        else
        begin
            set @query = concat( @query, ' WHERE ', @xkoen, ' AND ',  @xnokoen, @anterior, @posterior, @principal, ' ORDER BY EN.KOEN ' ); 
            EXECUTE sp_executesql @query
        end
    end
    else
    begin
        if @descri<>'' and @kodigo=''
        begin
            --
            exec ksp_TipoGoogle 'EN.NOKOEN',@descri, @salida = @xnokoen output;
            -- 
            if @inilista ='' AND @finlista=''
            begin
                set @query = concat( @query, ' WHERE ', @xnokoen, @principal, ' ORDER BY EN.KOEN ' ); 
                EXECUTE sp_executesql @query
            end
            else
            begin
                set @query = concat( @query, ' WHERE ', @xnokoen, @anterior, @posterior, @principal, ' ORDER BY EN.KOEN ' ); 
                EXECUTE sp_executesql @query
            end
        end         
        else
        begin 
            if @descri='' and @kodigo<>''
            begin
                --
                exec ksp_TipoGoogle 'EN.KOEN',  @kodigo, @salida = @xkoen   output;
                --
                if @inilista ='' AND @finlista=''
                begin
                    set @query = concat( @query, ' WHERE ', @xkoen, @principal, ' ORDER BY EN.KOEN ' ); 
                    EXECUTE sp_executesql @query
                end
                else
                begin
                    set @query = concat( @query, ' WHERE ', @xkoen, @anterior, @posterior, @principal, ' ORDER BY EN.KOEN ' ); 
                    EXECUTE sp_executesql @query
                end
            end 
        end
    end
END
GO

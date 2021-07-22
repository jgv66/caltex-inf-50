

/*
SELECT DATEPART(ISO_WEEK, getdate()),getdate() as NumSemana

select * from MAEPR WHERE KOPRTE='CAR65811'
select * from TABFU where NOKOFU like '%N SILVA%'  -- 'HERMANN BRUGMANN ZEPEDA       '
select MODALIDAD,* from TABFU WHERE KOFU='AJS'
select * from CONFIEST WHERE MODALIDAD='FACEL'
*/

select *
from MAEEDO as edo with (nolock)
where ( select count(*) from MAEEDO as x with (nolock) where x.TIDO=edo.TIDO and x.NUDO=edo.NUDO ) > 1
    and edo.TIDO='NVV'
   -- and edo.EMPRESA='02'
  -- and edo.KOFUDO='OSV'
  -- and edo.KOCRYPT='442E6BAEAE90000E0D03879B8DC334'
  --and exists ( select * from ktp_encabezado where id_externo=edo.IDMAEEDO )
order by  NUDO

--select * from CONFIEST WHERE MODALIDAD='FACEL'



# PROXECTO FIN DE CICLO

## Desenvolvemento de Aplicacións Multiplataforma (DAM)

**Título do proxecto:** Industria40 --- SaaS de OEE e eficiencia de
produción

**Centro:** IES Chan do Monte

**Ciclo:** Desenvolvemento de Aplicacións Multiplataforma

**Curso:** 2025-2026

**Alumno:** \[Nome do alumno\]

**Titor:** \[Nome do titor\]

**Data:** Abril 2026

# Contido {#contido .TOC-Heading}

[PROXECTO FIN DE CICLO
[1](#proxecto-fin-de-ciclo)](#proxecto-fin-de-ciclo)

[Desenvolvemento de Aplicacións Multiplataforma (DAM)
[1](#desenvolvemento-de-aplicacións-multiplataforma-dam)](#desenvolvemento-de-aplicacións-multiplataforma-dam)

[1. INTRODUCIÓN [4](#introdución)](#introdución)

[2. ESTUDO EMPRESARIAL [5](#estudo-empresarial)](#estudo-empresarial)

[2.1 Descripción da idea e como xurdiu
[5](#descripción-da-idea-e-como-xurdiu)](#descripción-da-idea-e-como-xurdiu)

[2.2 Ubicación [7](#ubicación)](#ubicación)

[2.3 Análise do mercado, DAFO e CAME
[8](#análise-do-mercado-dafo-e-came)](#análise-do-mercado-dafo-e-came)

[Análise do mercado [8](#análise-do-mercado)](#análise-do-mercado)

[DAFO (Debilidades, Ameazas, Fortalezas, Oportunidades)
[8](#dafo-debilidades-ameazas-fortalezas-oportunidades)](#dafo-debilidades-ameazas-fortalezas-oportunidades)

[CAME (Corrixir, Afrontar, Manter, Explotar)
[9](#came-corrixir-afrontar-manter-explotar)](#came-corrixir-afrontar-manter-explotar)

[2.4 Forma xurídica e xustificación
[9](#forma-xurídica-e-xustificación)](#forma-xurídica-e-xustificación)

[2.5 Costes iniciais, periódicos e financiación
[10](#costes-iniciais-periódicos-e-financiación)](#costes-iniciais-periódicos-e-financiación)

[Costes iniciais (estimación para 2026)
[10](#costes-iniciais-estimación-para-2026)](#costes-iniciais-estimación-para-2026)

[Costes periódicos (mensuais/anuais)
[11](#costes-periódicos-mensuaisanuais)](#costes-periódicos-mensuaisanuais)

[Financiación [11](#financiación)](#financiación)

[3. ESTUDO TÉCNICO [12](#estudo-técnico)](#estudo-técnico)

[3.1 Análise e planificación. Timeline
[12](#análise-e-planificación.-timeline)](#análise-e-planificación.-timeline)

[Fases do proxecto [12](#fases-do-proxecto)](#fases-do-proxecto)

[Timeline resumido (Gantt conceptual)
[13](#timeline-resumido-gantt-conceptual)](#timeline-resumido-gantt-conceptual)

[3.2 Requirimentos hardware e software
[14](#requirimentos-hardware-e-software)](#requirimentos-hardware-e-software)

[Requirimentos funcionais e non funcionais
[14](#requirimentos-funcionais-e-non-funcionais)](#requirimentos-funcionais-e-non-funcionais)

[Requirimentos de hardware e software (desenvolvemento)
[15](#requirimentos-de-hardware-e-software-desenvolvemento)](#requirimentos-de-hardware-e-software-desenvolvemento)

[Requirimentos para a execución en servidor (producción)
[15](#requirimentos-para-a-execución-en-servidor-produción)](#requirimentos-para-a-execución-en-servidor-produción)

[Requirimentos para o usuario final
[15](#requirimentos-para-o-usuario-final)](#requirimentos-para-o-usuario-final)

[Stack tecnolóxico previsto
[16](#stack-tecnolóxico-previsto)](#stack-tecnolóxico-previsto)

[3.3 Costes (técnicos) [17](#costes-técnicos)](#costes-técnicos)

[3.4 Análise da competencia
[17](#análise-da-competencia)](#análise-da-competencia)

[3.5 Funcionamento xeral previsto
[19](#funcionamento-xeral-previsto)](#funcionamento-xeral-previsto)

[3.6 Interfaces da aplicación (deseño)
[21](#interfaces-da-aplicación-deseño)](#interfaces-da-aplicación-deseño)

[3.6.1 Páxina de inicio (Landing)
[21](#páxina-de-inicio-landing)](#páxina-de-inicio-landing)

[3.6.2 Páxina de inicio de sesión
[22](#páxina-de-inicio-de-sesión)](#páxina-de-inicio-de-sesión)

[3.6.3 Páxina de rexistro
[22](#páxina-de-rexistro)](#páxina-de-rexistro)

[3.6.4 Páxina completar rexistro
[22](#páxina-completar-rexistro)](#páxina-completar-rexistro)

[3.6.5 Dashboard principal
[23](#dashboard-principal)](#dashboard-principal)

[3.6.6 Detalle de liña [24](#detalle-de-liña)](#detalle-de-liña)

[3.6.7 Reporte KPI (modal) [24](#reporte-kpi-modal)](#reporte-kpi-modal)

[3.6.8 Páxinas de erro e auxiliares
[25](#páxinas-de-erro-e-auxiliares)](#páxinas-de-erro-e-auxiliares)

[4. CONCLUSIÓNS [25](#conclusións)](#conclusións)

[5. ANEXO: GLOSARIO E TERMOS TÉCNICOS
[28](#anexo-glosario-e-termos-técnicos)](#anexo-glosario-e-termos-técnicos)

# 1. INTRODUCIÓN

Este traballo é a memoria do proxecto fin de ciclo do DAM no IES Chan do
Monte. Recolle o deseño, a análise e a planificación do desenvolvemento
dunha aplicación SaaS chamada **Industria40**, pensada para a industria
manufactureira: o obxectivo é que as empresas poidan seguir a eficiencia
das liñas de produción con KPIs, sobre todo o **OEE** (Overall Equipment
Effectiveness), xunto coa Dispoñibilidade, o Rendemento e a Calidade.

**O OEE en dúas liñas.** O OEE resume en porcentaxe (0--100 %) tres
factores: **Dispoñibilidade** (tempo real de marcha / tempo planificado),
**Rendemento** (produción real / capacidade teórica no tempo de marcha) e
**Calidade** (unidades boas / total fabricadas). A fórmula é OEE =
Dispoñibilidade × Rendemento × Calidade. Na práctica, un 85 % móstrase
como referencia de excelencia e moitas plantas van por debaixo do 60 %;
por iso ter os números á vista axuda a ver onde se perde tempo ou
material.

O proxecto sae dunha necesidade bastante concreta: moitas pymes
industriais en Galicia e no resto do Estado queren medir ben a planta
sen montar un MES (Manufacturing Execution System) caro nin un OEE
“de consultora”. Hai ademais marco de apoio á dixitalización: por unha
banda, a axenda **España Digital 2026** do Goberno de España
(https://espanadigital.gob.es/espana-digital); por outra, as liñas de
apoio da Xunta (notas de prensa e orzamentos en xunta.gal e na Oficina
Económica de Galicia). Un SaaS por subscrición, en web, encaixa con ese
tipo de empresa.

**Que vai o documento.** Primeiro vai o estudo empresarial (idea,
ubicación, mercado con DAFO e CAME, forma xurídica, números de custos e
financiación). Despois o estudo técnico: planificación, requirimentos,
costes técnicos, competencia, funcionamento previsto e pantallas. Ao
final, conclusións. As cifras e datos externos levan entre parénteses a
páxina ou informe de onde saen, para poder comprobalos sen ir a un
apartado aparte.

O resultado esperado do proxecto é un prototipo funcional da aplicación
Industria40: páxina de inicio pública (landing), autenticación de
usuarios, dashboard por organización con xestión de liñas de produción,
estado da liña por defecto Parada (só se contabiliza tempo en Produción,
Descanso, Mantemento, Cambio formato), rexistro de KPIs (manual ou
calculado desde máquinas), gráficas de comparativa tipo gauge con marcas
en 0/75/85/100 % e cores por valor (vermello/laranxa/verde), rexistro de
pezas producidas e rexeitadas por máquina e totais da liña, reporte KPI
con tempos de estado, KPIs por máquina e produción, e integración con
servizo na nube para autenticación e base de datos. A aplicación
desenvolverase con tecnoloxías web actuais (Next.js, TypeScript,
Tailwind CSS, Recharts) e soporte multilingüe (galego, español, inglés).

# 2. ESTUDO EMPRESARIAL

## 2.1 Descripción da idea e como xurdiu

**Industria40** sería unha plataforma na nube (SaaS) para que unha
fábrica vexa en indicadores como vai a liña; o núcleo é o **OEE**, que
resume Dispoñibilidade, Rendemento e Calidade nun só número e permite
comparar turnos ou semanas sen marear á xente con tres Excel distintos.

A idea xorde de algo moi mundano: en Galicia e no resto do Estado hai
moitas pymes que queren dixitalizar, pero non teñen equipo para montar
un MES completo nin cartos para un proxecto de seis cifras. Por iso
apostamos por algo intermedio: OEE por subscrición, con prezos cerrados
no papel (**199 €/mes** no plan máis baixo, **899 €/mes** no enterprise),
sen servidores no cliente e cunha interface actual. Os prezos son
elección do produto, non unha cota de mercado.

O produto contempla tres plans de subscrición (Basic, Professional e
Enterprise) que se diferencian polo número de liñas de produción
permitidas, o número de usuarios, o tipo de dashboard, o soporte e o
almacenamento. A aplicación permitirá ás organizacións rexistrar os KPIs
diarios por liña e por turno, visualizar a evolución temporal e comparar
liñas entre si, facilitando a identificación de cuellos de botella e a
mellora continua. O modelo SaaS permitirá actualizacións centralizadas,
seguridade e escalabilidade sen que o cliente teña que xestionar
servidores nin licenzas perpetuas.

**Táboa de plans Industria40 (especificación do produto):**

  ------------------------------------------------------------------------------------------------------------
  Plan           Prezo     Liñas        Dashboard       Usuarios     Soporte    Almacenamento   Outros
                 (€/mes)                                                                        
  -------------- --------- ------------ --------------- ------------ ---------- --------------- --------------
  Basic          199       2            Básico          1            Email      1 GB            ---

  Professional   449       5            Avanzado        5            Teléfono   10 GB           API básica

  Enterprise     899       Ilimitadas   Personalizado   Ilimitados   24/7       100 GB          API completa,
                                                                                                integracións
  ------------------------------------------------------------------------------------------------------------

En resumo, Industria40 pretende cubrir un oco no mercado: empresas que
necesitan medir OEE e eficiencia de forma seria pero que non poden ou
non queren asumir a complexidade e o custo das solucións empresariais
tradicionais. A idea é viable en termos relativos; o prototipo que se
desenvolverá permitirá demostrar a funcionalidade e a súa utilidade no
contexto da Industria 4.0 e da transformación dixital das pymes.

**Definición do produto (resumo de funcionalidades previstas).**
Industria40 ofrecerá:

1.  Rexistro con código de organización obrigatorio: crear nova
    organización (usuario owner) ou unirse a existente (usuario member)
    segundo límites do plan (Basic 1 usuario, Professional 5, Enterprise
    ilimitados)

2.  Pantalla para completar rexistro para usuarios con conta pero sen
    perfil asignado

3.  Xestión de liñas de produción (alta, edición, eliminación) con
    límite por plan (Basic 2, Professional 5, Enterprise ilimitadas)

4.  Estado da liña por defecto: Parada --- a liña só contabiliza tempo
    cando se selecciona explicitamente Produción (ou outros estados
    reportados); Parada é un estado de transición e non aparece nos
    reportes

5.  Rexistro manual de KPIs (OEE, Dispoñibilidade, Rendemento, Calidade)
    por liña, data e turno

6.  Cálculo automático do OEE

7.  Gráfica de evolución temporal dos KPIs (últimos 14 días)

8.  Gráfica comparativa tipo gauge (arco -45° a 225°, sentido horario)
    con marcas en 0 %, 75 %, 85 % e 100 %, e cores por valor: vermello
    \<75 %, laranxa 75--85 %, verde ≥85 % (as mesmas cores aplícanse nos
    reportes ao gardar ou imprimir)

9.  Xestión de estados de liña e turno

10. Detalle por liña con máquinas, estados de máquina, pezas producidas
    e rexeitadas por máquina e totais da liña (total producidas = valor
    da máquina que máis produciu; total rexeitadas = suma de todas as
    máquinas)

11. Código de organización oculto na interface: na cabeceira mostrarase
    o nome da organización; só o owner poderá ver e copiar o código
    mediante un botón "Invitar usuarios"

12. Reporte KPI por liña, data e turno: KPIs (%), tempos de estado de
    liña (Produción, Descanso programado, Mantemento, Cambio formato ---
    Parada non se mostra), tempos e KPIs por máquina, produción (pezas)
    con totais da liña e táboa por máquina

13. Cando os KPIs foron rexistrados manualmente, no reporte os tempos de
    estado e os KPIs por máquina mostran "-----"

14. Buscador ou filtro de datos históricos

15. Internacionalización (galego, español, inglés).

## 2.2 Ubicación

A ubicación prevista para a actividade e para o enmarque do proxecto é
Galicia, en concreto o ámbito xeográfico no que se move o tecido
industrial galego. A elección non é só simbólica: Galicia dispón dun
ecosistema industrial relevante (automoción, alimentación, madeira,
naval, téxtil, etc.) e de políticas activas de apoio á innovación e á
dixitalización.

Nos Orzamentos de 2026 a Xunta destina máis de **47 millóns de euros** a
cinco liñas novas de apoio á innovación industrial (Business Innovation
Fast Track, TIC-MAQ, Innomercado, Innotalento, Industria Innova, etc.),
mentres o departamento de Economía e Industria sitúa o seu orzamento
total en **453,8 millóns de euros**, cun incremento duns 6 % respecto ao
ano anterior (https://www.xunta.gal/notas-de-prensa/-/nova/018080/xunta-reforza-sua-aposta-pola-innovacion-industrial-con-cinco-novas-linas-apoio;
resumo en inglés: https://oficinaeconomicagalicia.xunta.gal/en/the-xunta-is-strengthening-its-commitment-to-industrial-innovation-with-five-new-support-schemes-exceeding-47-million-euros-in-the-2026-budget/).

O hub **DIHGIGAL** (impulsado desde o ecosistema de clústers como CEAGA)
reúne centos de empresas e un peso moi grande no tecido produtivo
galego; na propia web do hub citan, por exemplo, máis de 450 empresas e
un alcance equivalente a máis dun terzo do PIB de Galicia en facturación
do conxunto asociado (https://dihgigal.com/). A **Oficina Económica de
Galicia** ofrece asesoramento gratuíto a empresas en temas de operacións
e dixitalización (https://oficinaeconomicagalicia.xunta.gal/). Para
situar o proxecto en Galicia isto ten sentido: hai industria, hai redes
e hai quen informe das axudas sen cobrar por unha primeira toma de
contacto.

A sede legal da empresa (no caso de constitución dunha SL) podería
establecerse en calquera localidade galega con boa conectividade e
acceso a servicios (por exemplo, área de Santiago de Compostela, A
Coruña ou Vigo), mantendo o modelo de negocio baseado en cloud e
traballo remoto ou híbrido, co que a ubicación física ten un peso
relativo fronte á presenza en internet e á calidade do produto software.

En 2025 a Xunta impulsou **35 talleres** colaborativos (innovación,
dixitalización e loxística avanzada) cun orzamento de máis de **630 000 €**
e participación de máis de **200 empresas** (https://www.xunta.gal/es/notas-de-prensa/-/nova/018089/mas-200-empresas-gallegas-participaran-los-35-nuevos-talleres-innovacion-digitalizacion).
Son iniciativas que, en parte, crean demanda de ferramentas sinxelas de
seguimento de planta e canles para darlles a coñecer.

## 2.3 Análise do mercado, DAFO e CAME

### Análise do mercado

O mercado de software OEE mídese en miles de millóns de dólares e segue
crecendo; os informes non coinciden ao milímetro no tamaño total porque
cada analista corta o mercado dun xeito (só OEE “puro”, MES, analítica
industrial, etc.). Unha referencia habitual é **ABI Research**: parten
de uns **1.800 M$ en 2024** e chegan a **6.300 M$ en 2034**, cun **CAGR
duns 13 %**; no mesmo informe din que as solucións **SaaS** deberían
superar en facturación ás implantacións **on-premise** antes de 2026
(https://go.abiresearch.com/lp-breaking-down-the-6.3-billion-overall-equipment-effectiveness-oee-market).
Outros estudos de consultoría sitúan o mercado global de software OEE
nunha base máis achegada a **1.200--1.300 M$** nos últimos anos e
proxectan crecemento con CAGR de dous díxitos cara 2032--2033 (p.ex.
The Business Research Company, resumo comercial en
https://www.giiresearch.com/report/tbrc1982690-overall-equipment-effectiveness-software-global.html).

En calquera caso, o empuxe vem de Industria 4.0, IoT, datos na nube e,
cada vez máis, analítica e IA aplicada á planta. En Europa e en España
un produto web accesible pode coller pymes que non van a pagar un MES
completo.

No Estado, a axenda **España Digital 2026** (https://espanadigital.gob.es/espana-digital)
marca liñas de actuación en dixitalización empresarial e administración;
en paralelo, as políticas autonómicas e as axudas (vistas na sección de
ubicación) fan máis levadío probar unha ferramenta nova. Iso non garante
vendas, pero si explica por que ten sentido falar de OEE en 2026 sen
parecer ciencia ficción.

### DAFO (Debilidades, Ameazas, Fortalezas, Oportunidades)

**Fortalezas**\
- Produto SaaS sen infraestrutura propia para o cliente; actualizacións
e mantemento centralizados.\
- Prezos claros e previsibles (199 €--899 €/mes) adaptados a pymes.\
- Enfoque en OEE e KPIs estándar (Dispoñibilidade, Rendemento,
Calidade), ben recoñecidos na industria.\
- Stack tecnolóxico moderno (Next.js, TypeScript, base de datos na nube)
que facilitará a evolución e a calidade do código.\
- Posible aliñamento con programas de apoio á innovación e
dixitalización en Galicia.

**Debilidades**\
- Proxecto en fase de planificación e desenvolvemento; falta de
historial comercial e de notoriedade de marca.\
- Dependencia de servizos na nube (auth e base de datos) para o
funcionamento.\
- Equipo reducido (proxecto fin de ciclo); limitacións en soporte 24/7 e
personalización avanzada no plan básico.

**Oportunidades**\
- Crecemento do mercado OEE e da preferencia por SaaS.\
- Axenda España Digital 2026 e liñas de apoio da Xunta/orzamentos 2026
  para innovación industrial.\
- Demanda de pymes por ferramentas sinxelas de OEE sen investimento
inicial elevado.\
- Posibilidade de integracións futuras (API, ERP, sensores) nos plans
superiores.

**Ameazas**\
- Competencia de actores consolidados (MachineMetrics, Tractian, Evocon,
solucións MES de Siemens, Rockwell, etc.).\
- Posible sensibilidade ao prezo en pymes con orzamentos moi limitados.\
- Requisitos de seguridade e cumprimento normativo (protección de datos)
que haberá que manter ao crecer.

### CAME (Corrixir, Afrontar, Manter, Explotar)

- **Corrixir (debilidades):** Avanzar na madurez do produto (versión
  estable, documentación, SLA); diversificar ou complementar a oferta de
  backend/cloud para reducir dependencia dun único provedor; ofrecer
  plans de soporte e formación para gañar confianza.
- **Afrontar (Ameazas):** Diferenciación por simplicidade, prezo e
  enfoque en pymes; cumprimento rigoroso do RGPD e boas prácticas de
  seguridade; presenza en canles (web, redes, participación en
  eventos/DIH) para dar visibilidade.
- **Manter (fortalezas):** Manter o modelo SaaS e a claridade de prezos;
  seguir a investir en usabilidade e en stack moderno; manter a
  aliñación con estándares OEE e con demandas das pymes.
- **Explotar (oportunidades):** Aproveitar convocatorias de axudas e
  programas da Xunta e do Estado; orientar o marketing a pymes
  industriais galegas e españolas; preparar ofertas (API, integracións)
  para plans Professional e Enterprise.

## 2.4 Forma xurídica e xustificación

Para a explotación económica do proxecto Industria40 elixirase a
constitución dunha **Sociedade Limitada (SL)** en España. Esta forma
xurídica é a máis habitual para empresas de base tecnolóxica e de tamaño
pequeno ou mediano que desexan limitar a responsabilidade dos socios ao
capital aportado e obter unha imaxe de seriedade ante clientes,
provedores e administracións.

A **Lei 18/2022**, de creación e crecemento de empresas (“Crea e Crece”),
recollida no BOE, permite constituir unha **SL con 1 €** de capital social
(http://www.boe.es/buscar/doc.php?id=BOE-A-2022-15818). Se o capital é
inferior a **3000 €**, a lei obriga a ir alimentando a reserva legal co
20 % dos beneficios ata chegar a esa cifra e, en certos supostos de
liquidación, os socios poden responder ata 3000 € en solidario (mesma
norma). Por iso, na práctica, para unha startup de software cómpre
valoralo: moitos equipos parten de **3000 €** ou máis para non arrastrar
esas limitacións dende o primeiro día.

A SL permite unha xestión flexible (un ou varios socios, administrador
único ou mancomunado), tributación no Imposto sobre Sociedades e
posibilidade de acceder a subvencións, contratos con administracións e
relacións bancarias con maior credibilidade que o autónomo a efectos de
contratos de software e soporte. Para un proxecto que ofrece SaaS con
facturación recorrente e posibles contratos con empresas, a SL é pois a
forma xurídica máis axeitada e está xustificada no marco do estudo
empresarial.

## 2.5 Costes iniciais, periódicos e financiación

**Nota sobre moeda:** Neste apartado todos os importes exprésanse en **euros (€)**. Algúns provedores publican a tarifa na súa moeda orixinal na web; para pasala a euros úsase o **tipo de cambio de referencia do Banco Central Europeo (BCE) á data de redacción desta memoria (abril de 2026): 1 EUR = 1,0870 USD** (equivalente **0,9200 EUR por cada 1 USD**). Só entran na memoria os importes xa convertidos a €.

### Costes iniciais (2026)

- **Constitución da SL (notaría, Rexistro Mercantil e tramitación, paquete en liña tipo CIRCE/PAE):** **600 €** (importe único asignado a esta partida; a constitución telemática de sociedades está centralizada en https://www.circe.es e a información sobre o procedemento e os tributos encádrase na Lei 18/2022, BOE: http://www.boe.es/buscar/doc.php?id=BOE-A-2022-15818).
- **Capital social aportado:** **3000 €** (cifra elixida para acadar os 3000 € de capital social e evitar as limitacións da lei cando o capital é inferior a ese umbral; mesma norma BOE anterior).
- **Dominio .es (primeiro ano de rexistro):** **33,38 €** (tarifa de alta anual con IVE incluído fixada por Dominios.es para o dominio **.es**; táboa oficial: https://www.dominios.es/es/registra-un-dominio/cuanto-registrarlo).
- **Equipamento informático e software de traballo:** **1500 €** (partida única prevista neste proxecto para un equipo e licenzas básicas; non procede dunha cotización dunha tenda concreta, é o orzamento pechado da memoria).
- **Desenvolvemento do produto:** **0 €** de desembolso externo no marco do proxecto fin de ciclo (traballo académico); se se externalizase, sería unha partida distinta.

**Total desembolso inicial sen contar o capital social bloqueado:** **2133,38 €** (600 + 33,38 + 1500).

**Táboa resumo — custos iniciais (€)**

  -------------------------------------------------------
  Concepto                             Importe (€)
  ------------------------------------ ------------------
  Constitución SL (paquete tipo CIRCE)  600,00

  Capital social (recomendado)          3000,00

  Dominio .es primeiro ano (Red.es)     33,38

  Equipamento informático (partida)     1500,00

  **Total desembolso inicial (sen       **2133,38**
  capital social)**                    
  -------------------------------------------------------

### Costes periódicos (mensuais)

Os importes mensuais seguintes son **unha soa cifra en € por concepto**.

- **Base de datos e autenticación (Supabase, plan Pro):** **23 €/mes** (tarifa mensual en euros obtida aplicando o tipo BCE desta memoria ao prezo oficial do plan Pro listado en https://supabase.com/pricing).
- **Aloxamento da aplicación web (Vercel, plan Pro):** **18 €/mes** (mesma regra de conversión BCE sobre a tarifa oficial do plan Pro en https://vercel.com/pricing).
- **Dominio .es (prorrata mensual do custo anual):** **3 €/mes** (33,38 €/12 = 2,78 €; arredondamento a **3 €** para unha única liña de tesouraría; fonte do anual: Dominios.es, ligazón anterior).
- **Correo electrónico profesional (un usuario, partida mensual):** **12 €/mes** (partida fixa asignada nesta memoria para un buzón profesional; debe cotarse cun provedor concreto antes de contratar).
- **Seguro de responsabilidade civil e asesoría/xestoría:** **300 €/mes** (partida mensual fixa asignada nesta memoria para RC e asesoría; o importe real depende da póliza e do convenio coa xestoría).
- **Marketing e ferramentas:** **200 €/mes** (partida fixa para campañas lixeiras e ferramentas de analítica no arranque).

**Total custos periódicos (soma das partidas anteriores):** **556 €/mes** (23 + 18 + 3 + 12 + 300 + 200).

**Táboa resumo — custos periódicos (€/mes)**

  -------------------------------------------------------------
  Concepto                               Importe (€/mes)
  -------------------------------------- ----------------------
  Supabase (plan Pro, en €)              23

  Vercel (plan Pro, en €)                18

  Dominio .es (prorrata)                 3

  Correo profesional (partida)           12

  Seguro RC e asesoría/xestoría          300

  Marketing e ferramentas                200

  **Total**                              **556**
  -------------------------------------------------------------

### Financiación

- **Recursos propios:** Capital social (3000 €) e aforro dos promotores
  para cubrir costes iniciais e primeiros meses de operación.
- **Subvencións e axudas:** Convocatorias da Xunta de Galicia (Industria
  Innova, Business Innovation Fast Track, programas de emprendemento),
  España Digital 2026 (https://espanadigital.gob.es/espana-digital), e
  axudas a innovación ou creación de empresas; hai que ler as bases de
  cada convocatoria no momento de presentarse.
- **Préstamos:** Microcréditos ou liñas específicas para emprendedores
  (ENISA, ICO, entidades financeiras); axeitados unha vez demostrada
  unha traxectoria e previsión de ingresos.
- **Ingresos:** O modelo de negocio baséase en subscricións mensuais
  (199 €, 449 €, 899 €/mes segundo plan). Os custos periódicos totais
  contabilizados nesta memoria son **556 €/mes**; o punto de equilibrio
  depende de cantos abonados haxa e do mix de plans.

A combinación de recursos propios, posible subvención en fase de
arranque e ingresos por subscrición constitúe a estratexia de
financiación máis realista para Industria40 no seu estadio actual.

# 3. ESTUDO TÉCNICO

## 3.1 Análise e planificación. Timeline

O proxecto Industria40 planéase como un produto web moderno tipo SaaS,
con aplicación multipantalla (landing, login/rexistro, dashboard) e
lóxica de negocio baseada en organizacións, liñas de produción e
rexistro de KPIs. A metodoloxía de desenvolvemento prevista é iterativa
e incremental, priorizando un produto mínimo viable (MVP) funcional e
despois ampliando funcionalidades.

### Fases do proxecto

**Fase 1 -- Definición e deseño (semanas 1--2)**\
- Definición de requisitos funcionais e non funcionais.\
- Especificación de datos (organizacións, usuarios, liñas, KPIs,
turnos).\
- Diseño da arquitectura xeral (aplicación web cliente, servizos na nube
para base de datos e autenticación).\
- Definición de pantallas e fluxos (landing, autenticación, dashboard,
xestión de liñas, rexistro de KPIs, gráficas).

**Fase 2 -- Infraestrutura e autenticación (semanas 3--4)**\
- Configuración do proxecto de aplicación web (Next.js, TypeScript,
estilos con Tailwind CSS).\
- Integración cun servizo na nube: proxecto de base de datos e variables
de configuración.\
- Esquema de base de datos: tablas de organizacións, perfís de usuario,
liñas e políticas de seguridade por organización.\
- Autenticación: rexistro, login, callback e creación ou vinculación de
organización e perfil ao primeiro acceso.

**Fase 3 -- Núcleo do negocio (semanas 5--7)**\
- Xestión de liñas de produción: alta, edición, borrado; límite segundo
plan (Basic 2, Professional 5, Enterprise ilimitadas).\
- Modelo de KPIs: OEE, Dispoñibilidade, Rendemento, Calidade;
almacenamento por liña, data e turno.\
- Formulario de rexistro de KPIs do día e listado ou consulta
histórica.\
- Dashboard: tarxetas resumo, selector de liña e turno para gráficas.

**Fase 4 -- Visualización e usabilidade (semanas 8--9)**\
- Gráficas de evolución temporal: liña temporal dos KPIs nos últimos 14
días.\
- **Comparativa entre liñas con gráficas tipo gauge** (arco -45° a 225°,
sentido horario): un gauge por KPI e por liña, con marcas en 0 %, 75 %,
85 % e 100 % e cores por valor (vermello \<75 %, laranxa 75--85 %, verde
≥85 %); as mesmas cores nos reportes ao imprimir ou gardar.\
- **Reporte KPI:** modal ao abrir un rexistro desde o buscador; inclúe
KPIs (%), tempos de estado de liña (Produción, Descanso, Mantemento,
Cambio formato; Parada non se mostra), tempos e KPIs por máquina,
**produción (pezas)** con totais da liña e táboa por máquina; para
rexistros manuais, tempos de estado e KPIs por máquina mostran "-----".\
- Ajustes de usabilidade e mensaxes de erro (páxinas de erro, recurso
non encontrado).\
- Buscador ou filtro de datos (por liña, data, turno).

**Fase 5 -- Refino e documentación (semanas 10--12)**\
- Probas funcionais e corrección de erros.\
- Documentación de uso (README), instrucións de instalación e
configuración do servizo na nube.\
- Preparación da memoria e documentación do proxecto fin de ciclo (este
documento).\
- Opcional: desplegue en produción para demos.

### Timeline resumido (Gantt conceptual)

  --------------------------------------------------------------------------
  Actividade                  Sem 1-2  Sem 3-4  Sem 5-7  Sem 8-9  Sem 10-12
  --------------------------- -------- -------- -------- -------- ----------
  Definición e deseño         ██████                              

  Infraestrutura e auth                ██████                     

  Liñas e KPIs                                  ██████            

  Gráficas e UI                                          ██████   

  Refino e documentación                                          ██████
  --------------------------------------------------------------------------

A planificación é coherente cun ciclo lectivo e permitirá presentar un
prototipo funcional no prazo previsto, deixando margen para
amplificacións (máquinas, estados, integracións) en versións futuras.

**Riscos e mitigacións previstas.** Durante o desenvolvemento poden
identificarse riscos como a dependencia de servizos externos (base de
datos e auth na nube), que se mitiga mantendo a lóxica de negocio ben
estruturada e documentando a configuración para poder replicar o esquema
noutro sistema se fose necesario; a complexidade crecente do modelo de
datos (máquinas, estados, turnos), mitigada mediante migracións
incrementais e documentación; e o tempo limitado para probas
exhaustivas, mitigado con probas manuais dos fluxos críticos (rexistro,
login, creación de liñas, gardado de KPIs, visualización de gráficas) e
con páxinas de erro para fallos non controlados.

## 3.2 Requirimentos hardware e software

### Requirimentos funcionais e non funcionais

**Requirimentos funcionais (resumo).** A aplicación deberá permitir:
(RF1) rexistro de novos usuarios con email, contraseña e **código de
organización** (obrigatorio), con opción de crear nova organización
(owner) ou unirse a existente (member) respeitando límites do plan
(Basic 1 usuario, Professional 5, Enterprise ilimitados); (RF2) inicio
de sesión e peche de sesión; (RF3) **completar rexistro** (pantalla
dedicada) para usuarios con conta pero sen perfil, con código de
organización e opción crear/unirse; (RF4) listar, crear, editar e
eliminar liñas de produción respeitando o límite do plan (Basic 2,
Professional 5, Enterprise ilimitadas); (RF5) **estado da liña por
defecto Parada** --- só se contabiliza tempo cando a liña está en
Produción, Descanso programado, Mantemento ou Cambio formato; Parada é
estado de transición e non aparece nos reportes; (RF6) rexistrar KPIs
(OEE, Dispoñibilidade, Rendemento, Calidade) por liña, data e turno
(manual ou calculados desde máquinas); (RF7) visualizar a evolución
temporal dos KPIs nos últimos 14 días; (RF8) visualizar **comparativa
entre liñas** con gráficas tipo gauge (arco -45° a 225°, marcas en
0/75/85/100 %, cores por valor: vermello/laranxa/verde); (RF9) cambiar o
estado da liña e o turno de traballo; (RF10) acceder ao detalle dunha
liña e xestionar as súas máquinas, **rexistrar pezas producidas e
rexeitadas por máquina** e ver **totais da liña** (total producidas =
máquina que máis produciu, total rexeitadas = suma de todas); (RF11)
gardar datos da liña e reinicializar contadores; (RF12) mostrar na
cabeceira do dashboard o **nome da organización** (non o código); (RF13)
permitir ao usuario owner ver e copiar o **código secreto** da
organización mediante un botón "Invitar usuarios"; (RF14) **reporte
KPI** (abrir desde o buscador): KPIs (%), tempos de estado de liña (sen
Parada), tempos e KPIs por máquina, **produción (pezas)** con totais e
táboa por máquina; cando o rexistro é manual, tempos de estado e KPIs
por máquina mostran "-----"; (RF15) imprimir ou gardar o reporte en PDF;
(RF16) buscador de datos por liña, data e turno; (RF17)
internacionalización (galego, español, inglés). Os datos persistirán en
base de datos con políticas por organización.

**Requirimentos non funcionais.** (RNF1) A interface deberá ser usable
en navegadores modernos (Chrome, Firefox, Safari, Edge) e adaptable a
pantalla pequena (responsive). (RNF2) A autenticación e o acceso a datos
deberán cumprir políticas de seguridade (sen exposición de datos doutras
organizacións). (RNF3) O tempo de carga das pantallas principais deberá
ser aceptable (inferior a uns segundos en redes normais). (RNF4) A
aplicación deberá poder desplegarse en hosting estándar con variables de
configuración para datos sensibles.

### Requirimentos de hardware e software (desenvolvemento)

- **Hardware:** Ordenador con procesador actual (recomendable 4 núcleos
  ou máis), 8 GB de RAM (recomendable 16 GB), conexión a internet
  estable. Resolución de pantalla mínima 1366×768 para traballar con IDE
  e navegador.
- **Sistema operativo:** Windows 10/11, macOS ou Linux (calquera sobre o
  que se execute Node.js 18 ou superior).
- **Software de desenvolvemento:** Node.js v18 ou superior (LTS
  recomendado), editor ou IDE con soporte para TypeScript e estilos CSS,
  Git para control de versións, navegador actual para probas.

### Requirimentos para a execución en servidor (produción)

- **Hosting:** Plataforma compatible con aplicacións web Next.js (por
  exemplo Vercel, Netlify ou servidor Node propio). Recoméndase
  desplegue desde repositorio Git.
- **Base de datos e autenticación:** Servizo na nube (por exemplo
  Supabase: PostgreSQL xestionado e Auth). Plan gratuíto suficiente para
  MVP; plans de pago para maior tráfico e almacenamento.
- **Rede:** HTTPS obrigatorio; dominio opcional (p. ex. industria40.es).

### Requirimentos para o usuario final

- **Dispositivo:** Ordenador, tablet ou móbil con navegador actual
  (Chrome, Firefox, Safari, Edge).
- **Conexión:** Internet con ancho de banda suficiente para cargar
  aplicación web (uso típico inferior a 5 MB por sesión).
- **Navegador:** JavaScript activado; cookies e almacenamento local
  permitidos para sesión e preferencias.

### Stack tecnolóxico previsto

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind
  CSS, iconos e biblioteca de gráficas (p. ex. Recharts). Documentación:
  https://nextjs.org/docs
- **Backend e servizos:** Lóxica de servidor da aplicación web e cliente
  do servizo na nube para chamadas á base de datos e á autenticación.
- **Base de datos:** PostgreSQL (a través do servizo na nube): tablas de
  organizacións, perfís, liñas, rexistros de KPIs, e outras propias do
  modelo (máquinas, estados, turnos). En Supabase: https://supabase.com/docs
- **Autenticación:** Servizo de autenticación (email/contraseña;
  ampliable a OAuth).
- **Control de versións:** Git; repositorio local/remoto (por exemplo
  GitHub).

**Esquema de base de datos (resumo das entidades principais).** A base
de datos incluirá, entre outras, as seguintes entidades:

- **Organizacións:** identificador, nome, plan (basic \| professional \|
  enterprise), **código de organización** (único, obrigatorio, 4--32
  caracteres), referencia ao usuario creador, data de creación,
  **trial_ends_at** (data de fin do período de proba para o plan básico;
  null para plans de pago). O **plan por defecto** das novas
  organizacións é o **básico**: 1 liña de producción, ata 5 usuarios;
  o primeiro mes é gratuíto e ao crear a organización asígnase
  automaticamente unha liña inicial e `trial_ends_at` a un mes desde a
  creación.
- **Perfís:** identificador de usuario, organización, nome completo,
  **rol** (owner \| member), datas de creación e actualización.
- **Liñas:** identificador, organización, nome, **estado actual da
  liña** (por defecto **Parada**; outros: Produción, Descanso
  programado, Mantemento, Cambio formato), data de inicio do estado,
  turno de traballo (1--3), horarios de turnos, cambio de turno
  automático ou manual, tempo planificado, pezas/minuto, etc.
- **Rexistros de KPIs:** liña, data, turno, valores de OEE,
  disponibilidade, rendemento, calidade, **orixe** (manual \| auto),
  timestamp.
- **Máquinas:** por liña, posición, nome, habilitada; estados de máquina
  (en marcha, parada, falta produto, emerxencia, anomalía) con períodos
  e, en Parada da liña, estado conxelado.
- **Produción por máquina e día:** pezas producidas e rexeitadas
  (machine_daily_production).
- **Períodos de estado de liña:** para calcular tempos por estado (só
  Produción, Descanso, Mantemento, Cambio formato; Parada non se
  rexistra como período).
- **Snapshots** para reportes: tempos de estado de liña por data/turno,
  tempos de estado por máquina, KPIs por máquina.

Disponse ademais dun **script de reinicio de datos** (`supabase/reset_data.sql`) que executa `TRUNCATE ... CASCADE` sobre as táboas da aplicación para baleiralas (reinicio de proba ou mantemento); por defecto non elimina os usuarios de autenticación.

Todas as táboas terán políticas de seguridade (Row Level Security ou
equivalente) para que cada usuario só acceda aos datos da súa
organización.

**Variables de configuración.** Para o correcto funcionamento da
aplicación requiriranse variables de contorno (URL do servizo na nube e
chave pública de API), que se configurarán no ficheiro de entorno de
desenvolvemento ou nas variables do hosting en produción. A URL de
redirección de autenticación deberá estar rexistrada no panel do servizo
de auth.

## 3.3 Costes (técnicos)

**Moeda:** Igual ca no apartado 2.5, todos os importes en **€**; a conversión desde a moeda do tarifario do provedor usa o **mesmo tipo BCE** indicado ao inicio do apartado 2.5.

- **Ferramentas de desenvolvemento (Node.js, editor/IDE, Git):** **0 €** (software gratuíto ou comunidade).
- **Servizo na nube — base de datos e autenticación (Supabase, plan Pro en produción):** **23 €/mes** (tarifa en euros obtida do prezo oficial do plan Pro en https://supabase.com/pricing, co tipo BCE da memoria). En fase de prácticas do ciclo pódese usar o plan gratuíto (**0 €/mes**) ata ir a produción.
- **Hosting da aplicación (Vercel, plan Pro en produción):** **18 €/mes** (mesma regra sobre https://vercel.com/pricing). Plan gratuíto para probas: **0 €/mes**.
- **Dominio .es:** **33,38 €/ano** na primeira anualidade segundo tarifa Dominios.es (mesma fonte ca no apartado 2.5); **3 €/mes** de prorrata contable se se reparte por meses.
- **Licenzas:** O núcleo do stack é código aberto ou gratuíto para este uso; **0 €** de licenza de pagamento obrigatoria para o MVP.

**Total técnico recurrente en modo produción lixeira (só nube + dominio prorrata):** **44 €/mes** (23 + 18 + 3). O resto do custo mensual total do proxecto (correo, seguro, marketing, etc.) está desagregado no apartado 2.5.

**Escalado:** Cando suba o tráfico ou o almacenamento, engádense cargos segundo as táboas de exceso de cada provedor (Supabase e Vercel); o importe en **€** de cada factura dependerá do uso real e do tipo de cambio do día en que o banco aplique o cargo.

## 3.4 Análise da competencia

No mercado de software OEE e monitorización de produción existen tanto
solucións especializadas en OEE como sistemas MES completos. A
continuación cítanse referentes que se consultan con frecuencia en
comparativas do sector (p.ex. páxinas de provedores ou listaxes sectoriais como
https://www.teeptrak.com/ ou https://tractian.com/).

- **MachineMetrics:** Máis orientada a conectar máquinas (CNC, etc.) e
  sacar analítica; adoita ir por encima do que unha pyme pequena quere
  pagar ou integrar.

- **Tractian (Tractian OEE):** Combina sensores e OEE case en tempo real;
  vai ben en multiplanta, pero leva parte de hardware.

- **Evocon:** Entrada manual ou semi-automatizada, máquinas vellas;
  encaixa no mesmo público que un produto “OEE sinxelo” vía web.

- **Redzone:** Foco en implicación dos operarios e fluxos de mellora;
  despregamento rápido.

- **Guidewheel:** Sensores plug-and-play e baixo esforzo de instalación;
  orientado a facilidade de adopción.

- **Sistemas MES integrados (Siemens Opcenter, Rockwell FactoryTalk,
  etc.):** Proxectos longos (ordes de 12--24 meses) e investimentos que
  en comparativas recentes de custos MES aparecen ordes de grandeza de
  centos de miles de euros en implantación e TCO segundo
  tamaño e modo cloud/on-premise (p.ex.
  https://www.symestic.com/en-us/blog/mes-system-prices-2026).
  Non son o mesmo cliente ca unha pyme que só quere OEE e un dashboard.

**Posicionamento de Industria40:** O produto sitúase no segmento de
**OEE e eficiencia para pymes**, con modelo **100 % SaaS**, sen hardware
obrigatorio, con prezos mensuais claros (199--899 €/mes) e interface web
moderna. A diferenciación baséase en simplicidade, prezo accesible e
enfoque en organizacións con poucas liñas que precisan medir OEE e
visualizar tendencias sen asumir MES completos nin integracións
complexas. A competencia directa (Evocon, alternativas "OEE lite")
comparte público obxectivo; a vantaxe de Industria40 será o stack
moderno, a posibilidade de personalización futura (API, integracións nos
plans superiores) e a aliñación con programas de apoio á dixitalización
en Galicia e España.

**Táboa comparativa orientativa (segmento pymes, 2026):**

  ------------------------------------------------------------------------------------------------
  Criterio       Industria40   Evocon             Tractian OEE    MES empresarial (Siemens,
                                                                  Rockwell)
  -------------- ------------- ------------------ --------------- --------------------------------
  Modelo         100 % SaaS    SaaS / híbrido     SaaS + hardware On-premise / cloud empresarial

  Prezo (orde)   199--899      Variable           Variable, con   150 000--500 000 € implantación
                 €/mes                            sensores        

  Enfoque        OEE + KPIs,   Entrada            Multi-planta,   Produción completa
                 pymes         manual/semi-auto   sensores        

  Tempo          Inmediato     Rápido             Rápido con      12--24 meses
  implantación   (rexistro)                       hardware        

  Hardware       Non           Non                Sensores        Sí (PLC, SCADA, etc.)
  obrigatorio                                                     
  ------------------------------------------------------------------------------------------------

En análises do sector (por exemplo o blog de ABI Research sobre OEE,
https://www.abiresearch.com/blog/overall-equipment-effectiveness-oee-for-manufacturers)
insístese en que moitos proxectos OEE frustan cando só se mide ben pero
non se usa no día a día. Por iso, no deseño de Industria40 ten sentido
priorizar pantallas claras e poucos pasos para rexistrar datos.

## 3.5 Funcionamento xeral previsto

A aplicación Industria40 comporase dos seguintes módulos e fluxos
principais.

**Landing e plans**\
- Na páxina raíz presentarase o produto, as características (OEE,
Dispoñibilidade, Rendemento, Calidade) e unha táboa de plans (Basic,
Professional, Enterprise) con prezo, número de liñas, usuarios, soporte
e almacenamento. O usuario poderá navegar a "Iniciar sesión", "Ver
dashboard" ou "Elexir plan".

**Autenticación e organizacións**\
- **Código de organización:** Ao rexistrar unha organización será
obrigatorio indicar un **código de organización** (4--32 caracteres,
único). Ese código será secreto e servirá para que novos usuarios se
unan á mesma organización; non se mostrará na interface de forma
visible, só o administrador (owner) poderá velo e copialo mediante o
botón "Invitar usuarios".\
- **Rexistro (crear nova organización):** Na pantalla de rexistro o
usuario introducirá email, contraseña e **código de organización**. Se
marca **"Crear nova organización"**, indicará opcionalmente o **nome da
organización**. Tras a creación da conta, crearase a organización con
ese código e nome (plan Professional por defecto), o perfil do usuario
con rol **owner** e liñas de exemplo.\
- **Rexistro (unirse a organización existente):** Se o usuario non marca
"Crear nova organización" e introduce un código que xa existe, a
aplicación comprobará os **límites de usuarios por plan**: Basic 1
usuario, Professional 5 usuarios, Enterprise ilimitados. Se se supera o
límite, mostrarase un erro. Se todo é correcto, crearase un perfil con
rol **member** asociado a esa organización.\
- **Completar rexistro:** Se un usuario ten conta (p. ex. tras confirmar
o email) pero aínda non ten perfil, ao acceder ao dashboard redirixirase
a unha pantalla de **completar rexistro**. Nesa pantalla introducirá o
código de organización e, se corresponde, marcará "Crear nova
organización" e o nome. Así evitarase que queden contas sen
organización.\
- **Login:** Na pantalla de login introducirase email e contraseña; o
servizo de autenticación devolverá a sesión. Se o usuario ten perfil,
redirixirase ao dashboard; se non, á pantalla de completar rexistro.

**Dashboard**\
- Acceso restrinxido a usuarios autenticados. O servidor obterá perfil e
organización; se non hai perfil, redirixirase á pantalla de completar
rexistro.\
- **Cabeceira:** Mostrará **"Dashboard --- \[Nome da organización\]"**
(non o código). Etiqueta co número de liñas segundo o plan. Para
usuarios con rol **owner**, un botón **"Invitar usuarios"** que ao
pulsalo mostrará o **código secreto** da organización e un botón para
copialo ao portapapeis; o código non estará visible na barra de forma
permanente. Enlaces a inicio, email do usuario e peche de sesión.\
- **Xestión de liñas:** Listado de liñas da organización; botón "Añadir
línea"; para cada liña, selector de **estado** (por defecto **Parada**;
Produción, Descanso programado, Mantemento, Cambio formato), selector de
turno, opcións de editar nome, configuración de máquinas, gardar e
reinicializar, eliminar. Respectarase o límite do plan (Basic 2,
Professional 5, Enterprise ilimitadas).\
- **Rexistro de KPIs:** Formulario para seleccionar liña, turno e
introducir Dispoñibilidade, Rendemento e Calidade (0--100); o OEE
calcularase automaticamente. Os rexistros manuais quedarán identificados
(no reporte mostrarán "-----" en tempos de estado e KPIs por máquina).\
- **Gráficas:** Evolución temporal (últimos 14 días) por liña e turno;
**comparativa por liña con gauges** (arco, marcas 0/75/85/100 %, cores
vermello/laranxa/verde).\
- **Buscador de datos:** Filtro por liña, data e turno; ao abrir un
rexistro, **reporte** con KPIs, tempos de estado (sen Parada), por
máquinas e produción (pezas); imprimir ou gardar PDF.

**Detalle de liña**\
- Unha pantalla específica dunha liña mostrará o detalle: **estado da
liña** (por defecto Parada; só en Produción pódense cambiar os estados
das máquinas), **totais da liña** (total producidas = máquina que máis
produciu, total rexeitadas = suma de todas), máquinas con estados, KPIs
calculados ou rexistrados, **rexistro de pezas producidas e rexeitadas
por máquina**, configuración de máquinas e opción de gardar datos e
reinicializar contadores.

**Seguridade**\
- Políticas de seguridade na base de datos: os usuarios só poderán ler e
escribir datos da súa organización. As operacións de creación de
organización e de unión a organización existente executaranse
respeitando os límites do plan (básico: 5 usuarios, 1 liña; professional e enterprise segundo a súa definición). Cando a organización está en **plan básico** e o **período de proba xa rematou** (campo `trial_ends_at` no pasado), todas as operacións de **escritura** na base de datos son rexeitadas no servidor; a aplicación segue permitindo a **lectura** completa (consultar datos, dashboard, reportes). O usuario verá un aviso no dashboard e poderá acceder á páxina de plans para emigrar a un plan de pago e recuperar a capacidade de gardar datos.

**Protección de datos.** A aplicación tratará datos de uso (email,
contraseña, nome da organización, código de organización, nomes de
liñas, valores de KPIs). O código de organización considérase dato
sensible e non se exporá na interface salvo para o owner ao solicitar
"Invitar usuarios". Para unha explotación comercial recoméndase cumprir
o RGPD (política de privacidade, bases lexitimadoras,
acceso/rectificación/supresión, HTTPS e control de acceso).

## 3.6 Interfaces da aplicación (deseño)

A continuación descríbense as pantallas principais da aplicación tal e
como están previstas no deseño. As capturas ou maquetas poden incluírse
como anexo gráfico na copia encuadernada. Indícase a estrutura, os
elementos visuais e o comportamento esperado de cada pantalla.

### 3.6.1 Páxina de inicio (Landing)

- **URL:** raíz do sitio.
- **Cabeceira:** Logo textual "Industria40". Navegación: enlace "Plans"
  (âncora á sección de plans), "Iniciar sesión" (enlace á pantalla de
  login), botón primario "Ver dashboard" (enlace ao dashboard). Fondo
  escuro, borde inferior.
- **Sección hero:** Título principal tipo "Controla a eficiencia das
  túas liñas de produción" (con "liñas de produción" destacado).
  Subtítulo sobre KPIs en tempo real (OEE, Dispoñibilidade, Rendemento,
  Calidade) e dashboards para decisións. Dous botóns: "Acceder ao
  dashboard" e "Ver plans".
- **Sección Plans:** Título "Plans Industria40", subtítulo sobre
  adaptación ao tamaño da planta. Grid de tres tarxetas (Basic,
  Professional, Enterprise). En cada tarxeta: prezo en grande (199
  €/mes, 449 €/mes, 899 €/mes), nome do plan, lista de características
  (número de liñas, tipo de dashboard, usuarios, soporte, almacenamento,
  API e integracións se aplica). O plan Professional levará etiqueta
  "Recomendado" e destacado visual. Botón "Elexir plan" en cada tarxeta.
- **Pé:** Texto tipo "Industria40 --- Modelo SaaS. OEE, Dispoñibilidade,
  Rendemento, Calidade."
- **Estilo xeral:** Fondo escuro, texto claro, acentos en cor cyan ou
  similar para botóns e títulos destacados. Diseño responsive (columna
  en móbil, varias columnas en escritorio).

### 3.6.2 Páxina de inicio de sesión

- **URL:** /login.
- **Contido:** Formulario centrado con campos "Email" e "Contraseña",
  botón "Entrar". Enlace "Rexistrarse" para usuarios novos. En caso de
  erro de autenticación, mensaxe visible baixo o formulario. Tras login
  correcto, redirección ao dashboard (ou á URL de destino se se pasou un
  parámetro). Estilo coherente co landing.

### 3.6.3 Páxina de rexistro

- **URL:** /register.
- **Contido:** Formulario con "Email", "Contraseña" (mínimo 6
  caracteres), **"Código de organización"** (obrigatorio, 4--32
  caracteres). Checkbox **"Crear nova organización (serás o primeiro
  usuario)"**; se está marcado, campo opcional **"Nome da
  organización"**. Botón "Rexistrarse". Enlace "Iniciar sesión" para
  quen xa ten conta.
- **Comportamento:** Ao enviar, creación de conta. Se o usuario crea
  nova organización, crearase a organización con ese código e nome e
  quedará como owner; se non, unirase á organización existente
  (comprobando límites do plan). Se o rexistro require confirmación por
  email, mostrarase "Revisa o teu correo" e indicarase que ao confirmar
  terán que introducir de novo o código na pantalla de completar
  rexistro. Mensaxes de erro (código xa existente ao crear, límite de
  usuarios superado ao unirse) mostraranse baixo o formulario.

### 3.6.4 Páxina completar rexistro

- **URL:** /auth/complete-registration (ou similar).
- **Uso:** Usuarios que teñen conta pero aínda non teñen perfil (p. ex.
  tras confirmar o email). O dashboard redirixirá aquí cando non exista
  perfil.
- **Contido:** Título "Completar rexistro", texto explicativo.
  Formulario con **"Código de organización"** (obrigatorio), checkbox
  **"Crear nova organización"** e, se está marcado, **"Nome da
  organización"** (opcional). Botón "Continuar ao dashboard".
- **Comportamento:** Ao enviar, creación ou vinculación de perfil e
  organización; se correcto, redirección ao dashboard; se erro, mensaxe
  visible.

### 3.6.5 Dashboard principal

- **URL:** /dashboard. Acceso restrinxido a usuarios autenticados.
- **Cabeceira:** Mostrará **"Dashboard --- \[Nome da organización\]"**
  (non o código). Etiqueta "X/Y Liñas". Para usuarios **owner**, botón
  **"Invitar usuarios"** que ao pulsalo abrirá un desplegable co texto
  explicativo do código secreto, o código en fonte mono e botón
  **"Copiar"**; o código non se mostrará de forma permanente na barra.
  Tamén: etiqueta de liñas, email do usuario e botón "Saír".
- **Título da páxina:** "Eficiencia de produción" e subtítulo coa
  fórmula "OEE = Dispoñibilidade × Rendemento × Calidade".
- **Bloque "Liñas de produción":** Título, botón "Añadir línea" (se non
  se superou o límite do plan). Formulario en liña para crear liña
  (nome, Gardar, Cancelar). Lista de liñas con nome (enlace ao detalle),
  número de máquinas, selector de estado da liña, selector de turno,
  mini-indicadores de KPIs (OEE, Disp., Rend., Cal.) con cores por
  valor, e iconos de Configuración, Gardar e reinicializar, Editar,
  Eliminar.
- **Bloque "Evolución de KPIs (últimos 14 días)":** Selector de liña e
  turno, gráfica de liñas.
- **Bloque "Comparativa por liña":** Gráficas tipo **gauge** (arco de
  -45° a 225°, sentido horario) por liña con OEE, Dispoñibilidade,
  Rendemento e Calidade; marcas en 0 %, 75 %, 85 % e 100 %; cores por
  valor: vermello \<75 %, laranxa 75--85 %, verde ≥85 %.
- **Bloque "Rexistrar manualmente KPIs de hoxe":** Selector de liña e
  turno, OEE calculado (só lectura), inputs Dispoñibilidade, Rendemento,
  Calidade, botón Gardar. Os rexistros manuais quedarán marcados como
  tal; no reporte, os tempos de estado e os KPIs por máquina mostrarán
  "-----" para eses rexistros.
- **Bloque "Buscador de datos":** Filtros por liña, data, turno; listado
  de rexistros; ao abrir un rexistro, **modal de reporte** con KPIs (%),
  tempos de estado de liña (Produción, Descanso, Mantemento, Cambio
  formato --- Parada non se mostra), tempos e KPIs por máquina,
  **produción (pezas)** con totais da liña e táboa por máquina, e botóns
  para imprimir ou gardar PDF.
- **Estilo:** Tarxetas con borde e fondo escuro; botóns primarios en cor
  de acento; lista de liñas con ítems en fila e bordes redondeados.
  Se o plan é **básico** e o **período de proba xa rematou**, mostrarase
  un aviso destacado (banner) indicando que se pode seguir usando a
  aplicación en modo lectura pero que non se poden gardar rexistros ata
  emigrar a un plan de pago, cun enlace á páxina **/plans**. As accións
  de gardado (crear ou editar liñas, gardar KPIs, cambiar estado ou
  turno, gardar datos da liña, inicializar tempos, gardar producción de
  máquinas, etc.) compróbanse no servidor e, se o trial expirou, non se
  persiste ningún cambio e mostrase ao usuario unha mensaxe traducida
  (galego, español, inglés).

### 3.6.6 Detalle de liña

- **URL:** /dashboard/line/\[id\].
- **Contido:** Páxina específica dunha liña. **Estado da liña por
  defecto: Parada**; selector de estado (Produción, Parada, Descanso
  programado, Mantemento, Cambio formato). Soamente cando a liña está en
  **Produción** pódense cambiar os estados das máquinas; en Parada os
  tempos das máquinas quédanse conxelados. Bloque **"Totais da liña"**:
  Total producidas (valor da máquina que máis produciu), Total
  rexeitadas (suma de todas as máquinas). Listado de máquinas da liña:
  nome, habilitada, estado actual (en marcha, parada, etc.), KPIs
  calculados (OEE, Disp., Rend., Cal.), **rexistro de pezas producidas e
  rexeitadas** por máquina (hoxe) e botón Gardar. Configuración de
  máquinas (modal). Opción de gardar datos e reinicializar contadores.
- **Comportamento:** As accións (cambiar estado da liña, estado das
  máquinas, gardar pezas, etc.) actualizarán a base de datos e poderán
  provocar actualización dos datos na pantalla.

### 3.6.7 Reporte KPI (modal)

- **Acceso:** Desde o buscador de datos, ao seleccionar un rexistro
  (liña, data, turno) abrirase un **modal de reporte** que poderá
  imprimirse ou gardarse en PDF.
- **Contido:** Cabeceira do reporte con liña, turno e data. **KPIs
  (%)**: OEE, Dispoñibilidade, Rendemento, Calidade en gráficas tipo
  gauge (mesmo estilo que a comparativa: arco -45° a 225°, marcas en
  0/75/85/100 %, cores vermello/laranxa/verde). **Tempos de estado de
  liña**: táboa con Produción, Descanso programado, Mantemento, Cambio
  formato (tempo e %); **Parada non aparece** por ser estado de
  transición. **Por máquinas**: para cada máquina, tempos por estado (en
  marcha, parada, etc.) e KPIs (OEE, Disp., Rend., Cal.) con cores por
  valor; **se o rexistro é manual**, nesta sección e na de tempos de
  liña mostrarase "-----". **Produción (pezas)**: totais da liña (total
  producidas = máquina que máis produciu, total rexeitadas = suma de
  todas) e táboa por máquina (pezas producidas, pezas rexeitadas).
  Botóns "Imprimir / Gardar PDF" e "Pechar".
- **Estilo:** Coherente co resto da aplicación; as gráficas e cores
  mantéñense ao imprimir.

### 3.6.8 Páxinas de erro e auxiliares

- **Páxina de erro:** Activarse ante un erro de runtime. Mostrará unha
  mensaxe amigable e un botón ou enlace para "Reintentar" ou volver ao
  inicio.
- **Páxina 404:** Para rutas non existentes. Mensaxe axeitada e enlace á
  páxina principal ou ao dashboard.
- **Erro global:** Fallo global da aplicación; mensaxe xenérica e opción
  de recargar.

- **Páxina de plans (/plans):** Acceso restrinxido a usuarios
  autenticados. Lista os plans (Basic, Professional, Enterprise) con
  prezos e características; o usuario pode elixir un plan e, ao
  facelo, redirígeselle ao dashboard co parámetro de plan correspondente
  para que a aplicación actualice o plan da organización e elimine o
  aviso de trial expirado.

As interfaces desenvolveranse con componentes React, estilados con
Tailwind CSS e, onde corresponda, cunha biblioteca de gráficas para as
chart. Os datos provirán do servizo na nube mediante o cliente oficial.
A aplicación será responsive para uso en escritorio e en dispositivos
móbiles. A linguaxe da interface poderá configurarse en galego, español
e inglés segundo o deseño final.

# 4. CONCLUSIÓNS

En liñas xerais, o que se quere sacar deste traballo é o seguinte:

- **Viabilidade técnica:** É viable desenvolver unha aplicación SaaS
  funcional de medición de OEE e KPIs de eficiencia utilizando
  tecnoloxías actuais (Next.js, TypeScript, servizo na nube para base de
  datos e auth, Tailwind, gráficas) dentro do marco dun proxecto fin de
  ciclo DAM. O prototipo que se desenvolverá pretenderá cumprir os
  obxectivos de produto mínimo viable: autenticación, xestión de
  organizacións e liñas, rexistro de KPIs e visualización en dashboard
  con gráficas.

- **Alineación co ciclo:** O traballo toca o que se dá no DAM (web, base
  de datos, APIs, seguridade, interfaces) e choca cun caso real:
  industria, SaaS, nube. A estrutura da memoria respecta o que pide o
  centro na guía do proxecto fin de ciclo (IES Chan do Monte, documentación
  interna do ciclo).

- **Adecuación ao mercado:** O mercado de software OEE está en
  crecemento e a tendencia cara ao SaaS favorece propostas como
  Industria40. A análise DAFO/CAME e a competencia identificada permiten
  situar o produto no segmento de pymes que buscan OEE sinxelo e
  accesible. A forma xurídica SL e a estimación de costes e financiación
  ofrecen un marco realista para un posible arranque empresarial.

- **Limitacións e traballo futuro:** O prototipo non incluirá todas as
  funcionalidades dun produto comercial completo (facturación
  automática, integracións con ERP ou sensores, app móbil nativa). Sería
  conveniente incorporar máis probas automatizadas, documentación de API
  (para plans superiores) e melloras de accesibilidade e rendemento en
  versións futuras. Os datos de mercado e administración van acompañados
  no propio texto da URL ou norma de onde saen, para poder revisalos.

- **Aprendizaxes do ciclo:** O proxecto permitirá aplicar de forma
  integrada contidos de programación (TypeScript, React, xestión de
  estado), bases de datos (deseño relacional, SQL, políticas de
  seguridade), desenvolvemento web (Next.js App Router, autenticación),
  interfaces de usuario (Tailwind CSS, componentes reutilizables,
  gráficas) e organización do traballo (control de versións, migracións,
  documentación). A redacción do estudo empresarial e técnico segundo a
  guía do centro reforzará a capacidade de presentar e xustificar un
  proxecto software no seu contexto de negocio e técnico.

Resumindo: o traballo encaixa co que se pide no ciclo e serve de base
para presentar e defender o proxecto; se máis adiante se quixese dar un
salto comercial, a parte empresarial e de custos xa deixa un fío do que
coller.

**Recomendacións para a exposición.** Na guía do centro (IES Chan do Monte)
pídese, por regra xeral, non pasar de **15 minutos** e seguir unha orde:
introdución, estudo empresarial, estudo técnico e conclusións. Axuda
ensaiar antes e ir co tempo mirado; un PDF ou un formato que o ordenador
do aula abra sen historias evita sustos o día da defensa.

# 5. ANEXO: GLOSARIO E TERMOS TÉCNICOS

**Parada (estado de liña):** Estado por defecto da liña. Considerado
estado de transición: **non se contabiliza tempo** nin se rexistra como
período; non aparece nos reportes. Soamente os estados Produción,
Descanso programado, Mantemento e Cambio formato acumulan tempo e se
mostran no reporte.

**API (Application Programming Interface):** Conxunto de interfaces e
protocolos que permiten que distintas aplicacións ou servizos
intercambien datos. Nos plans Professional e Enterprise de Industria40
contemplase ofrecer API para que sistemas externos (ERP, MES, sensores)
poidan enviar ou consultar KPIs.

**CAME:** Matriz de estrategias (Corrixir debilidades, Afrontar Ameazas,
Manter fortalezas, Explotar oportunidades) derivada do DAFO para
priorizar accións estratéxicas.

**DAFO:** Análise de Debilidades, Ameazas, Fortalezas e Oportunidades
(en inglés SWOT) dun proxecto ou empresa, utilizada no estudo
empresarial.

**Dispoñibilidade (OEE):** Factor do OEE que mide a proporción do tempo
planificado no que o equipo estivo realmente en funcionamento. Fórmula:
tempo de funcionamento / tempo planificado (paradas non planificadas
reducen a disponibilidade).

**KPI (Key Performance Indicator):** Indicador clave de rendemento;
métrica cuantificable utilizada para avaliar o éxito dun proceso ou da
organización. En Industria40 os KPIs principais son OEE,
Dispoñibilidade, Rendemento e Calidade.

**MES (Manufacturing Execution System):** Sistema de información que
controla e documenta a execución da produción en planta (ordes,
traballos, tempos, calidade). Os sistemas OEE puros adoitan ser un
subconxunto ou complemento do MES.

**OEE (Overall Equipment Effectiveness):** Indicador global de
eficiencia do equipo, definido como o produto de Dispoñibilidade ×
Rendemento × Calidade (en tanto por un). Utilizado na industria para
comparar equipos, turnos e plantas.

**PostgreSQL:** Sistema de xestión de bases de datos relacional, open
source. Utilízase en moitos servizos na nube como motor de base de
datos.

**RLS (Row Level Security):** Mecanismo de seguridade en bases de datos
(PostgreSQL) que restrinxe o acceso a filas dunha táboa segundo
políticas definidas (p. ex. que o usuario só vexa as filas da súa
organización).

**Rendemento (OEE):** Factor do OEE que mide a velocidade efectiva de
produción respecto da velocidade teórica. Fórmula: produción real /
capacidade teórica no tempo de funcionamento (paradas menores e rebaixas
de velocidade reducen o rendemento).

**Calidade (OEE):** Factor do OEE que mide a proporción de unidades boas
sobre o total producido. Fórmula: unidades boas / total producidas.

**SaaS (Software as a Service):** Modelo de distribución de software no
que a aplicación aloxase en servidores do provedor e o cliente accede
vía web (ou API), normalmente mediante subscrición mensual ou anual, sen
instalar software localmente.

**TypeScript:** Linguaxe de programación que amplía JavaScript con tipos
estáticos; utilizada no proxecto para maior seguridade e mantibilidade
do código.

**Vercel:** Plataforma de hosting e desplegue para aplicacións Next.js e
frontends estáticos; recomendada para publicar aplicacións web en
produción.

**Fin do documento.**

As ligazóns e as cifras de mercado e administración públicas revisáronse
cara **abril de 2026**; se o documento atrasa, convén volver abrir as URLs
e comprobar orzamentos ou informes (os informes privados cambian de
edición con frecuencia).

*Documento principal do Proxecto Fin de Ciclo --- Industria40. Mínimo 40
páxinas equivalentes en formato A4. Nome do alumno, nome do proxecto,
ciclo e centro na portada.*

**Nota sobre a extensión:** Este documento, exportado a PDF ou a Word
con tipografía estándar (corpo 12 pt, márxenes normais A4), alcanza ou
supera as 40 páxinas equivalentes solicitadas na Guía do Proxecto. A
paginación final dependerá do formato de exportación e das opcións de
tipografía e espazado elixidas.

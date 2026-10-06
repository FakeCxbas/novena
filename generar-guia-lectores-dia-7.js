const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guía de Lectores y Roles — Novena Mami Olguita (Día 7)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter portrait;
      margin: 10mm 12mm 10mm 12mm;
      @bottom-right {
        content: "Página " counter(page) " de 2";
        font-size: 8pt;
        color: #777;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
      @bottom-left {
        content: "Guía de Lectores y Asignación de Roles • Novena Mami Olguita • Día 7";
        font-size: 8pt;
        color: #777;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #1a1a1a;
      background: #fbf9f5;
      line-height: 1.34;
      font-size: 10pt;
      margin: 0;
      padding: 0;
    }

    .page-container {
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      padding: 18px 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }

    @media print {
      body {
        background: #fff;
      }
      .page-container {
        padding: 0;
        box-shadow: none;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }

    .header {
      text-align: center;
      border-bottom: 2px solid #8c6d37;
      padding-bottom: 5px;
      margin-bottom: 7px;
    }

    .cross {
      font-size: 19pt;
      color: #8c6d37;
      line-height: 1;
    }

    .title {
      font-size: 16.5pt;
      font-weight: 700;
      color: #5c4217;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 1px 0;
    }

    .subtitle {
      font-size: 10.5pt;
      font-style: italic;
      color: #73531f;
      margin-bottom: 3px;
    }

    .badge-bar {
      display: flex;
      justify-content: center;
      gap: 7px;
      margin-top: 3px;
      flex-wrap: wrap;
    }

    .badge-pill {
      background: #faf4e8;
      border: 1px solid #d4b886;
      border-radius: 4px;
      padding: 2px 7px;
      font-size: 8.2pt;
      font-weight: 700;
      color: #704f14;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .section-title {
      font-size: 11pt;
      font-weight: 700;
      color: #704f14;
      border-bottom: 1px solid #e2d1b3;
      padding-bottom: 2px;
      margin: 7px 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .rules-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 6px;
    }

    .rule-card {
      background: #fdfaf4;
      border-left: 3px solid #8c6d37;
      border-radius: 0 4px 4px 0;
      padding: 4px 7px;
      font-size: 8.6pt;
      line-height: 1.28;
    }

    .rule-card strong {
      color: #5c4217;
      display: block;
      margin-bottom: 1px;
      font-size: 8.8pt;
    }

    .roles-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 8.8pt;
    }

    .roles-table th {
      background: #5c4217;
      color: #fff;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 6px;
      border: 1px solid #5c4217;
      text-align: left;
      font-size: 8pt;
    }

    .roles-table td {
      border: 1px solid #d9ccb4;
      padding: 3.5px 6px;
      vertical-align: middle;
      line-height: 1.22;
    }

    .roles-table tr:nth-child(even) {
      background: #faf6ee;
    }

    .badge-lector {
      background: #8c6d37;
      color: #fff;
      font-weight: 700;
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 7.8pt;
      display: inline-block;
      white-space: nowrap;
    }

    .badge-page {
      background: #e9dec9;
      color: #4b3619;
      font-weight: 700;
      border-radius: 3px;
      padding: 1px 4px;
      font-size: 7.5pt;
      display: inline-block;
      white-space: nowrap;
    }

    .name-line {
      display: inline-block;
      width: 98%;
      border-bottom: 1px dotted #8c6d37;
      height: 13px;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .lector-detail-box {
      background: #fdfaf4;
      border: 1px solid #e2d1b3;
      border-left: 3.5px solid #8c6d37;
      border-radius: 4px;
      padding: 5px 8px;
      margin-bottom: 5px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .lector-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }

    .lector-num {
      font-size: 9.6pt;
      font-weight: 700;
      color: #704f14;
    }

    .lector-desc {
      font-size: 8.8pt;
      line-height: 1.28;
      color: #2b2b2b;
    }

    .phrase-guide {
      background: #fff;
      border: 1px dashed #cbb692;
      border-radius: 3px;
      padding: 2px 6px;
      margin-top: 2px;
      font-style: italic;
      color: #5c4217;
      font-size: 8.2pt;
    }

    .tips-box {
      background: #f0f4f9;
      border-left: 3px solid #133b68;
      border-radius: 0 4px 4px 0;
      padding: 5px 8px;
      margin-top: 5px;
      font-size: 8.3pt;
      line-height: 1.25;
      color: #1e293b;
    }

    .action-bar-screen {
      background: #2b1f14;
      color: #fff;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .btn-print {
      background: #dfb15b;
      color: #1a1411;
      font-weight: 700;
      font-family: system-ui, sans-serif;
      font-size: 0.9rem;
      border: none;
      padding: 7px 15px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }

    .btn-print:hover {
      background: #f0c36d;
    }
  </style>
</head>
<body>

  <!-- Barra en pantalla (oculta al imprimir) -->
  <div class="action-bar-screen no-print">
    <div style="font-family: system-ui, sans-serif; font-size: 0.92rem; font-weight: 600;">
      <span>Guía de Lectores • Novena Mami Olguita (Día 7)</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <a href="/Novena_Mami_Olguita_Dia_7.pdf" target="_blank" class="btn-print" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3);">
        📖 Ver Folleto Día 7 (PDF)
      </a>
      <button class="btn-print" onclick="window.print()">
        🖨️ Imprimir Guía (2 Páginas)
      </button>
      <a href="/Guia_Lectores_Novena_Dia_7.pdf" download class="btn-print" style="background: #22c55e; color: #fff;">
        ⬇️ Descargar PDF
      </a>
    </div>
  </div>

  <div class="page-container">

    <!-- ================= CARA A (PÁGINA 1): INTRODUCCIÓN, REGLAS DE ORO Y TABLA DE ASIGNACIÓN ================= -->
    <div class="header">
      <div class="cross">✝</div>
      <div class="title">Guía Oficial para Lectores y Oradores</div>
      <div class="subtitle">Novena por el Eterno Descanso de Nuestra Querida Mami Olguita</div>
      <div class="badge-bar">
        <span class="badge-pill">DÍA 7 • LA FAMILIA PERMANECE UNIDA EN EL AMOR</span>
        <span class="badge-pill">Misterios Dolorosos (Martes, 6 de Octubre)</span>
        <span class="badge-pill">Folleto Principal: 6 Páginas</span>
      </div>
    </div>

    <div class="section-title">✨ Las 6 Reglas de Oro para Guiar con Amor y Devoción</div>
    <div class="rules-grid">
      <div class="rule-card">
        <strong>1. Ritmo pausado y voz serena</strong>
        No te apresures. Lee con claridad, buena dicción y tono cálido. La oración pausada permite a la familia conectar y recordar con amor a Mami Olguita.
      </div>
      <div class="rule-card">
        <strong>2. Manejo de Micrófono (Sala Virtual / Presencial)</strong>
        Enciende tu micrófono solo cuando sea tu turno. Al terminar, siléncialo para permitir que los demás respondan sin ecos ni interferencias.
      </div>
      <div class="rule-card">
        <strong>3. Distinción entre [GUÍA] y [TODOS]</strong>
        El lector lee con voz firme lo marcado como <em>Guía</em>. Haz una breve pausa natural para que toda la familia responda al unísono en <em>Todos</em>.
      </div>
      <div class="rule-card">
        <strong>4. Cómo guiar una Decena del Rosario</strong>
        Inicia el Padre Nuestro y las 10 Ave Marías hasta la mitad (hasta <em>"en el cielo"</em> / <em>"Jesús"</em>). Toda la familia responderá la segunda mitad.
      </div>
      <div class="rule-card">
        <strong>5. Las Jaculatorias por Mami Olguita</strong>
        Al final de cada misterio, enuncia las 2 jaculatorias: <em>"Si por tu sangre..."</em> y <em>"Dale, Señor, el descanso eterno"</em>, esperando la respuesta comunitaria.
      </div>
      <div class="rule-card">
        <strong>6. Pase fraterno al siguiente lector</strong>
        Al finalizar tu bloque, da el pase con amabilidad: <em>"Cedemos la palabra a [Nombre del familiar] para el siguiente misterio"</em>.
      </div>
    </div>

    <div class="section-title">📋 Matriz de Asignación de Roles para Hoy (Día 7)</div>
    <p style="font-size: 8.5pt; color: #555; margin: 0 0 3px 0; font-style: italic;">
      Escribe el nombre del familiar responsable en cada casilla. Si asisten menos lectores, una misma persona puede asumir dos o más bloques consecutivos.
    </p>

    <table class="roles-table">
      <thead>
        <tr>
          <th style="width: 14%;">Rol</th>
          <th style="width: 32%;">Momento Litúrgico</th>
          <th style="width: 16%;">Folleto PDF</th>
          <th style="width: 38%;">Familiar Asignado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge-lector">Lector 1</span></td>
          <td><strong>Apertura, Señal de la Cruz, Acto de Contrición y Oración Inicial</strong></td>
          <td><span class="badge-page">Página 1</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 2</span></td>
          <td><strong>Colosenses 3, 14-15, Reflexión Día 7, Oración Familiar y Mensaje</strong></td>
          <td><span class="badge-page">Página 2</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 3</span></td>
          <td><strong>Ofrecimiento del Santo Rosario y Credo de los Apóstoles</strong></td>
          <td><span class="badge-page">Página 2</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 4</span></td>
          <td><strong>1º Misterio Doloroso: La Agonía en el Huerto</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 3</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 5</span></td>
          <td><strong>2º Misterio Doloroso: La Flagelación de Jesús</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 3</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 6</span></td>
          <td><strong>3º Misterio Doloroso: La Coronación de Espinas</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 3</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 7</span></td>
          <td><strong>4º Misterio Doloroso: Jesús con la Cruz a Cuestas</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 4</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 8</span></td>
          <td><strong>5º Misterio Doloroso: La Crucifixión y Muerte</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 4</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 9</span></td>
          <td><strong>Cierre del Rosario, La Salve, 51 Letanías Lauretanas (01-51) y Cordero de Dios</strong></td>
          <td><span class="badge-page">Págs. 4 y 5</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 10</span></td>
          <td><strong>Oración por Mami Olguita, Oración de la Familia, Bendición y Cierre</strong></td>
          <td><span class="badge-page">Página 6</span></td>
          <td><span class="name-line"></span></td>
        </tr>
      </tbody>
    </table>

    <!-- ================= CARA B (PÁGINA 2): GUION DETALLADO PASO A PASO ================= -->
    <div class="page-break"></div>

    <div class="section-title">📖 Guion de Intervención Detallado para cada Lector</div>

    <!-- Lector 1 -->
    <div class="lector-detail-box">
      <div class="lector-detail-header">
        <span class="lector-num">Lector 1 • Apertura y Rito Inicial</span>
        <span class="badge-page">Página 1 del Folleto</span>
      </div>
      <div class="lector-desc">
        Inicia con voz solemne: <em>"En el nombre del Padre, del Hijo y del Espíritu Santo..."</em>. Continúa con el <strong>Acto de Contrición</strong> (<em>"Señor mío Jesucristo..."</em>) y la <strong>Oración Inicial de todos los días</strong> (<em>"Señor Dios, Padre misericordioso, nos reunimos como familia..."</em>).
        <div class="phrase-guide">Frase de pase: "Invitamos ahora a [Lector 2] para compartir la Palabra de Dios y la reflexión del día."</div>
      </div>
    </div>

    <!-- Lector 2 -->
    <div class="lector-detail-box">
      <div class="lector-detail-header">
        <span class="lector-num">Lector 2 • Palabra, Reflexión y Oración del Día 7</span>
        <span class="badge-page">Página 2 del Folleto</span>
      </div>
      <div class="lector-desc">
        Proclama <strong>Colosenses 3, 14-15</strong> (<em>"Y sobre todas estas cosas, revístanse del amor..."</em>), lee con cariño la <strong>Reflexión del Día 7</strong>, la <strong>Oración del Día 7</strong> pidiendo unión familiar y bendición para Mami Olguita, y el <strong>Mensaje para la Familia</strong> sobre permanecer unidos.
        <div class="phrase-guide">Frase de pase: "Damos la palabra a [Lector 3] para dar inicio al Santo Rosario."</div>
      </div>
    </div>

    <!-- Lector 3 -->
    <div class="lector-detail-box">
      <div class="lector-detail-header">
        <span class="lector-num">Lector 3 • Ofrecimiento del Rosario y Credo</span>
        <span class="badge-page">Página 2 del Folleto</span>
      </div>
      <div class="lector-desc">
        Lee el <strong>Ofrecimiento del Rosario</strong> (<em>"Ofrecemos este Santo Rosario por el eterno descanso de nuestra querida Mami Olguita..."</em>). Luego guía la primera frase del <strong>Credo</strong> (<em>"Creo en Dios, Padre todopoderoso..."</em>) y se une a toda la familia en la proclamación completa.
        <div class="phrase-guide">Frase de pase: "Iniciamos los Misterios Dolorosos con [Lector 4]."</div>
      </div>
    </div>

    <!-- Lectores 4 al 8: Misterios -->
    <div class="lector-detail-box">
      <div class="lector-detail-header">
        <span class="lector-num">Lectores 4 al 8 • Guías de los 5 Misterios Dolorosos</span>
        <span class="badge-page">Páginas 3 y 4 del Folleto</span>
      </div>
      <div class="lector-desc">
        Cada lector de misterio realiza los siguientes pasos en orden:
        <br><strong>1. Enunciar el Misterio:</strong> Título correspondiente (ej. <em>"Primer Misterio Doloroso: La Agonía de Jesús en el Huerto..."</em>).
        <br><strong>2. Lectura y Meditación:</strong> Cita bíblica y la meditación sentida uniendo el dolor y recuerdo de Mami Olguita a la entrega de Cristo.
        <br><strong>3. Padre Nuestro:</strong> Guía hasta <em>"hágase tu voluntad, en la tierra como en el cielo"</em>. Espera la respuesta familiar.
        <br><strong>4. 10 Ave Marías:</strong> Guía hasta <em>"y bendito es el fruto de tu vientre, Jesús"</em> (10 veces con cuenta pausada).
        <br><strong>5. Gloria y Jaculatorias:</strong> Guía el Gloria y las 2 jaculatorias (<em>"Si por tu sangre..."</em> y <em>"Dale, Señor, el descanso eterno"</em>).
      </div>
    </div>

    <!-- Lector 9 -->
    <div class="lector-detail-box">
      <div class="lector-detail-header">
        <span class="lector-num">Lector 9 • Cierre del Rosario, La Salve y 51 Letanías Lauretanas</span>
        <span class="badge-page">Páginas 4 y 5 del Folleto</span>
      </div>
      <div class="lector-desc">
        Reza las intenciones del Santo Padre (1 Padre Nuestro, 3 Ave Marías, 1 Gloria y <em>"Bajo tu amparo"</em>). Guía <strong>La Salve</strong>. En las <strong>51 Letanías Lauretanas</strong> (numeradas del 01 al 51), lee ordenadamente de arriba hacia abajo: primero la <strong>Columna 1</strong> (01 al 26) y luego la <strong>Columna 2</strong> (27 al 51) mientras la familia responde <em>"Ruega por ella"</em> (o <em>"Ruega por nosotros"</em>), concluyendo con el triple <strong>Cordero de Dios</strong>.
        <div class="phrase-guide">Frase de pase: "Invitamos a [Lector 10] para dirigir las oraciones finales de nuestra familia."</div>
      </div>
    </div>

    <!-- Lector 10 -->
    <div class="lector-detail-box">
      <div class="lector-detail-header">
        <span class="lector-num">Lector 10 • Oraciones Finales, Bendición y Despedida</span>
        <span class="badge-page">Página 6 del Folleto</span>
      </div>
      <div class="lector-desc">
        Lee la <strong>Oración final por Mami Olguita</strong> y la conmovedora <strong>Oración final de la familia</strong> (<em>"Señor, gracias por la vida de nuestra querida Mami Olguita..."</em>). Dirige el diálogo de difuntos (<em>"Dale, Señor, el descanso eterno..."</em>), imparte la <strong>Bendición final</strong> y lee la dedicatoria de la <strong>Tarjeta de Homenaje</strong>.
      </div>
    </div>

    <!-- Consejos de Coordinación -->
    <div class="tips-box">
      <strong>💡 Pautas para el Coordinador de Logística y Familia:</strong>
      • Si hay fallas de conexión o alguien se desconecta, el Lector anterior o el Guía General asume el relevo de inmediato sin frenar el rezo.
      • En la consola de logística (<a href="/logistica.html" style="color: #704f14; font-weight: 700; text-decoration: none;">/logistica.html</a>) el anfitrión puede pulsar <em>"Orador Solo"</em> para activar el micrófono de quien lee y silenciar a los demás automáticamente.
      • Al concluir la oración final, se activa en la pantalla la <strong>Proyección conmemorativa de las 46 fotografías</strong> con música instrumental de despedida.
    </div>

  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'public/guia-lectores-dia-7.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const pdfOutputPath = path.join(__dirname, 'public/Guia_Lectores_Novena_Dia_7.pdf');
const pdfRootPath = path.join(__dirname, 'Guia_Lectores_Novena_Dia_7.pdf');

console.log('Compilando PDF de 2 páginas de la Guía de Lectores (Día 7)...');
execSync(`chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "${htmlPath}"`);
fs.copyFileSync(pdfOutputPath, pdfRootPath);

const stats = fs.statSync(pdfOutputPath);
console.log(`✅ Guía de Lectores Día 7 generada exitosamente: ${pdfOutputPath} (${Math.round(stats.size / 1024)} KB)`);

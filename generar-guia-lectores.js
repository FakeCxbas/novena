const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guía de Lectores y Roles — Novena Mami Olguita (Día 6)</title>
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
        content: "Guía de Lectores y Asignación de Roles • Novena Mami Olguita • Día 6";
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
      font-size: 9.8pt;
      margin: 0;
      padding: 0;
    }

    .page-container {
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      padding: 20px 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }

    @media print {
      body {
        background: #fff;
      }
      .page-container {
        max-width: 100%;
        padding: 0;
        box-shadow: none;
      }
      .no-print {
        display: none !important;
      }
    }

    /* Barra Superior para visualización Web */
    .web-toolbar {
      background: #241c14;
      color: #dfb15b;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      border-bottom: 2px solid #8c6d37;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .web-toolbar-title {
      font-size: 0.92rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .web-toolbar-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-action {
      background: #8c6d37;
      color: #fff;
      border: none;
      border-radius: 5px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-action:hover {
      background: #a68449;
    }

    .btn-action.secondary {
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(223, 177, 91, 0.4);
      color: #faf5ed;
    }

    /* Cabecera */
    .header {
      text-align: center;
      border-bottom: 2px solid #8c6d37;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }

    .cross {
      font-size: 18pt;
      color: #8c6d37;
      line-height: 1;
      margin-bottom: 1px;
    }

    .title {
      font-size: 15pt;
      font-weight: 700;
      color: #5c4217;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 1px 0;
    }

    .subtitle {
      font-size: 9.5pt;
      font-style: italic;
      color: #73531f;
      margin: 0;
    }

    .badge-bar {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 3px;
      flex-wrap: wrap;
    }

    .badge-pill {
      background: #faf4e8;
      border: 1px solid #d4b886;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 8.5pt;
      font-weight: 700;
      color: #704f14;
    }

    /* Secciones */
    .section-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #704f14;
      border-bottom: 1px solid #d4b886;
      padding-bottom: 2px;
      margin: 7px 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Reglas de Oro */
    .rules-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 8px;
      margin-bottom: 7px;
    }

    .rule-card {
      background: #fdfbf7;
      border: 1px solid #e8dec8;
      border-left: 3.5px solid #8c6d37;
      border-radius: 4px;
      padding: 4px 7px;
      font-size: 8.85pt;
      line-height: 1.32;
    }

    .rule-card strong {
      color: #704f14;
      display: block;
      font-size: 9.1pt;
      margin-bottom: 1px;
    }

    /* Tabla de Asignación */
    .roles-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      margin-bottom: 6px;
      font-size: 8.75pt;
    }

    .roles-table th {
      background: #704f14;
      color: #fff;
      font-weight: 700;
      text-align: left;
      padding: 4px 6px;
      font-size: 8.4pt;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .roles-table td {
      padding: 3.5px 6px;
      border-bottom: 1px solid #e5ded0;
      vertical-align: middle;
    }

    .roles-table tr:nth-child(even) {
      background: #faf7f2;
    }

    .badge-lector {
      display: inline-block;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 7.2pt;
      font-weight: 700;
      text-transform: uppercase;
      background: #133b68;
      color: #fff;
      padding: 1px 5px;
      border-radius: 3px;
      white-space: nowrap;
    }

    .badge-page {
      display: inline-block;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 7.2pt;
      font-weight: 700;
      background: #7a1c1c;
      color: #fff;
      padding: 1px 5px;
      border-radius: 3px;
      white-space: nowrap;
    }

    .name-line {
      display: inline-block;
      width: 125px;
      border-bottom: 1px dashed #8c6d37;
      color: #133b68;
      font-weight: 700;
      font-size: 9pt;
      padding-left: 3px;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    /* Detalle de Lecturas (Página 2) */
    .lector-detail-box {
      border: 1px solid #e0d5be;
      border-radius: 4px;
      background: #fffdfa;
      margin-bottom: 4.5px;
      padding: 4px 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .lector-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px dashed #d9caa7;
      padding-bottom: 2px;
      margin-bottom: 3px;
    }

    .lector-num {
      font-weight: 700;
      color: #704f14;
      font-size: 9.3pt;
    }

    .lector-desc {
      font-size: 8.75pt;
      color: #333;
      line-height: 1.34;
    }

    .lector-desc strong {
      color: #1a1a1a;
    }

    .phrase-guide {
      background: #f4f6fa;
      border-left: 3px solid #133b68;
      padding: 2px 6px;
      margin-top: 2px;
      font-size: 8.4pt;
      color: #1e293b;
      font-style: italic;
    }

    .tips-box {
      background: #faf4e8;
      border: 1px solid #d4b886;
      border-radius: 4px;
      padding: 5px 8px;
      margin-top: 5px;
      font-size: 8.5pt;
      color: #4b3619;
      line-height: 1.34;
    }

    @media (max-width: 650px) {
      .rules-grid {
        grid-template-columns: 1fr;
      }
      .roles-table {
        font-size: 8pt;
      }
    }
  </style>
</head>
<body>

  <!-- BARRA DE UTILIDADES WEB (SOLO VISIBLE EN NAVEGADOR) -->
  <div class="web-toolbar no-print">
    <div class="web-toolbar-title">
      <span>📖</span>
      <span>Guía de Lectores • Novena Mami Olguita (Día 6)</span>
    </div>
    <div class="web-toolbar-actions">
      <a href="/Guia_Lectores_Novena_Dia_6.pdf" target="_blank" class="btn-action">
        <span>📄</span> Descargar Guía PDF (2 Páginas)
      </a>
      <a href="/Novena_Mami_Olguita_Dia_6.pdf" target="_blank" class="btn-action secondary">
        <span>📑</span> Folleto Completo PDF (6 Páginas)
      </a>
      <button onclick="window.print()" class="btn-action secondary">
        <span>🖨️</span> Imprimir
      </button>
      <a href="/" class="btn-action secondary">
        <span>🏠</span> Pantalla de Rezo
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
        <span class="badge-pill">DÍA 6 • LA MISERICORDIA DE DIOS</span>
        <span class="badge-pill">Misterios Gozosos (Lunes, 5 de Octubre)</span>
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

    <div class="section-title">📋 Matriz de Asignación de Roles para Hoy (Día 6)</div>
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
          <td><strong>Salmo 103, Reflexión Día 6, Oración de la Misericordia y Mensaje</strong></td>
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
          <td><strong>1º Misterio Gozoso: La Anunciación del Ángel</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 3</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 5</span></td>
          <td><strong>2º Misterio Gozoso: La Visitación a Santa Isabel</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 3</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 6</span></td>
          <td><strong>3º Misterio Gozoso: El Nacimiento de Jesús</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 3</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 7</span></td>
          <td><strong>4º Misterio Gozoso: La Presentación en el Templo</strong> (Cita, Meditación y Decena)</td>
          <td><span class="badge-page">Página 4</span></td>
          <td><span class="name-line"></span></td>
        </tr>
        <tr>
          <td><span class="badge-lector">Lector 8</span></td>
          <td><strong>5º Misterio Gozoso: El Niño Jesús en el Templo</strong> (Cita, Meditación y Decena)</td>
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
        <span class="lector-num">Lector 2 • Palabra, Reflexión y Oración del Día 6</span>
        <span class="badge-page">Página 2 del Folleto</span>
      </div>
      <div class="lector-desc">
        Proclama el <strong>Salmo 103, 8-9</strong> (<em>"Misericordioso y clemente es el Señor..."</em>), lee con cariño la <strong>Reflexión del Día 6</strong>, la <strong>Oración del Día 6</strong> pidiendo misericordia para Mami Olguita, y el <strong>Mensaje para la Familia</strong> sobre el perdón y la unidad familiar.
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
        <div class="phrase-guide">Frase de pase: "Iniciamos los Misterios Gozosos con [Lector 4]."</div>
      </div>
    </div>

    <!-- Lectores 4 al 8: Misterios -->
    <div class="lector-detail-box">
      <div class="lector-detail-header">
        <span class="lector-num">Lectores 4 al 8 • Guías de los 5 Misterios Gozosos</span>
        <span class="badge-page">Páginas 3 y 4 del Folleto</span>
      </div>
      <div class="lector-desc">
        Cada lector de misterio realiza los siguientes pasos en orden:
        <br><strong>1. Enunciar el Misterio:</strong> Título correspondiente (ej. <em>"Primer Misterio: La Anunciación..."</em>).
        <br><strong>2. Lectura y Meditación:</strong> Cita bíblica y la meditación sentida recordando la vida y virtudes de Mami Olguita.
        <br><strong>3. Padre Nuestro:</strong> Guía hasta <em>"hágase tu voluntad, en la tierra como en el cielo"</em>. Espera la respuesta familiar.
        <br><strong>4. 10 Ave Marías:</strong> Guía hasta <em>"y bendito es el fruto de tu vientre, Jesús"</em> (10 veces con cuenta tranquila).
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
        Reza las intenciones del Santo Padre (1 Padre Nuestro, 3 Ave Marías, 1 Gloria y <em>"Bajo tu amparo"</em>). Guía <strong>La Salve</strong>. En las <strong>51 Letanías Lauretanas</strong> (numeradas del 01 al 51), lee ordenadamente de arriba hacia abajo: primero la <strong>Columna 1</strong> (01 al 26) y luego la <strong>Columna 2</strong> (27 al 51) mientras la familia responde <em>"Ruega por nosotros"</em> (o <em>"Ruega por ella"</em>), concluyendo con el triple <strong>Cordero de Dios</strong>.
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

const htmlPath = path.join(__dirname, 'public/guia-lectores-dia-6.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const pdfOutputPath = path.join(__dirname, 'public/Guia_Lectores_Novena_Dia_6.pdf');
const pdfRootPath = path.join(__dirname, 'Guia_Lectores_Novena_Dia_6.pdf');

console.log('Compilando PDF de 2 páginas de la Guía de Lectores...');
execSync(`chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "${htmlPath}"`);
fs.copyFileSync(pdfOutputPath, pdfRootPath);

const stats = fs.statSync(pdfOutputPath);
console.log(`✅ Guía de Lectores generada exitosamente: ${pdfOutputPath} (${Math.round(stats.size / 1024)} KB)`);

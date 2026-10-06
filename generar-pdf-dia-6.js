const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Datos estructurados del Día 6 y Misterios Gozosos (Lunes)
const dia6Data = {
  dia: 6,
  titulo: "DÍA 6 • LA MISERICORDIA DE DIOS",
  fechaStr: "Lunes, 5 de Octubre de 2026",
  cita: "«“Misericordioso y clemente es el Señor; lento para la ira y grande en misericordia. No contenderá para siempre, ni guardará el rencor eternamente.”»",
  referencia: "Salmo 103, 8-9",
  reflexion: "Dios conoce el corazón de cada persona. Hoy confiamos en su infinita misericordia y ponemos con profunda paz y gratitud el alma de nuestra querida Mami Olguita en sus santas manos.",
  oracion: [
    "Padre misericordioso, ponemos nuevamente a Mami Olguita en tus manos.",
    "Tú conoces su corazón mejor que nadie. Conoces sus alegrías, sus luchas, sus errores, sus sacrificios y todo el bien que realizó durante su vida terrenal.",
    "Te pedimos que tengas misericordia de ella y que, por el sacrificio de tu Hijo Jesucristo, le concedas el perdón de sus faltas y la vida eterna.",
    "Que pueda descansar en tu presencia y contemplar para siempre la luz de tu rostro."
  ],
  mensajeFamilia: "Todos tenemos recuerdos, errores y momentos que forman parte de nuestra historia. Hoy aprendamos también a perdonar y a pedir perdón. Que Mami Olguita nos inspire a vivir con un corazón más unido, más generoso y lleno de amor."
};

const misteriosGozosos = [
  {
    num: "1º",
    titulo: "La Anunciación del Ángel a María",
    cita: "«El ángel le dijo: “No temas, María, porque has hallado gracia delante de Dios. Concebirás en tu vientre y darás a luz un hijo, y llamarás su nombre Jesús”. María dijo: “He aquí la sierva del Señor; hágase en mí según tu palabra”.»",
    referencia: "Lucas 1, 30-31.38",
    meditacion: "Agradecemos a Dios por el don sagrado de la vida de nuestra querida Mami Olguita y por su fe sencilla, humilde y generosa."
  },
  {
    num: "2º",
    titulo: "La Visitación de María a su prima Santa Isabel",
    cita: "«Y aconteció que cuando oyó Isabel la salutación de María, la criatura saltó en su vientre; e Isabel fue llena del Espíritu Santo, y exclamó a gran voz: “¡Bendita tú entre las mujeres, y bendito el fruto de tu vientre!”»",
    referencia: "Lucas 1, 41-42",
    meditacion: "Recordamos el cariño y la generosidad con que Mami Olguita siempre estuvo atenta a servir, visitar y apoyar a su familia con amor incondicional."
  },
  {
    num: "3º",
    titulo: "El Nacimiento de Jesús en Belén",
    cita: "«Y aconteció que estando ellos allí, se cumplieron los días de su alumbramiento. Y dio a luz a su hijo primogénito, y lo envolvió en pañales, y lo acostó en un pesebre, porque no había lugar para ellos en el mesón.»",
    referencia: "Lucas 2, 6-7",
    meditacion: "Pedimos que la ternura y el amor infinito del Niño Jesús acojan con calidez el alma de Mami Olguita en el descanso celestial."
  },
  {
    num: "4º",
    titulo: "La Presentación de Jesús en el Templo",
    cita: "«Cuando se cumplieron los días de la purificación, según la ley de Moisés, lo llevaron a Jerusalén para presentarle al Señor. Simeón tomó al niño en sus brazos y bendijo a Dios, diciendo: “Ahora, Señor, despides a tu siervo en paz, porque han visto mis ojos tu salvación”.»",
    referencia: "Lucas 2, 22.28-30",
    meditacion: "Ofrecemos con reverencia y amor el alma de Mami Olguita a Dios Padre, reconociendo con profunda gratitud todo el bien que dejó entre nosotros."
  },
  {
    num: "5º",
    titulo: "El Niño Jesús perdido y hallado en el Templo",
    cita: "«Aconteció que tres días después le hallaron en el templo, sentado en medio de los doctores de la ley, oyéndoles y preguntándoles. Y él les dijo: “¿Por qué me buscabais? ¿No sabíais que en los negocios de mi Padre me es necesario estar?”»",
    referencia: "Lucas 2, 46.49",
    meditacion: "Confiamos plenamente en que Mami Olguita ha llegado a la casa del Padre para gozar de su presencia y no separarse jamás de Él."
  }
];

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Novena Día 6 - Mami Olguita (Edición 6 Páginas)</title>
  <style>
    @page {
      size: letter portrait;
      margin: 10mm 13mm 10mm 13mm;
      @bottom-right {
        content: "Página " counter(page) " de 6";
        font-size: 8pt;
        color: #777;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
      @bottom-left {
        content: "Novena por el Eterno Descanso de Mami Olguita • Día 6 • Lunes, 5 de Octubre";
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
      background: #fff;
      line-height: 1.36;
      font-size: 10.3pt;
      margin: 0;
      padding: 0;
    }

    /* Portadilla */
    .cover-header {
      text-align: center;
      padding-bottom: 4px;
      margin-bottom: 5px;
      border-bottom: 2px solid #8c6d37;
    }

    .cross-symbol {
      font-size: 21pt;
      color: #8c6d37;
      line-height: 1;
      margin-bottom: 1px;
    }

    .main-title {
      font-size: 18pt;
      font-weight: 700;
      color: #5c4217;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 2px 0;
    }

    .subtitle {
      font-size: 10.5pt;
      font-style: italic;
      color: #73531f;
      margin: 0 0 2px 0;
    }

    .day-banner {
      background: #faf4e8;
      border: 1px solid #d4b886;
      border-radius: 5px;
      padding: 4px 12px;
      margin: 3px auto 0 auto;
      max-width: 500px;
      text-align: center;
    }

    .day-banner h2 {
      margin: 0;
      font-size: 11.5pt;
      color: #704f14;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .day-banner p {
      margin: 1px 0 0 0;
      font-size: 9pt;
      color: #555;
      font-weight: 600;
    }

    /* Secciones Principales */
    .section-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #704f14;
      border-bottom: 1px solid #d4b886;
      padding-bottom: 2px;
      margin: 7px 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .sub-section-title {
      font-size: 10.3pt;
      font-weight: 700;
      color: #4b3619;
      margin: 5px 0 2px 0;
    }

    .dialogue-box {
      margin-bottom: 5px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Insignias de Oradores en Letra Grande y Alto Contraste */
    .role-guia {
      display: inline-block;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 7.6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #7a1c1c;
      color: #fff;
      padding: 1px 6px;
      border-radius: 3px;
      margin-bottom: 2px;
    }

    .role-todos {
      display: inline-block;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 7.6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #133b68;
      color: #fff;
      padding: 1px 6px;
      border-radius: 3px;
      margin-bottom: 2px;
    }

    .role-text-guia {
      color: #2b2b2b;
      margin-bottom: 2px;
      padding-left: 2px;
      font-size: 10.3pt;
      line-height: 1.36;
    }

    .role-text-todos {
      color: #0b192c;
      font-weight: 700;
      padding-left: 2px;
      margin-bottom: 4px;
      font-size: 10.4pt;
      line-height: 1.36;
    }

    .prayer-card {
      background: #fdfbf7;
      border-left: 3.5px solid #8c6d37;
      padding: 5px 9px;
      margin-bottom: 5px;
      border-radius: 0 4px 4px 0;
      font-size: 10.3pt;
      line-height: 1.38;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .cita-biblica {
      font-size: 10.8pt;
      font-style: italic;
      color: #3b280e;
      text-align: center;
      margin: 5px 0;
      padding: 5px 12px;
      background: #fff8eb;
      border-radius: 4px;
      border-left: 3.5px solid #b89355;
      line-height: 1.4;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .meditacion-box {
      background: #f4f6fa;
      border: 1px solid #ccd7e6;
      border-left: 3.5px solid #133b68;
      border-radius: 4px;
      padding: 4px 8px;
      margin: 3px 0 4px 0;
      color: #1e293b;
      font-size: 9.8pt;
      line-height: 1.34;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .misterio-header {
      background: #fbf5ea;
      border-radius: 4px;
      padding: 3px 8px;
      margin-top: 6px;
      margin-bottom: 2px;
      border: 1px solid #e2d1b3;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .misterio-header h3 {
      margin: 0;
      font-size: 10.5pt;
      color: #704f14;
      font-weight: 700;
    }

    /* Letanías en Dos Columnas Verticales Numeradas */
    .letanias-columns-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 2px 0 3px 0;
    }

    .letania-col {
      display: flex;
      flex-direction: column;
    }

    .letania-item {
      display: flex;
      align-items: center;
      border-bottom: 1px dotted #dedede;
      padding: 0.8px 0;
      font-size: 8.2pt;
      line-height: 1.22;
    }

    .letania-num {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 7.2pt;
      font-weight: 700;
      color: #8c6d37;
      width: 19px;
      flex-shrink: 0;
    }

    .letania-invocacion {
      color: #1a1a1a;
      font-weight: 500;
      flex-grow: 1;
      padding-right: 2px;
    }

    .letania-resp {
      font-weight: 700;
      color: #133b68;
      text-align: right;
      padding-left: 3px;
      white-space: nowrap;
      font-size: 7.8pt;
      flex-shrink: 0;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .homenaje-card {
      border: 2px solid #8c6d37;
      background: #fdfaf4;
      border-radius: 7px;
      padding: 9px 14px;
      text-align: center;
      margin-top: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .homenaje-card .nombre {
      font-size: 13.5pt;
      font-weight: 700;
      color: #704f14;
      letter-spacing: 0.1em;
      margin-bottom: 3px;
    }

    .homenaje-card .lineas {
      font-size: 10pt;
      font-style: italic;
      color: #222;
      margin: 2px 0;
      line-height: 1.4;
    }

    .homenaje-card .rip {
      font-size: 11pt;
      font-weight: 700;
      color: #7a1c1c;
      margin-top: 5px;
    }

    .homenaje-card .mensaje {
      font-size: 9pt;
      color: #555;
      margin-top: 2px;
    }

    p {
      margin: 1.5px 0;
    }
  </style>
</head>
<body>

  <!-- ================= PÁGINA 1: APERTURA, ACTO DE CONTRICIÓN Y ORACIÓN INICIAL ================= -->
  <div class="cover-header">
    <div class="cross-symbol">✝</div>
    <div class="subtitle">Novena por el Eterno Descanso de Nuestra Querida</div>
    <h1 class="main-title">Mami Olguita</h1>
    <p style="margin: 1px 0; font-style: italic; color: #73531f; font-size: 10pt;">
      “Dale, Señor, el descanso eterno, y brille para ella la luz perpetua.”
    </p>

    <div class="day-banner">
      <h2>DÍA 6 • LA MISERICORDIA DE DIOS</h2>
      <p>Rezo de la Novena y Santo Rosario (Misterios Gozosos) • ${dia6Data.fechaStr}</p>
    </div>
  </div>

  <div class="section-title">1. Rito Inicial</div>
  <div class="dialogue-box">
    <span class="role-guia">Orador (Guía):</span>
    <div class="role-text-guia">
      Por la señal de la Santa Cruz, de nuestros enemigos líbranos Señor, Dios nuestro. En el nombre del Padre, del Hijo y del Espíritu Santo.
    </div>
    <span class="role-todos">Todos respondemos:</span>
    <div class="role-text-todos">
      Amén.
    </div>
  </div>

  <div class="section-title">2. Acto de Contrición</div>
  <div class="dialogue-box">
    <span class="role-guia">Orador (Guía) lee:</span>
    <div class="role-text-guia">
      Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Vos quien sois, bondad infinita, y porque os amo sobre todas las cosas, me pesa de todo corazón haberos ofendido; también me pesa porque podéis castigarme con las penas del infierno.
      <br>
      Ayudado de vuestra divina gracia, propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuere impuesta.
    </div>
    <span class="role-todos">Todos respondemos:</span>
    <div class="role-text-todos">
      Amén.
    </div>
  </div>

  <div class="section-title">3. Novena • Día Sexto: La Misericordia de Dios</div>
  <div class="sub-section-title">🙏 Oración Inicial de todos los días</div>
  <div class="dialogue-box">
    <span class="role-guia">Orador (Guía) lee:</span>
    <div class="role-text-guia">
      <p>Señor Dios, Padre misericordioso, nos reunimos como familia para recordar con amor a nuestra querida Mami Olguita, quien ha partido de este mundo.</p>
      <p>Te damos gracias por el regalo de su vida, por todo el amor que nos entregó, por sus enseñanzas, sus palabras, sus cuidados y por tantos momentos que permanecerán para siempre en nuestra memoria.</p>
      <p>Hoy ponemos su alma en tus manos y te pedimos que, por tu infinita misericordia, perdones sus faltas y la recibas en tu Reino, donde ya no existe el dolor, ni la tristeza, ni la enfermedad, sino la vida eterna junto a Ti.</p>
      <p>Danos también fortaleza a quienes quedamos aquí. Consuela nuestros corazones y ayúdanos a aceptar tu voluntad con fe y esperanza.</p>
      <p>Que esta novena sea una muestra de nuestro amor y gratitud por Mami Olguita.</p>
    </div>
    <span class="role-todos">Todos respondemos:</span>
    <div class="role-text-todos">
      Amén.
    </div>
  </div>

  <!-- ================= PÁGINA 2: LECTURA, REFLEXIÓN, ORACIÓN DÍA 6, MENSAJE FAMILIAR Y CREDO ================= -->
  <div class="page-break"></div>

  <div class="cita-biblica">
    ${dia6Data.cita}
    <div style="font-size: 8.8pt; color: #704f14; font-weight: 700; margin-top: 2px;">— ${dia6Data.referencia}</div>
  </div>

  <div class="sub-section-title">💡 Reflexión del Día 6</div>
  <div class="prayer-card">
    ${dia6Data.reflexion}
  </div>

  <div class="sub-section-title">🕊️ Oración del Día 6</div>
  <div class="dialogue-box">
    <span class="role-guia">Orador (Guía) lee:</span>
    <div class="role-text-guia">
      ${dia6Data.oracion.map(p => `<p>${p}</p>`).join('')}
    </div>
    <span class="role-todos">Todos respondemos:</span>
    <div class="role-text-todos">
      Amén.
    </div>
  </div>

  <div class="sub-section-title">🤍 Mensaje para la Familia</div>
  <div class="meditacion-box" style="background: #faf7f0; border-left-color: #8c6d37; margin-bottom: 7px; font-size: 10pt;">
    <strong>Recordatorio para nuestro hogar:</strong><br>
    ${dia6Data.mensajeFamilia}
  </div>

  <div class="section-title">4. El Santo Rosario (Misterios Gozosos)</div>
  <div class="dialogue-box">
    <span class="role-guia">Orador (Ofrecimiento):</span>
    <div class="role-text-guia">
      Ofrecemos este Santo Rosario por el eterno descanso de nuestra querida <strong>Mami Olguita</strong>. Pedimos al Señor que purifique su alma, que perdone sus faltas y que la reciba en su gloria celestial, concediendo también el consuelo, la paz y la unión a nuestra familia en este momento de dolor.
      <br>
      Santa María, Madre de Dios, acompáñanos durante esta santa oración e intercede por ella ante tu Hijo Jesucristo. Amén.
    </div>
  </div>

  <div class="sub-section-title">📖 Credo de los Apóstoles</div>
  <div class="dialogue-box">
    <span class="role-guia">Guía:</span>
    <div class="role-text-guia">
      Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra.
    </div>
    <span class="role-todos">Todos:</span>
    <div class="role-text-todos">
      Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo; nació de Santa María Virgen; padeció bajo el poder de Poncio Pilato; fue crucificado, muerto y sepultado; descendió a los infiernos; al tercer día resucitó de entre los muertos; subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la Santa Iglesia Católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.
    </div>
  </div>

  <!-- ================= PÁGINA 3: MISTERIOS GOZOSOS 1, 2 Y 3 ================= -->
  <div class="page-break"></div>

  <div class="prayer-card" style="margin-top: 2px; font-size: 9.8pt;">
    <div style="font-weight: 700; color: #704f14; font-size: 10.2pt; margin-bottom: 2px;">Oraciones que rezamos en cada Misterio:</div>
    <div style="line-height: 1.42; color: #333;">
      <strong>• Padre Nuestro:</strong> Guía hasta <em>“como en el cielo”</em> • Todos: <em>“Danos hoy nuestro pan de cada día...”</em><br>
      <strong>• 10 Ave Marías:</strong> Guía hasta <em>“fruto de tu vientre, Jesús”</em> • Todos: <em>“Santa María, Madre de Dios, ruega por nosotros...”</em><br>
      <strong>• Gloria:</strong> Guía: <em>“Gloria al Padre, al Hijo y al Espíritu Santo”</em> • Todos: <em>“Como era en el principio, ahora y siempre...”</em><br>
      <strong>• Jaculatorias por Mami Olguita:</strong><br>
      &nbsp;&nbsp;1. Guía: <em>“Si por tu sangre preciosa, Señor, la has redimido.”</em> • Todos: <strong>“Que la perdones, te pido, por tu Pasión dolorosa.”</strong><br>
      &nbsp;&nbsp;2. Guía: <em>“Dale, Señor, el descanso eterno.”</em> • Todos: <strong>“Y brille para ella la luz perpetua. Que por la misericordia de Dios, el alma de Mami Olguita descanse en paz. Amén.”</strong>
    </div>
  </div>

  <div class="section-title">Misterios Gozosos del Día (Lunes)</div>

  <!-- Misterio 1 -->
  <div class="misterio-header">
    <h3>${misteriosGozosos[0].num} Misterio Gozoso: ${misteriosGozosos[0].titulo}</h3>
  </div>
  <div class="meditacion-box" style="background: #fffcf5; border-left-color: #8c6d37;">
    <strong>📖 Lectura Bíblica:</strong> <em>${misteriosGozosos[0].cita}</em> <span style="font-weight: 700; color: #704f14;">(${misteriosGozosos[0].referencia})</span>
  </div>
  <div class="meditacion-box">
    <strong>🕊️ Meditación por Mami Olguita:</strong><br>
    “${misteriosGozosos[0].meditacion}”
  </div>
  <p style="font-size: 8.8pt; color: #555; margin: 0 0 6px 4px; font-style: italic;">(Se reza 1 Padre Nuestro, 10 Ave Marías, 1 Gloria y las 2 Jaculatorias por Mami Olguita).</p>

  <!-- Misterio 2 -->
  <div class="misterio-header">
    <h3>${misteriosGozosos[1].num} Misterio Gozoso: ${misteriosGozosos[1].titulo}</h3>
  </div>
  <div class="meditacion-box" style="background: #fffcf5; border-left-color: #8c6d37;">
    <strong>📖 Lectura Bíblica:</strong> <em>${misteriosGozosos[1].cita}</em> <span style="font-weight: 700; color: #704f14;">(${misteriosGozosos[1].referencia})</span>
  </div>
  <div class="meditacion-box">
    <strong>🕊️ Meditación por Mami Olguita:</strong><br>
    “${misteriosGozosos[1].meditacion}”
  </div>
  <p style="font-size: 8.8pt; color: #555; margin: 0 0 6px 4px; font-style: italic;">(Se reza 1 Padre Nuestro, 10 Ave Marías, 1 Gloria y las 2 Jaculatorias por Mami Olguita).</p>

  <!-- Misterio 3 -->
  <div class="misterio-header">
    <h3>${misteriosGozosos[2].num} Misterio Gozoso: ${misteriosGozosos[2].titulo}</h3>
  </div>
  <div class="meditacion-box" style="background: #fffcf5; border-left-color: #8c6d37;">
    <strong>📖 Lectura Bíblica:</strong> <em>${misteriosGozosos[2].cita}</em> <span style="font-weight: 700; color: #704f14;">(${misteriosGozosos[2].referencia})</span>
  </div>
  <div class="meditacion-box">
    <strong>🕊️ Meditación por Mami Olguita:</strong><br>
    “${misteriosGozosos[2].meditacion}”
  </div>
  <p style="font-size: 8.8pt; color: #555; margin: 0 0 4px 4px; font-style: italic;">(Se reza 1 Padre Nuestro, 10 Ave Marías, 1 Gloria y las 2 Jaculatorias por Mami Olguita).</p>

  <!-- ================= PÁGINA 4: MISTERIOS GOZOSOS 4 Y 5 + CIERRE DEL ROSARIO ================= -->
  <div class="page-break"></div>

  <!-- Misterio 4 -->
  <div class="misterio-header">
    <h3>${misteriosGozosos[3].num} Misterio Gozoso: ${misteriosGozosos[3].titulo}</h3>
  </div>
  <div class="meditacion-box" style="background: #fffcf5; border-left-color: #8c6d37;">
    <strong>📖 Lectura Bíblica:</strong> <em>${misteriosGozosos[3].cita}</em> <span style="font-weight: 700; color: #704f14;">(${misteriosGozosos[3].referencia})</span>
  </div>
  <div class="meditacion-box">
    <strong>🕊️ Meditación por Mami Olguita:</strong><br>
    “${misteriosGozosos[3].meditacion}”
  </div>
  <p style="font-size: 8.8pt; color: #555; margin: 0 0 8px 4px; font-style: italic;">(Se reza 1 Padre Nuestro, 10 Ave Marías, 1 Gloria y las 2 Jaculatorias por Mami Olguita).</p>

  <!-- Misterio 5 -->
  <div class="misterio-header">
    <h3>${misteriosGozosos[4].num} Misterio Gozoso: ${misteriosGozosos[4].titulo}</h3>
  </div>
  <div class="meditacion-box" style="background: #fffcf5; border-left-color: #8c6d37;">
    <strong>📖 Lectura Bíblica:</strong> <em>${misteriosGozosos[4].cita}</em> <span style="font-weight: 700; color: #704f14;">(${misteriosGozosos[4].referencia})</span>
  </div>
  <div class="meditacion-box">
    <strong>🕊️ Meditación por Mami Olguita:</strong><br>
    “${misteriosGozosos[4].meditacion}”
  </div>
  <p style="font-size: 8.8pt; color: #555; margin: 0 0 10px 4px; font-style: italic;">(Se reza 1 Padre Nuestro, 10 Ave Marías, 1 Gloria y las 2 Jaculatorias por Mami Olguita).</p>

  <div class="section-title">Cierre del Santo Rosario</div>
  <div class="dialogue-box">
    <div style="font-size: 10pt; color: #222; margin-bottom: 5px; line-height: 1.4;">
      Rezado con fe por las intenciones del Santo Padre y el aumento de la fe, la esperanza y la caridad en toda nuestra familia:
      <br>
      • <strong>1 Padre Nuestro</strong> &nbsp;&nbsp;• <strong>3 Ave Marías</strong> &nbsp;&nbsp;• <strong>1 Gloria al Padre</strong>
    </div>
  </div>

  <div class="prayer-card" style="margin-top: 6px; margin-bottom: 6px;">
    <div style="font-style: italic; color: #704f14; font-size: 9.8pt; line-height: 1.38;">
      “Bajo tu amparo nos acogemos, Santa Madre de Dios; no deseches las súplicas que te dirigimos en nuestras necesidades, antes bien líbranos de todo peligro, ¡oh Virgen gloriosa y bendita!”
    </div>
  </div>

  <!-- ================= PÁGINA 5: LA SALVE Y LETANÍAS LAURETANAS ================= -->
  <div class="page-break"></div>

  <div class="section-title">🌹 La Salve a la Santísima Virgen</div>
  <div class="dialogue-box" style="margin-bottom: 5px;">
    <span class="role-guia">Guía:</span>
    <div class="role-text-guia">
      Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra. Dios te salve.
    </div>
    <span class="role-todos">Todos:</span>
    <div class="role-text-todos">
      A Ti llamamos los desterrados hijos de Eva. A Ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos. Y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clemente, oh piadosa, oh dulce Virgen María! Ruega por nosotros, Santa Madre de Dios, para que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo. Amén.
    </div>
  </div>

  <div class="section-title" style="margin-top: 3px;">✨ Letanías Lauretanas a la Santísima Virgen María</div>
  <div style="font-size: 8.2pt; color: #555; margin-bottom: 2px; font-style: italic;">
    El Guía proclama cada invocación y todos respondemos a una sola voz: <strong>"Ruega por nosotros"</strong> (o <strong>"Ruega por ella"</strong>):
  </div>

  <div style="background: #faf4e8; border: 1px solid #d4b886; border-radius: 4px; padding: 2px 7px; font-size: 8.2pt; margin-bottom: 3px; line-height: 1.28;">
    <strong>Súplicas iniciales:</strong> &nbsp;
    <span class="role-guia" style="font-size: 6.8pt; padding: 0 4px;">Guía:</span> Señor, ten piedad. (Todos: <strong>Señor, ten piedad</strong>) • 
    <span class="role-guia" style="font-size: 6.8pt; padding: 0 4px;">Guía:</span> Cristo, ten piedad. (Todos: <strong>Cristo, ten piedad</strong>) • 
    <span class="role-guia" style="font-size: 6.8pt; padding: 0 4px;">Guía:</span> Señor, ten piedad. (Todos: <strong>Señor, ten piedad</strong>)
  </div>

  <div class="letanias-columns-wrap">
    <!-- COLUMNA 1: Invocaciones 01 al 26 -->
    <div class="letania-col">
      <div class="letania-item"><span class="letania-num">01.</span><span class="letania-invocacion">Santa María</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">02.</span><span class="letania-invocacion">Santa Madre de Dios</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">03.</span><span class="letania-invocacion">Santa Virgen de las vírgenes</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">04.</span><span class="letania-invocacion">Madre de Cristo</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">05.</span><span class="letania-invocacion">Madre de la Iglesia</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">06.</span><span class="letania-invocacion">Madre de la divina gracia</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">07.</span><span class="letania-invocacion">Madre purísima</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">08.</span><span class="letania-invocacion">Madre castísima</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">09.</span><span class="letania-invocacion">Madre siempre virgen</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">10.</span><span class="letania-invocacion">Madre inmaculada</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">11.</span><span class="letania-invocacion">Madre amable</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">12.</span><span class="letania-invocacion">Madre admirable</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">13.</span><span class="letania-invocacion">Madre del buen consejo</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">14.</span><span class="letania-invocacion">Madre del Creador</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">15.</span><span class="letania-invocacion">Madre del Salvador</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">16.</span><span class="letania-invocacion">Virgen prudentísima</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">17.</span><span class="letania-invocacion">Virgen digna de veneración</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">18.</span><span class="letania-invocacion">Virgen digna de alabanza</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">19.</span><span class="letania-invocacion">Virgen poderosa</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">20.</span><span class="letania-invocacion">Virgen clemente</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">21.</span><span class="letania-invocacion">Virgen fiel</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">22.</span><span class="letania-invocacion">Espejo de justicia</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">23.</span><span class="letania-invocacion">Trono de la sabiduría</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">24.</span><span class="letania-invocacion">Causa de nuestra alegría</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">25.</span><span class="letania-invocacion">Vaso espiritual</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">26.</span><span class="letania-invocacion">Vaso digno de honor</span><span class="letania-resp">Ruega por nosotros</span></div>
    </div>

    <!-- COLUMNA 2: Invocaciones 27 al 51 -->
    <div class="letania-col">
      <div class="letania-item"><span class="letania-num">27.</span><span class="letania-invocacion">Vaso insigne de devoción</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">28.</span><span class="letania-invocacion">Rosa mística</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">29.</span><span class="letania-invocacion">Torre de David</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">30.</span><span class="letania-invocacion">Torre de marfil</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">31.</span><span class="letania-invocacion">Casa de oro</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">32.</span><span class="letania-invocacion">Arca de la alianza</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">33.</span><span class="letania-invocacion">Puerta del cielo</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">34.</span><span class="letania-invocacion">Estrella de la mañana</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">35.</span><span class="letania-invocacion">Salud de los enfermos</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">36.</span><span class="letania-invocacion">Refugio de los pecadores</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">37.</span><span class="letania-invocacion">Consuelo de los afligidos</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">38.</span><span class="letania-invocacion">Auxilio de los cristianos</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">39.</span><span class="letania-invocacion">Reina de los ángeles</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">40.</span><span class="letania-invocacion">Reina de los patriarcas</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">41.</span><span class="letania-invocacion">Reina de los profetas</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">42.</span><span class="letania-invocacion">Reina de los apóstoles</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">43.</span><span class="letania-invocacion">Reina de los mártires</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">44.</span><span class="letania-invocacion">Reina de los confesores</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">45.</span><span class="letania-invocacion">Reina de las vírgenes</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">46.</span><span class="letania-invocacion">Reina de todos los santos</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">47.</span><span class="letania-invocacion">Reina concebida sin pecado original</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">48.</span><span class="letania-invocacion">Reina asunta al cielo</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">49.</span><span class="letania-invocacion">Reina del Santísimo Rosario</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">50.</span><span class="letania-invocacion">Reina de la familia</span><span class="letania-resp">Ruega por nosotros</span></div>
      <div class="letania-item"><span class="letania-num">51.</span><span class="letania-invocacion">Reina de la paz</span><span class="letania-resp">Ruega por nosotros</span></div>
    </div>
  </div>

  <div class="dialogue-box" style="margin-top: 3px; font-size: 9.2pt; background: #faf7f0; border-left: 3px solid #8c6d37; padding: 3px 7px; border-radius: 0 4px 4px 0;">
    <div style="font-weight: 700; color: #704f14; font-size: 8.6pt; margin-bottom: 1px;">🐑 Cordero de Dios (Agnus Dei):</div>
    <div style="line-height: 1.34;">
      <span class="role-guia" style="font-size: 6.8pt; padding: 0 4px;">Guía:</span> Cordero de Dios, que quitas los pecados del mundo. • <span class="role-todos" style="font-size: 6.8pt; padding: 0 4px;">Todos:</span> <strong style="color: #133b68;">Perdónanos, Señor.</strong><br>
      <span class="role-guia" style="font-size: 6.8pt; padding: 0 4px;">Guía:</span> Cordero de Dios, que quitas los pecados del mundo. • <span class="role-todos" style="font-size: 6.8pt; padding: 0 4px;">Todos:</span> <strong style="color: #133b68;">Escúchanos, Señor.</strong><br>
      <span class="role-guia" style="font-size: 6.8pt; padding: 0 4px;">Guía:</span> Cordero de Dios, que quitas los pecados del mundo. • <span class="role-todos" style="font-size: 6.8pt; padding: 0 4px;">Todos:</span> <strong style="color: #133b68;">Ten piedad y misericordia de nosotros.</strong>
    </div>
  </div>

  <!-- ================= PÁGINA 6: ORACIONES FINALES, BENDICIÓN Y HOMENAJE ================= -->
  <div class="page-break"></div>

  <div class="section-title">5. Oraciones Finales y Despedida</div>

  <div class="sub-section-title">Oración final por Mami Olguita</div>
  <div class="dialogue-box">
    <span class="role-guia">Orador (Guía) lee:</span>
    <div class="role-text-guia">
      <p>Oh Dios, que concediste a tu sierva Mami Olguita la gracia de compartir su vida con nosotros, recibe ahora su alma en tu Reino. Perdona sus faltas y concédele la vida eterna.</p>
      <p>Que descanse en paz, libre de todo sufrimiento, y que pueda contemplar eternamente tu rostro. A nosotros, sus familiares, danos fortaleza para continuar viviendo con fe, esperanza y amor. Que el recuerdo de Mami Olguita nos ayude a permanecer unidos y que algún día podamos reunirnos nuevamente en tu Reino. Por Jesucristo, nuestro Señor.</p>
    </div>
    <span class="role-todos">Todos respondemos:</span>
    <div class="role-text-todos">
      Amén.
    </div>
  </div>

  <div class="sub-section-title">Oración final de la familia</div>
  <div class="dialogue-box">
    <span class="role-guia">Orador (Guía) lee:</span>
    <div class="role-text-guia">
      <p>Señor, hoy nos reunimos como familia y queremos darte las gracias por la vida de nuestra querida Mami Olguita. Gracias por habérnosla regalado. Gracias por cada momento vivido a su lado. Gracias por su amor, sus enseñanzas, sus cuidados y por las historias y recuerdos que nos dejó.</p>
      <p>Te pedimos que la recibas en tu Reino y que le concedas el descanso eterno. Y te pedimos algo más, Señor: cuida de nuestra familia. Ayúdanos a permanecer unidos, a perdonarnos, a acompañarnos y a querernos. Que nunca olvidemos que somos familia y que el amor debe ser siempre más fuerte que cualquier diferencia. Que cada vez que recordemos a Mami Olguita, podamos hacerlo con amor y gratitud. Y que desde el cielo ella pueda ver a su familia unida.</p>
    </div>
    <span class="role-todos">Todos respondemos:</span>
    <div class="role-text-todos">
      Amén.
    </div>
  </div>

  <div class="dialogue-box" style="margin-top: 3px;">
    <span class="role-guia">Guía:</span>
    <div class="role-text-guia">Dale, Señor, el descanso eterno.</div>
    <span class="role-todos">Todos:</span>
    <div class="role-text-todos">
      Y brille para ella la luz perpetua. Que su alma y las almas de todos los fieles difuntos, por la misericordia de Dios, descansen en paz. Amén.
    </div>
  </div>

  <div class="sub-section-title">Despedida Final y Bendición</div>
  <div class="dialogue-box">
    <span class="role-guia">Guía:</span>
    <div class="role-text-guia">Dale, Señor, el descanso eterno.</div>
    <span class="role-todos">Todos:</span>
    <div class="role-text-todos">Y brille para ella la luz perpetua. Que Mami Olguita descanse en paz. Amén.</div>
    <span class="role-guia">Guía (Bendición final):</span>
    <div class="role-text-guia">
      El Señor nos bendiga, nos guarde de todo mal y nos lleve a la vida eterna. En el nombre del Padre, del Hijo y del Espíritu Santo.
    </div>
    <span class="role-todos">Todos:</span>
    <div class="role-text-todos">Amén.</div>
  </div>

  <!-- HOMENAJE FINAL -->
  <div class="homenaje-card">
    <div class="nombre">MAMI OLGUITA</div>
    <div class="lineas">
      Tu vida fue un regalo. • Tu amor fue una bendición. • Tu recuerdo será eterno.
    </div>
    <div class="rip">Descansa en paz.</div>
    <div class="mensaje">Te queremos y te llevaremos siempre en nuestros corazones.</div>
  </div>

</body>
</html>
`;

// Rutas de salida
const htmlPath = path.join(__dirname, 'public/dia-6-novena.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const pdfOutputPath = path.join(__dirname, 'public/Novena_Mami_Olguita_Dia_6.pdf');
const pdfRootPath = path.join(__dirname, 'Novena_Mami_Olguita_Dia_6.pdf');

console.log('Compilando PDF optimizado de 6 páginas para el Día 6...');
execSync(`chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "${htmlPath}"`);
fs.copyFileSync(pdfOutputPath, pdfRootPath);

const stats = fs.statSync(pdfOutputPath);
console.log(`✅ PDF generado exitosamente: ${pdfOutputPath} (${Math.round(stats.size / 1024)} KB)`);

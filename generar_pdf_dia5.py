import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#715629"))
        # Top header line
        self.drawString(36, 756, "NOVENA POR EL ETERNO DESCANSO DE NUESTRA MAMI OLGUITA • DÍA 5 (MISTERIOS GLORIOSOS)")
        self.setStrokeColor(colors.HexColor("#d4af37"))
        self.setLineWidth(0.8)
        self.line(36, 750, 576, 750)
        
        # Bottom footer line
        self.line(36, 40, 576, 40)
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#555555"))
        self.drawString(36, 28, "Guía de Lectura para el Orador • Letra Grande para Impresión en Papel")
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(576, 28, page_text)
        self.restoreState()

def build_pdf():
    pdf_filename = "public/Novena_Mami_Olguita_Dia_5.pdf"
    root_pdf = "Novena_Mami_Olguita_Dia_5.pdf"
    
    # 36pt = 0.5 inch margins -> 612 x 792 pt letter
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=50,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Custom styles with LARGE readable typography for the speaker
    c_gold_dark = colors.HexColor("#5c4314")
    c_gold_amber = colors.HexColor("#8c6928")
    c_guia_bg = colors.HexColor("#851d2e")
    c_todos_bg = colors.HexColor("#1b396b")
    c_body_dark = colors.HexColor("#111827")
    c_card_bg = colors.HexColor("#fdf9f2")
    c_quote_bg = colors.HexColor("#f7f2ea")

    title_main = ParagraphStyle(
        'TitleMain',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=1, # Center
        textColor=c_gold_dark,
        spaceAfter=3
    )

    title_sub = ParagraphStyle(
        'TitleSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor("#991b1b"),
        spaceAfter=4
    )

    title_badge = ParagraphStyle(
        'TitleBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=13,
        alignment=1,
        textColor=colors.HexColor("#4b5563"),
        spaceAfter=10
    )

    sec_header = ParagraphStyle(
        'SecHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=c_gold_dark,
        spaceBefore=8,
        spaceAfter=4
    )

    misterio_title = ParagraphStyle(
        'MisterioTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#851d2e"),
        spaceBefore=8,
        spaceAfter=4
    )

    bible_quote = ParagraphStyle(
        'BibleQuote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10.5,
        leading=14.5,
        textColor=colors.HexColor("#292524"),
        spaceBefore=2,
        spaceAfter=3
    )

    text_guia = ParagraphStyle(
        'TextGuia',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11.5,
        leading=15.5,
        textColor=c_body_dark,
        spaceBefore=2,
        spaceAfter=3
    )

    text_todos = ParagraphStyle(
        'TextTodos',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15.5,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=2,
        spaceAfter=4
    )

    rubric = ParagraphStyle(
        'Rubric',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#6b7280"),
        spaceBefore=1,
        spaceAfter=2
    )

    story = []

    # PORTADA / ENCABEZADO
    story.append(Paragraph("NOVENA POR EL ETERNO DESCANSO DE MAMI OLGUITA", title_main))
    story.append(Paragraph("DÍA 5 — LOS MISTERIOS GLORIOSOS", title_sub))
    story.append(Paragraph("Plantilla de Lectura con Letra Grande para el Orador (En papel)", title_badge))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#d4af37"), spaceAfter=8))

    # I. SEÑAL DE LA CRUZ
    story.append(Paragraph("I. SEÑAL DE LA SANTA CRUZ", sec_header))
    story.append(Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Por la señal de la Santa Cruz, de nuestros enemigos, líbranos, Señor, Dios nuestro. En el nombre del Padre, del Hijo y del Espíritu Santo.", text_guia))
    story.append(Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b>", text_todos))
    story.append(Spacer(1, 4))

    # II. ACTO DE CONTRICIÓN
    story.append(Paragraph("II. ACTO DE CONTRICIÓN", sec_header))
    story.append(Paragraph("<i>(Rezado a una sola voz por toda la familia)</i>", rubric))
    story.append(Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Tú quien eres, Bondad infinita, y porque te amo sobre todas las cosas, me pesa de todo corazón haberte ofendido. Propongo firmemente nunca más pecar, apartarme de todas las ocasiones de ofenderte, confesarme y cumplir la penitencia que me fuere impuesta. Ofrezco, Señor, mi vida, obras y trabajos en satisfacción de todos mis pecados; y confío en tu bondad y misericordia infinita que me los perdonarás por los méritos de tu preciosísima Sangre, pasión y muerte, y me darás gracia para enmendarme y perseverar en tu santo servicio hasta el fin de mi vida. Amén.</b>", text_todos))
    story.append(Spacer(1, 6))

    # III. MEDITACIÓN INICIAL DEL QUINTO DÍA
    story.append(Paragraph("III. INTENCIÓN Y MEDITACIÓN INICIAL DEL QUINTO DÍA", sec_header))
    story.append(Paragraph("<i>(Ofrecimiento inicial por el descanso de nuestra querida mami Olguita)</i>", rubric))
    story.append(Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> «Señor Jesús, tú que eres la resurrección y la vida, nos reunimos en este quinto día para pedirte por el alma de nuestra mami Olguita. Sabemos que tu misericordia es infinita. Mira con ojos de amor las buenas obras que hizo en la tierra y perdona cualquier falta que haya cometido por la fragilidad humana. Dale la perseverancia de los justos y recíbela en tu descanso eterno.»", text_guia))
    story.append(Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b>", text_todos))
    story.append(Spacer(1, 6))

    # IV. CREDO DE LOS APÓSTOLES
    story.append(Paragraph("IV. EL CREDO DE LOS APÓSTOLES", sec_header))
    story.append(Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Creo en Dios, Padre Todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo; nació de Santa María Virgen; padeció bajo el poder de Poncio Pilato; fue crucificado, muerto y sepultado; descendió a los infiernos; al tercer día resucitó de entre los muertos; subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la Santa Iglesia Católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.</b>", text_todos))
    story.append(Spacer(1, 8))

    # V. LOS MISTERIOS GLORIOSOS
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#d4af37"), spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("V. LOS MISTERIOS GLORIOSOS POR LA MAMI OLGUITA", title_sub))
    story.append(Paragraph("<i>(En cada misterio: 1 Padre Nuestro, 10 Ave Marías, 1 Gloria y la Jaculatoria final)</i>", rubric))
    story.append(Spacer(1, 4))

    def make_jaculatoria_flowable():
        data = [
            [Paragraph("<b><font color='#851d2e'>Guía:</font></b> Si por tu preciosa sangre, Señor, la has redimido.", text_guia)],
            [Paragraph("<b><font color='#1b396b'>Todos:</font> Que la perdones, te pido, por tu pasión dolorosa.</b>", text_todos)],
            [Paragraph("<b><font color='#851d2e'>Guía:</font></b> Dale, Señor, el descanso eterno.", text_guia)],
            [Paragraph("<b><font color='#1b396b'>Todos:</font> Y luzca para ella la luz perpetua.</b>", text_todos)],
            [Paragraph("<b><font color='#851d2e'>Guía:</font></b> Que el alma de nuestra mami Olguita y las demás del Purgatorio, por la misericordia de Dios, descansen en paz.", text_guia)],
            [Paragraph("<b><font color='#1b396b'>Todos:</font> Amén.</b>", text_todos)],
        ]
        t = Table(data, colWidths=[530])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fdf9f2")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#d4af37")),
            ('LINELEFT', (0,0), (0,-1), 3.5, colors.HexColor("#851d2e")),
            ('TOPPADDING', (0,0), (-1,-1), 1.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    # 1º MISTERIO
    story.append(KeepTogether([
        Paragraph("1º Misterio Glorioso: La Resurrección del Hijo de Dios", misterio_title),
        Paragraph("«El ángel dijo a las mujeres: “No teman ustedes; sé que buscan a Jesús, el crucificado. No está aquí, pues ha resucitado, como dijo. Vengan, vean el lugar donde fue puesto el Señor”.» <i>(Mateo 28, 5-6)</i>", bible_quote),
        Paragraph("<b><font color='#851d2e'>[Meditación Guía]:</font></b> Jesús venció a la muerte para darnos vida eterna. Ofrecemos este misterio con la firme esperanza de que nuestra mami Olguita también resucitará con Cristo y gozará de una vida nueva donde ya no existe la enfermedad ni el dolor.", text_guia),
        Paragraph("<i>📿 Se reza: 1 Padre Nuestro, 10 Ave Marías y 1 Gloria. Luego se dice la Jaculatoria:</i>", rubric),
        Spacer(1, 2),
        make_jaculatoria_flowable()
    ]))
    story.append(Spacer(1, 10))

    # 2º MISTERIO
    story.append(KeepTogether([
        Paragraph("2º Misterio Glorioso: La Ascensión del Señor al Cielo", misterio_title),
        Paragraph("«Y habiendo dicho estas cosas, viéndolo ellos, fue elevado, y una nube lo ocultó de sus ojos... Este mismo Jesús, que ha sido tomado de entre ustedes al cielo, vendrá del mismo modo que lo han visto ir al cielo.» <i>(Hechos 1, 9.11)</i>", bible_quote),
        Paragraph("<b><font color='#851d2e'>[Meditación Guía]:</font></b> Jesús sube al cielo a preparar un lugar para nosotros. Le pedimos al Señor que abra las puertas del paraíso a mami Olguita, y que el lugar que Él le prometió y preparó esté listo para ella en la casa del Padre.", text_guia),
        Paragraph("<i>📿 Se reza: 1 Padre Nuestro, 10 Ave Marías y 1 Gloria. Luego se dice la Jaculatoria:</i>", rubric),
        Spacer(1, 2),
        make_jaculatoria_flowable()
    ]))
    story.append(Spacer(1, 10))

    # 3º MISTERIO
    story.append(KeepTogether([
        Paragraph("3º Misterio Glorioso: La Venida del Espíritu Santo", misterio_title),
        Paragraph("«Cuando llegó el día de Pentecostés, estaban todos reunidos en un mismo lugar. De repente vino del cielo un ruido como de viento recio, y se les aparecieron lenguas como de fuego; y fueron todos llenos del Espíritu Santo.» <i>(Hechos 2, 1-4)</i>", bible_quote),
        Paragraph("<b><font color='#851d2e'>[Meditación Guía]:</font></b> El Espíritu Santo desciende para consolar a los apóstoles. Rogamos para que ese mismo Espíritu Divino traiga consuelo, paz y resignación al corazón de toda la familia que hoy extraña y llora la partida de mami Olguita.", text_guia),
        Paragraph("<i>📿 Se reza: 1 Padre Nuestro, 10 Ave Marías y 1 Gloria. Luego se dice la Jaculatoria:</i>", rubric),
        Spacer(1, 2),
        make_jaculatoria_flowable()
    ]))
    story.append(Spacer(1, 10))

    # 4º MISTERIO
    story.append(KeepTogether([
        Paragraph("4º Misterio Glorioso: La Asunción de la Virgen María", misterio_title),
        Paragraph("«“Porque ha mirado la humildad de su esclava; pues he aquí, desde ahora me llamarán bienaventurada todas las generaciones. Porque ha hecho en mí grandes cosas el Poderoso, y santo es su nombre.”» <i>(Lucas 1, 48-49)</i>", bible_quote),
        Paragraph("<b><font color='#851d2e'>[Meditación Guía]:</font></b> María es llevada al cielo en cuerpo y alma por los ángeles. Pedimos a la Virgen Santísima que reciba con amor de madre a mami Olguita, la tome de la mano y la guíe en su entrada al reino celestial.", text_guia),
        Paragraph("<i>📿 Se reza: 1 Padre Nuestro, 10 Ave Marías y 1 Gloria. Luego se dice la Jaculatoria:</i>", rubric),
        Spacer(1, 2),
        make_jaculatoria_flowable()
    ]))
    story.append(Spacer(1, 10))

    # 5º MISTERIO
    story.append(KeepTogether([
        Paragraph("5º Misterio Glorioso: La Coronación de la Virgen María", misterio_title),
        Paragraph("«Apareció en el cielo una gran señal: una mujer vestida del sol, con la luna debajo de sus pies, y sobre su cabeza una corona de doce estrellas.» <i>(Apocalipsis 12, 1)</i>", bible_quote),
        Paragraph("<b><font color='#851d2e'>[Meditación Guía]:</font></b> María es coronada como Reina de todo lo creado. Nos unimos a la alegría del cielo y suplicamos a la Reina de los Ángeles que interceda ante su Hijo para que mami Olguita sea coronada con la gloria eterna.", text_guia),
        Paragraph("<i>📿 Se reza: 1 Padre Nuestro, 10 Ave Marías y 1 Gloria. Luego se dice la Jaculatoria:</i>", rubric),
        Spacer(1, 2),
        make_jaculatoria_flowable()
    ]))
    story.append(Spacer(1, 12))

    # VI. TRES AVEMARÍAS POR LA PUREZA DE MAMI OLGUITA
    story.append(KeepTogether([
        Paragraph("VI. TRES AVEMARÍAS POR LA PUREZA DE MAMI OLGUITA", sec_header),
        Paragraph("<b>1ª Ave María (Por la Fe):</b>", rubric),
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Dios te salve, María Santísima, Hija de Dios Padre, Virgen purísima antes del parto; en tus manos encomendamos nuestra fe y el alma de la mami Olguita para que la salves. Llena eres de gracia, el Señor es contigo...", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.</b>", text_todos),
        Spacer(1, 4),
        Paragraph("<b>2ª Ave María (Por la Esperanza):</b>", rubric),
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Dios te salve, María Santísima, Madre de Dios Hijo, Virgen purísima en el parto; en tus manos encomendamos nuestra esperanza y el alma de la mami Olguita para que la salves. Llena eres de gracia...", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.</b>", text_todos),
        Spacer(1, 4),
        Paragraph("<b>3ª Ave María (Por la Caridad y Unión Familiar):</b>", rubric),
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Dios te salve, María Santísima, Esposa de Dios Espíritu Santo, Virgen purísima después del parto; en tus manos encomendamos nuestra caridad, la unión de nuestra familia y el alma de la mami Olguita para que la salves. Llena eres de gracia...", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.</b>", text_todos),
    ]))
    story.append(Spacer(1, 10))

    # VII. LA SALVE
    story.append(KeepTogether([
        Paragraph("VII. LA SALVE A LA SANTÍSIMA VIRGEN MARÍA", sec_header),
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra. Dios te salve.", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> A Ti llamamos los desterrados hijos de Eva. A Ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos. Y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clemente, oh piadosa, oh dulce Virgen María! Ruega por nosotros, Santa Madre de Dios, para que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo. Amén.</b>", text_todos),
    ]))
    story.append(Spacer(1, 10))

    # VIII. LETANÍAS
    letanias_data = [
        ("Señor, ten piedad.", "Señor, ten piedad."),
        ("Cristo, ten piedad.", "Cristo, ten piedad."),
        ("Señor, ten piedad.", "Señor, ten piedad."),
        ("Cristo, óyenos.", "Cristo, óyenos."),
        ("Cristo, escúchanos.", "Cristo, escúchanos."),
        ("Dios, Padre celestial.", "Ten piedad de nosotros."),
        ("Dios Hijo, Redentor del mundo.", "Ten piedad de nosotros."),
        ("Dios Espíritu Santo.", "Ten piedad de nosotros."),
        ("Santísima Trinidad, un solo Dios.", "Ten piedad de nosotros."),
        ("Santa María.", "Ruega por ella."),
        ("Santa Madre de Dios.", "Ruega por ella."),
        ("Santa Virgen de las Vírgenes.", "Ruega por ella."),
        ("Madre de Cristo.", "Ruega por ella."),
        ("Madre de la Iglesia.", "Ruega por ella."),
        ("Madre de la divina gracia.", "Ruega por ella."),
        ("Madre purísima.", "Ruega por ella."),
        ("Madre castísima.", "Ruega por ella."),
        ("Madre de la esperanza.", "Ruega por ella."),
        ("Madre del Creador.", "Ruega por ella."),
        ("Madre del Salvador.", "Ruega por ella."),
        ("Virgen prudentísima.", "Ruega por ella."),
        ("Virgen digna de alabanza.", "Ruega por ella."),
        ("Virgen clemente.", "Ruega por ella."),
        ("Virgen fiel.", "Ruega por ella."),
        ("Espejo de justicia.", "Ruega por ella."),
        ("Trono de la sabiduría.", "Ruega por ella."),
        ("Causa de nuestra alegría.", "Ruega por ella."),
        ("Rosa mística.", "Ruega por ella."),
        ("Torre de David.", "Ruega por ella."),
        ("Torre de marfil.", "Ruega por ella."),
        ("Casa de oro.", "Ruega por ella."),
        ("Arca de la Alianza.", "Ruega por ella."),
        ("Puerta del cielo.", "Ruega por ella."),
        ("Estrella de la mañana.", "Ruega por ella."),
        ("Salud de los enfermos.", "Ruega por ella."),
        ("Refugio de los pecadores.", "Ruega por ella."),
        ("Consuelo de los afligidos.", "Ruega por ella."),
        ("Auxilio de los cristianos.", "Ruega por ella."),
        ("Reina de los Ángeles.", "Ruega por ella."),
        ("Reina de los Patriarcas.", "Ruega por ella."),
        ("Reina de los Profetas.", "Ruega por ella."),
        ("Reina de los Apóstoles.", "Ruega por ella."),
        ("Reina de los Mártires.", "Ruega por ella."),
        ("Reina de los Confesores.", "Ruega por ella."),
        ("Reina de las Vírgenes.", "Ruega por ella."),
        ("Reina de todos los Santos.", "Ruega por ella."),
        ("Reina concebida sin pecado original.", "Ruega por ella."),
        ("Reina asunta al Cielo.", "Ruega por ella."),
        ("Reina del Santísimo Rosario.", "Ruega por ella."),
        ("Reina de la familia.", "Ruega por ella."),
        ("Reina de la paz.", "Ruega por ella."),
    ]

    # Render letanias in clean 2-column table
    half = (len(letanias_data) + 1) // 2
    col1 = letanias_data[:half]
    col2 = letanias_data[half:]

    table_rows = []
    letania_style_guia = ParagraphStyle('LG', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=c_body_dark)
    letania_style_resp = ParagraphStyle('LR', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=c_todos_bg, alignment=2)

    for i in range(max(len(col1), len(col2))):
        c1_text = ""
        c1_resp = ""
        if i < len(col1):
            c1_text = col1[i][0]
            c1_resp = col1[i][1]
        
        c2_text = ""
        c2_resp = ""
        if i < len(col2):
            c2_text = col2[i][0]
            c2_resp = col2[i][1]

        table_rows.append([
            Paragraph(c1_text, letania_style_guia),
            Paragraph(c1_resp, letania_style_resp),
            Paragraph(" ", letania_style_guia),
            Paragraph(c2_text, letania_style_guia),
            Paragraph(c2_resp, letania_style_resp),
        ])

    t_letanias = Table(table_rows, colWidths=[185, 80, 10, 185, 80])
    t_letanias.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (2,0), (2,-1), 0),
        ('RIGHTPADDING', (2,0), (2,-1), 0),
    ]))

    story.append(Paragraph("VIII. LETANÍAS A LA SANTÍSIMA VIRGEN MARÍA", sec_header))
    story.append(t_letanias)
    story.append(Spacer(1, 6))
    story.append(KeepTogether([
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Cordero de Dios, que quitas el pecado del mundo.", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Perdónanos, Señor.</b>", text_todos),
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Cordero de Dios, que quitas el pecado del mundo.", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Escúchanos, Señor.</b>", text_todos),
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Cordero de Dios, que quitas el pecado del mundo.", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Ten misericordia de nosotros.</b>", text_todos),
    ]))
    story.append(Spacer(1, 10))

    # IX. ORACIÓN FAMILIAR
    oracion_familiar_p1 = "Amado Dios y Señor nuestro, en este quinto día en que nos reunimos con el corazón abierto por nuestra querida mami Olguita, queremos poner ante ti el alma de toda nuestra familia. Mirando hoy su partida, nos damos cuenta de lo frágil, corta y efímera que es la vida. Por eso, Señor, te pedimos perdón por cada momento en que permitimos que el orgullo, las peleas, los malentendidos y los resentimientos del pasado nos alejaran. Limpia nuestros corazones de cualquier amargura."
    oracion_familiar_p2 = "La mami Olguita ya descansa en paz, y el mejor homenaje que hoy podemos rendirle no son las lágrimas de tristeza, sino el regalo de nuestra unión. Que su partida sea el puente que nos vuelva a acercar. No esperemos a que otra persona parta para ponernos a recordar cosas del pasado o para valorar a quienes tenemos al lado. Ayúdanos a valorar el aquí y el ahora, a entender que la vida ocurre hoy y que mañana puede ser muy tarde para decir un \"te amo\" o dar un abrazo."
    oracion_familiar_p3 = "Sana las heridas de este hogar, deja el pasado atrás y haz que el amor que ella nos sembró florezca hoy en una unión inquebrantable. Por Jesucristo nuestro Señor."

    story.append(KeepTogether([
        Paragraph("IX. 🤍 ORACIÓN FAMILIAR: CONCIENCIA, PERDÓN Y UNIÓN", sec_header),
        Paragraph("<i>(Rezada por el Guía y meditada por toda la familia reunida)</i>", rubric),
        Paragraph(f"<b><font color='#851d2e'>[GUÍA]:</font></b> {oracion_familiar_p1}", text_guia),
        Paragraph(f"<b><font color='#851d2e'>[GUÍA]:</font></b> {oracion_familiar_p2}", text_guia),
        Paragraph(f"<b><font color='#851d2e'>[GUÍA]:</font></b> {oracion_familiar_p3}", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b> <i>(Todos se persignan)</i>", text_todos),
    ]))
    story.append(Spacer(1, 10))

    # X. DESPEDIDA Y BENDICIÓN FINAL
    story.append(KeepTogether([
        Paragraph("X. DESPEDIDA Y BENDICIÓN FINAL", sec_header),
        Paragraph("<b><font color='#851d2e'>[GUÍA]:</font></b> Dale, Señor, el descanso eterno.", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Y luzca para ella la luz perpetua. Que el alma de nuestra mami Olguita y las demás del Purgatorio, por la misericordia de Dios, descansen en paz. Amén.</b>", text_todos),
        Spacer(1, 4),
        Paragraph("<b><font color='#851d2e'>[GUÍA (Bendición)]:</font></b> El Señor nos bendiga, nos guarde de todo mal y nos lleve a la vida eterna. En el nombre del Padre, del Hijo y del Espíritu Santo.", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b>", text_todos),
        Spacer(1, 8),
        # Tarjeta Conmemorativa Final
        Table([
            [Paragraph("<font color='#5c4314'><b>MAMI OLGUITA</b></font><br/><font color='#4b5563' size='9.5'>Tu vida fue un regalo. • Tu amor fue una bendición. • Tu recuerdo será eterno.<br/><b>Descansa en paz en el Reino Celestial.</b><br/><i>Te queremos y te llevaremos siempre en nuestros corazones.</i></font>", ParagraphStyle('Homenaje', parent=styles['Normal'], alignment=1, leading=14))]
        ], colWidths=[540], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fef7ea")),
            ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#d4af37")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ])
    ]))

    doc.build(story, canvasmaker=NumberedCanvas)
    
    # Copy to root as well for easy access
    import shutil
    shutil.copyfile(pdf_filename, root_pdf)
    print(f"PDF generado exitosamente en: {pdf_filename} y {root_pdf}")

if __name__ == '__main__':
    build_pdf()

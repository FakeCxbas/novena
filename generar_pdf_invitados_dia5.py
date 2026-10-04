import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
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
        self.setFillColor(colors.HexColor("#1b396b"))
        # Top header line
        self.drawString(36, 756, "NOVENA DE MAMI OLGUITA • GUÍA DE RESPUESTAS PARA LA FAMILIA E INVITADOS • DÍA 5")
        self.setStrokeColor(colors.HexColor("#2563eb"))
        self.setLineWidth(0.8)
        self.line(36, 750, 576, 750)
        
        # Bottom footer line
        self.line(36, 40, 576, 40)
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#555555"))
        self.drawString(36, 28, "Guía para Invitados y Familia • Letra Grande con Respuestas en Negrita")
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(576, 28, page_text)
        self.restoreState()

def build_pdf_invitados():
    pdf_filename = "public/Novena_Mami_Olguita_Dia_5_Invitados.pdf"
    root_pdf = "Novena_Mami_Olguita_Dia_5_Invitados.pdf"
    
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

    c_blue_dark = colors.HexColor("#1e3a8a")
    c_gold_dark = colors.HexColor("#5c4314")
    c_guia_text = colors.HexColor("#4b5563")
    c_todos_text = colors.HexColor("#0f172a")

    title_main = ParagraphStyle(
        'TitleMain',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        alignment=1,
        textColor=c_blue_dark,
        spaceAfter=3
    )

    title_sub = ParagraphStyle(
        'TitleSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor("#851d2e"),
        spaceAfter=4
    )

    title_badge = ParagraphStyle(
        'TitleBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13,
        alignment=1,
        textColor=colors.HexColor("#4b5563"),
        spaceAfter=8
    )

    sec_header = ParagraphStyle(
        'SecHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=c_blue_dark,
        spaceBefore=7,
        spaceAfter=3
    )

    text_guia = ParagraphStyle(
        'TextGuia',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14.5,
        textColor=c_guia_text,
        spaceBefore=1,
        spaceAfter=2
    )

    # Letra extra destacada para los invitados
    text_todos = ParagraphStyle(
        'TextTodos',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16.5,
        textColor=c_todos_text,
        spaceBefore=2,
        spaceAfter=4
    )

    text_todos_box = ParagraphStyle(
        'TextTodosBox',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0a192f"),
        spaceBefore=1,
        spaceAfter=2
    )

    rubric = ParagraphStyle(
        'Rubric',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor("#6b7280"),
        spaceBefore=1,
        spaceAfter=2
    )

    story = []

    # ENCABEZADO
    story.append(Paragraph("NOVENA POR EL ETERNO DESCANSO DE MAMI OLGUITA", title_main))
    story.append(Paragraph("GUÍA DE RESPUESTAS PARA LA FAMILIA E INVITADOS • QUINTO DÍA", title_sub))
    story.append(Paragraph("Tus oraciones y respuestas compartidas están resaltadas en <b>[TODOS: NEGRITA]</b>", title_badge))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=6))

    # I. SEÑAL DE LA CRUZ
    story.append(Paragraph("I. SEÑAL DE LA SANTA CRUZ", sec_header))
    story.append(Paragraph("<i>Guía: Por la señal de la Santa Cruz, de nuestros enemigos...</i>", text_guia))
    story.append(Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b>", text_todos))
    story.append(Spacer(1, 4))

    # II. ACTO DE CONTRICIÓN
    story.append(KeepTogether([
        Paragraph("II. ACTO DE CONTRICIÓN", sec_header),
        Paragraph("<i>(Rezado a una sola voz por toda la familia)</i>", rubric),
        Table([
            [Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Tú quien eres, Bondad infinita, y porque te amo sobre todas las cosas, me pesa de todo corazón haberte ofendido. Propongo firmemente nunca más pecar, apartarme de todas las ocasiones de ofenderte, confesarme y cumplir la penitencia que me fuere impuesta. Ofrezco, Señor, mi vida, obras y trabajos en satisfacción de todos mis pecados; y confío en tu bondad y misericordia infinita que me los perdonarás por los méritos de tu preciosísima Sangre, pasión y muerte, y me darás gracia para enmendarme y perseverar en tu santo servicio hasta el fin de mi vida. Amén.</b>", text_todos_box)]
        ], colWidths=[530], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
            ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#93c5fd")),
            ('LINELEFT', (0,0), (0,-1), 3.5, colors.HexColor("#1e3a8a")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ])
    ]))
    story.append(Spacer(1, 5))

    # III. INTENCIÓN DEL DÍA
    story.append(KeepTogether([
        Paragraph("III. INTENCIÓN Y MEDITACIÓN INICIAL (DÍA 5)", sec_header),
        Paragraph("<i>El Guía ora por el alma de nuestra querida mami Olguita:</i>", rubric),
        Paragraph("«Señor Jesús, tú que eres la resurrección y la vida, nos reunimos en este quinto día para pedirte por el alma de nuestra mami Olguita... Dale la perseverancia de los justos y recíbela en tu descanso eterno.»", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b>", text_todos)
    ]))
    story.append(Spacer(1, 5))

    # IV. CREDO
    story.append(KeepTogether([
        Paragraph("IV. EL CREDO DE LOS APÓSTOLES", sec_header),
        Paragraph("<i>(Proclamamos juntos nuestra fe)</i>", rubric),
        Table([
            [Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Creo en Dios, Padre Todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo; nació de Santa María Virgen; padeció bajo el poder de Poncio Pilato; fue crucificado, muerto y sepultado; descendió a los infiernos; al tercer día resucitó de entre los muertos; subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la Santa Iglesia Católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.</b>", text_todos_box)]
        ], colWidths=[530], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
            ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#93c5fd")),
            ('LINELEFT', (0,0), (0,-1), 3.5, colors.HexColor("#1e3a8a")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ])
    ]))
    story.append(Spacer(1, 7))

    # V. RESPUESTAS TRADICIONALES DEL ROSARIO (PADRE NUESTRO, AVE MARÍA, GLORIA)
    story.append(KeepTogether([
        Paragraph("V. RESPUESTAS DE LA FAMILIA EN CADA MISTERIO", sec_header),
        Paragraph("<i>Durante cada uno de los 5 misterios, el Guía inicia y la familia responde:</i>", rubric),
        Table([
            [
                Paragraph("<b>1. Padre Nuestro:</b><br/><i>Guía: Padre nuestro, que estás en el cielo...</i><br/><b><font color='#1b396b'>[TODOS]:</font> Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación y líbranos del mal. Amén.</b>", text_todos_box)
            ],
            [
                Paragraph("<b>2. Diez Ave Marías:</b><br/><i>Guía: Dios te salve, María, llena eres de gracia...</i><br/><b><font color='#1b396b'>[TODOS]:</font> Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.</b>", text_todos_box)
            ],
            [
                Paragraph("<b>3. Gloria al Padre:</b><br/><i>Guía: Gloria al Padre, al Hijo y al Espíritu Santo...</i><br/><b><font color='#1b396b'>[TODOS]:</font> Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.</b>", text_todos_box)
            ]
        ], colWidths=[530], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('LINELEFT', (0,0), (0,-1), 3.5, colors.HexColor("#2563eb")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ])
    ]))
    story.append(Spacer(1, 7))

    # VI. JACULATORIA POR MAMI OLGUITA (DESTACADA PARA LOS INVITADOS)
    story.append(KeepTogether([
        Paragraph("VI. JACULATORIA POR MAMI OLGUITA (AL TERMINAR CADA MISTERIO)", sec_header),
        Paragraph("<i>Después del Gloria de cada uno de los 5 misterios, todos respondemos con fe:</i>", rubric),
        Table([
            [Paragraph("<i>Guía:</i> Si por tu preciosa sangre, Señor, la has redimido.", text_guia)],
            [Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Que la perdones, te pido, por tu pasión dolorosa.</b>", text_todos)],
            [Paragraph("<i>Guía:</i> Dale, Señor, el descanso eterno.", text_guia)],
            [Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Y luzca para ella la luz perpetua.</b>", text_todos)],
            [Paragraph("<i>Guía:</i> Que el alma de nuestra mami Olguita y las demás del Purgatorio, por la misericordia de Dios, descansen en paz.", text_guia)],
            [Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b>", text_todos)],
        ], colWidths=[530], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fef2f2")),
            ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#f87171")),
            ('LINELEFT', (0,0), (0,-1), 4, colors.HexColor("#851d2e")),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ])
    ]))
    story.append(Spacer(1, 8))

    # VII. LOS 5 MISTERIOS GLORIOSOS (GUÍA DE LECTURA)
    story.append(Paragraph("VII. LOS 5 MISTERIOS GLORIOSOS DE HOY DOMINGO", sec_header))
    misterios_invitados = [
        ("1º Misterio: La Resurrección del Hijo de Dios", "Ofrecemos este misterio con la firme esperanza de que nuestra mami Olguita también resucitará con Cristo y gozará de una vida nueva donde ya no existe la enfermedad ni el dolor."),
        ("2º Misterio: La Ascensión del Señor al Cielo", "Pedimos al Señor que abra las puertas del paraíso a mami Olguita, y que el lugar que Él le prometió y preparó esté listo para ella en la casa del Padre."),
        ("3º Misterio: La Venida del Espíritu Santo", "Rogamos para que ese mismo Espíritu Divino traiga consuelo, paz y resignación al corazón de toda la familia que hoy extraña y llora la partida de mami Olguita."),
        ("4º Misterio: La Asunción de la Virgen María", "Pedimos a la Virgen Santísima que reciba con amor de madre a mami Olguita, la tome de la mano y la guíe en su entrada al reino celestial."),
        ("5º Misterio: La Coronación de la Virgen María", "Suplicamos a la Reina de los Ángeles que interceda ante su Hijo para que mami Olguita sea coronada con la gloria eterna."),
    ]

    for m_titulo, m_med in misterios_invitados:
        story.append(KeepTogether([
            Paragraph(f"<b><font color='#851d2e'>• {m_titulo}</font></b>", ParagraphStyle('MTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=14, spaceBefore=4, spaceAfter=2)),
            Paragraph(f"<i>Meditación: «{m_med}»</i>", text_guia),
            Paragraph("<i>(Se reza: 1 Padre Nuestro, 10 Ave Marías, 1 Gloria y la Jaculatoria de mami Olguita de arriba)</i>", rubric),
            Spacer(1, 4)
        ]))

    story.append(Spacer(1, 6))

    # VIII. TRES AVEMARÍAS POR SU PUREZA
    story.append(KeepTogether([
        Paragraph("VIII. TRES AVEMARÍAS POR LA PUREZA DE MAMI OLGUITA", sec_header),
        Paragraph("<i>El Guía encomienda nuestra Fe, Esperanza y Caridad; todos respondemos:</i>", rubric),
        Paragraph("<b><font color='#1b396b'>[TODOS en cada una]:</font> Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.</b>", text_todos_box)
    ]))
    story.append(Spacer(1, 6))

    # IX. LA SALVE
    story.append(KeepTogether([
        Paragraph("IX. LA SALVE A LA SANTÍSIMA VIRGEN MARÍA", sec_header),
        Paragraph("<i>Guía: Dios te salve, Reina y Madre de misericordia...</i>", text_guia),
        Table([
            [Paragraph("<b><font color='#1b396b'>[TODOS]:</font> A Ti llamamos los desterrados hijos de Eva. A Ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos. Y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clemente, oh piadosa, oh dulce Virgen María! Ruega por nosotros, Santa Madre de Dios, para que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo. Amén.</b>", text_todos_box)]
        ], colWidths=[530], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
            ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#93c5fd")),
            ('LINELEFT', (0,0), (0,-1), 3.5, colors.HexColor("#1e3a8a")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ])
    ]))
    story.append(Spacer(1, 7))

    # X. LETANÍAS LAURETANAS (RESPUESTAS)
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

    half = (len(letanias_data) + 1) // 2
    col1 = letanias_data[:half]
    col2 = letanias_data[half:]

    table_rows = []
    letania_style_guia = ParagraphStyle('LG', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=c_guia_text)
    letania_style_resp = ParagraphStyle('LR', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=11.5, textColor=c_blue_dark, alignment=2)

    for i in range(max(len(col1), len(col2))):
        c1_text = col1[i][0] if i < len(col1) else ""
        c1_resp = col1[i][1] if i < len(col1) else ""
        c2_text = col2[i][0] if i < len(col2) else ""
        c2_resp = col2[i][1] if i < len(col2) else ""

        table_rows.append([
            Paragraph(c1_text, letania_style_guia),
            Paragraph(c1_resp, letania_style_resp),
            Paragraph(" ", letania_style_guia),
            Paragraph(c2_text, letania_style_guia),
            Paragraph(c2_resp, letania_style_resp),
        ])

    t_letanias = Table(table_rows, colWidths=[180, 85, 10, 180, 85])
    t_letanias.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (2,0), (2,-1), 0),
        ('RIGHTPADDING', (2,0), (2,-1), 0),
    ]))

    story.append(Paragraph("X. LETANÍAS LAURETANAS (RESPUESTAS)", sec_header))
    story.append(t_letanias)
    story.append(Spacer(1, 4))
    story.append(KeepTogether([
        Paragraph("<i>Guía: Cordero de Dios, que quitas el pecado del mundo...</i>", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Perdónanos, Señor.</b>", text_todos),
        Paragraph("<i>Guía: Cordero de Dios, que quitas el pecado del mundo...</i>", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Escúchanos, Señor.</b>", text_todos),
        Paragraph("<i>Guía: Cordero de Dios, que quitas el pecado del mundo...</i>", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Ten misericordia de nosotros.</b>", text_todos),
    ]))
    story.append(Spacer(1, 6))

    # XI. ORACIÓN FAMILIAR Y CIERRE
    story.append(KeepTogether([
        Paragraph("XI. 🤍 ORACIÓN FAMILIAR: CONCIENCIA, PERDÓN Y UNIÓN", sec_header),
        Paragraph("<i>El Guía proclama la oración de perdón y reconciliación familiar en memoria de la mami Olguita. Al terminar respondemos con el corazón y nos persignamos:</i>", rubric),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b> <i>(Todos hacen la señal de la cruz)</i>", text_todos),
        Spacer(1, 4),
        Paragraph("<b>DESPEDIDA FINAL:</b>", sec_header),
        Paragraph("<i>Guía: Dale, Señor, el descanso eterno...</i>", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Y luzca para ella la luz perpetua. Que el alma de nuestra mami Olguita y las demás del Purgatorio, por la misericordia de Dios, descansen en paz. Amén.</b>", text_todos),
        Paragraph("<i>Guía: El Señor nos bendiga, nos guarde de todo mal y nos lleve a la vida eterna...</i>", text_guia),
        Paragraph("<b><font color='#1b396b'>[TODOS]:</font> Amén.</b>", text_todos),
        Spacer(1, 6),
        Table([
            [Paragraph("<font color='#1e3a8a'><b>MAMI OLGUITA</b></font><br/><font color='#475569' size='9.5'>Tu vida fue un regalo. • Tu amor fue una bendición. • Tu recuerdo será eterno.<br/><b>Descansa en paz en el Reino de los Cielos.</b></font>", ParagraphStyle('Homenaje', parent=styles['Normal'], alignment=1, leading=13))]
        ], colWidths=[530], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
            ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#94a3b8")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ])
    ]))

    doc.build(story, canvasmaker=NumberedCanvas)
    
    import shutil
    shutil.copyfile(pdf_filename, root_pdf)
    print(f"PDF para Invitados generado exitosamente en: {pdf_filename} y {root_pdf}")

if __name__ == '__main__':
    build_pdf_invitados()

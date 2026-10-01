# 🕊️ Novena por el Eterno Descanso de Mami Olguita

Aplicación web interactiva, moderna y sincronizada en tiempo real, diseñada especialmente para familias que rezan unidas a la distancia (incluyendo zonas rurales o fincas con baja señal en Colombia).

---

## 📋 ¿Cómo se solucionó el desorden del texto original?

En el documento anterior, rezar la novena requería saltar de una página a otra (la Oración inicial estaba en la pág. 2, las reflexiones en las págs. 4-22, el Santo Rosario en la pág. 23, las Letanías en la pág. 27 y las oraciones finales en las págs. 28-29).

En esta aplicación, **cada día tiene un flujo continuo de principio a fin**:

1. **Apertura**: Señal de la Santa Cruz.
2. **Oración Inicial de Todos los Días**: Integrada directamente.
3. **Cita Bíblica y Reflexión del Día**: Específica del día seleccionado (Día 1 al 9).
4. **Oración del Día**: Con respuesta comunitaria.
5. **El Santo Rosario Completo**:
   - Oración inicial y Credo.
   - Cuentas iniciales (Padre Nuestro, 3 Ave Marías por la fe, esperanza y caridad, Gloria).
   - **Los 5 Misterios del Día**: Detecta automáticamente si hoy tocan Gozosos, Dolorosos, Luminosos o Gloriosos, con contador interactivo de 10 Ave Marías y Jaculatoria por Mami Olguita.
   - La Salve.
   - Las Letanías completas de la Santísima Virgen María (con respuestas claras).
6. **Oración Final por Mami Olguita**.
7. **Oración Final de la Familia**.
8. **Mensaje para la Familia** (conmovedor y específico del día).
9. **Despedida y Bendición Final**.
10. **Placa Conmemorativa** con vela virtual encendida.

---

## 🚀 ¿Cómo usarla y transmitirla a la familia?

### 1. Iniciar en tu computadora:
```bash
npm start
```
La aplicación abrirá en: `http://localhost:3005`

### 2. Compartir el enlace con la familia:
Para que los familiares en cualquier lugar (o finca) puedan entrar desde su celular:

- **Opción A (Rápida y gratuita con Cloudflare Tunnel o Localtunnel)**:
  ```bash
  npx localtunnel --port 3005
  # O con cloudflared:
  # npx cloudflared tunnel --url http://localhost:3005
  ```
  Te dará un enlace público seguro (ejemplo: `https://novena-olguita.loca.lt`) que solo envías por el grupo de WhatsApp de la familia.

- **Opción B (Subir gratis a Render o Railway)**:
  Subes este repositorio a GitHub y lo conectas a [Render](https://render.com) como *Web Service* gratuito. Tendrás un enlace permanente para los 9 días.

---

## 📹 Videollamada Familiar Integrada (WebRTC)

No necesitas usar WhatsApp ni Zoom por separado. La videollamada está **integrada dentro de la misma aplicación**:

1. Toca el botón verde **"📞 Entrar a la llamada"**.
2. Escribe tu nombre (ej. `Carlos (Nieto)` o `Tía Martha`).
3. Activa tu cámara y micrófono.
4. **Para la familia en la finca (conexión lenta)**:
   - Pueden marcar la casilla **"Modo Finca / Solo Audio"**.
   - Esto apaga el video entrante y saliente, reduciendo el consumo en un 90%, garantizando que sus voces se escuchen nítidas y en tiempo real sin cortes ni buffering.

---

## 👑 Modo Guía / Anfitrión (Sincronización en Vivo)

1. Entra a la web y toca el botón de la corona (`👑`) en la barra superior.
2. Ingresa el PIN: `1234` (puedes cambiarlo en `server.js`).
3. A partir de ese momento, mientras todos se ven y se escuchan por la videollamada, **tú pasas las oraciones y a todos se les sincroniza la lectura en pantalla automáticamente**.
4. ¡Cero problemas de los 15 FPS de WhatsApp! Las lecturas son texto 100% nítido y la videollamada fluye en paralelo.


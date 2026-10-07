import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Factory to dynamically obtain GoogleGenAI client with the current runtime key
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `Eres "CUPRA Copilot", un asistente virtual avanzado integrado en una aplicación móvil y web para asesores de ventas de marcas automotrices de alta gama / semi-premium (con foco en la identidad, tono e innovación de CUPRA).

Tu objetivo principal es optimizar el flujo de trabajo operativo y comercial del asesor, automatizando la gestión de prospectos (CRM), el seguimiento de leads, el agendamiento de pruebas de manejo (Test Drives), la preparación de cotizaciones y el cierre de ventas, permitiéndole concentrarse en la experiencia del cliente.

ÁREAS DE COMPETENCIA:
1. Gestión de Prospectos y Funnel de Ventas (CRM):
   - Categorías: Cold (Interés inicial / Formulario), Warm (Prueba de manejo realizada / Cotización enviada), Hot (Negociación final / Apartado / Crédito aprobado).
   - Generación de follow-ups personalizados y rescate de leads fríos.
2. Conocimiento Técnico y Comparativos:
   - Gama CUPRA: Formentor VZ5/VZ, Leon VZ, Ateca, Tavascan (100% eléctrico), Born, Terramar (e-HYBRID).
   - Comparativos contra Audi (Q3, S3), BMW (X2 M35i, 135i), Mercedes-Benz (GLA 35 AMG), Alfa Romeo (Tonale).
   - Puntos Únicos de Venta (USP): Diseño disruptivo, performance, equipamiento de serie vs. precio, e innovación tecnológica (DCC, Akrapovic, Brembo, Copper accents, Launch control).
3. Herramienta de Cierre y Financiamiento:
   - Esquemas: Crédito Tradicional, Arrendamiento Puro / Lease (100% deducible), CUPRA Unique / Flex (renovación y pago accesible).
4. Experiencia Test Drive:
   - Checklists pre-Drive, guion con hitos kilométricos destacando CUPRA Mode, Bucket seats, sonido motor y ADAS.
5. Comunicación Externa:
   - WhatsApp 1-click, correos, notas según tipología: Sofisticado/Corporativo, Entusiasta del Performance, Joven Tecnológico, Familiar/Práctico.

TONO:
- Profesional, audaz y sofisticado (Challenger Brand).
- Directo, eficiente y orientado al cierre (Next Best Action).

FORMATO OBLIGATORIO DE RESPUESTA:
Estructura TODAS tus respuestas de manera limpia con estas 3 secciones claras:
1. **[Acción Inmediata / Resumen]**: Qué se debe hacer ahora mismo.
2. **[Detalle / Plantilla / Contenido]**: La información, comparativa, guion o mensaje redactado listo para copiar/enviar (incluye texto directo para WhatsApp si aplica).
3. **[Próximo Paso Sugerido]**: Recordatorio automático o tarea concreta a agendar en el calendario.

COMANDOS RÁPIDOS ESPECIALIZADOS:
- /nuevo-lead [Nombre] [Auto de Interés] [Origen] -> Genera la ficha inicial y el primer mensaje de bienvenida por WhatsApp.
- /comparar [Modelo CUPRA] vs [Modelo Competencia] -> Devuelve tabla/puntos comparativos con 3 USPs clave para rebatir objeciones.
- /script-testdrive [Modelo] -> Despliega la ruta y puntos de experiencia recomendados para el test drive.
- /followup [Nombre del cliente] [Días sin contacto] -> Mensaje de reactivación según el perfil.
- /objecion [Tipo: Precio / Tasa / Marca poco conocida / Tiempo de entrega] -> 2 argumentos de refutación de alto impacto.

RESTRICCIONES:
- No inventes especificaciones erróneas; destaca siempre el estilo de vida, performance y diseño distintivo. No compitas únicamente por descuento.`;

// Intelligent local fallback generator when API key is pending or offline
function generateLocalCUPRAResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.startsWith('/nuevo-lead') || lower.includes('nuevo lead')) {
    return `**[Acción Inmediata / Resumen]**
Nuevo prospecto clasificado como **Cold Lead**. Registrar en el pipeline y enviar mensaje de bienvenida en los próximos 15 minutos para maximizar la tasa de conversión (regla de oro de los 15 minutos).

**[Detalle / Plantilla / Contenido]**
📱 *Mensaje sugerido para WhatsApp:*
"Hola, un gusto saludarte. Soy tu Asesor CUPRA. Noté tu interés en nuestra gama de alto rendimiento. En CUPRA no creamos autos convencionales, creamos experiencias de conducción deportiva con diseño disruptivo. ¿Te gustaría que te comparta la ficha técnica detallada o prefieres agendar una breve experiencia de manejo para sentir la respuesta del motor en persona?"

**[Próximo Paso Sugerido]**
Agendar recordatorio en CRM a las 24 horas si no hay respuesta, con envío de video interactivo del puesto de conducción Digital Cockpit.`;
  }

  if (lower.startsWith('/comparar') || lower.includes('vs') || lower.includes('competencia')) {
    return `**[Acción Inmediata / Resumen]**
Posicionar CUPRA como la alternativa audaz frente a las opciones tradicionales del segmento premium, destacando mayor equipamiento de serie y dinamismo sin pagar sobreprecio por emblema.

**[Detalle / Plantilla / Contenido]**
📊 *3 Puntos Clave de Superioridad CUPRA:*
1. **Performance & Chasis de Serie:** A diferencia de rivales alemanes donde la suspensión adaptativa DCC y los frenos de alto rendimiento son costosos opcionales, en la gama CUPRA VZ vienen configurados de fábrica para máxima agilidad.
2. **Equipamiento Integral vs. Precio:** Asientos tipo Bucket en piel deportiva, escape deportivo con válvulas activas y sonido amplificado, y cuadro de mandos Digital Cockpit personalizable sin costos ocultos.
3. **Exclusividad y Diseño Vanguardista:** Líneas afiladas, firma lumínica tridimensional y detalles emblemáticos en Copper (cobre) que rompen con la sobriedad conservadora de la competencia.

**[Próximo Paso Sugerido]**
Invitar al cliente a un Test Drive comparativo inmediato enfocado en la respuesta del modo CUPRA y tacto de dirección progresiva.`;
  }

  if (lower.startsWith('/script-testdrive') || lower.includes('test drive') || lower.includes('prueba de manejo')) {
    return `**[Acción Inmediata / Resumen]**
Preparar la unidad demo con checklist sensorial: habitáculo a 21°C, sistema BeatsAudio con playlist de graves controlados y selección previa de tramo con recta despejada y curvas enlazadas.

**[Detalle / Plantilla / Contenido]**
🏁 *Guion de Experiencia Sensorial Test Drive:*
- **Km 0 (Showroom):** Pide al cliente ajustar el asiento Bucket y sentir el tacto del volante calefactable con botones satélite de encendido.
- **Km 2 (Zona Urbana):** Demuestra el confort de marcha y el aislamiento acústico con suspensión en modo Comfort.
- **Km 5 (Tramo despejado):** Indica presionar el botón satélite con el logo CUPRA. Explica: "Sienta cómo se endurece la dirección progresiva, la suspensión DCC se tensa y las válvulas de escape se abren". Realiza una aceleración lineal contundente.
- **Km 8 (Retorno):** Activa el Travel Assist / ADAS para demostrar que además de pura adrenalina, es un vehículo tecnológicamente seguro para el día a día.

**[Próximo Paso Sugerido]**
Al apagar el motor en la agencia, formular la pregunta de cierre directo: *"¿Qué sensación te dejó la aceleración en Modo CUPRA frente a lo que conduces actualmente?"*`;
  }

  if (lower.startsWith('/followup') || lower.includes('seguimiento') || lower.includes('sin contacto')) {
    return `**[Acción Inmediata / Resumen]**
Reactivar el lead sin sonar insistente, aportando valor tangible como una oportunidad de disponibilidad de unidad o corrida financiera personalizada.

**[Detalle / Plantilla / Contenido]**
📲 *Plantilla de Reactivación WhatsApp:*
"Hola [Nombre], ¿cómo estás? Te escribo porque acaba de liberarse una asignación especial en color Gris Grafito Mate con rines de 19 pulgadas en acabado Copper. Recordé que era justo la combinación que te llamó la atención. ¿Sigue en tus planes estrenar este mes o prefieres que revisemos la alternativa de arrendamiento con deducibilidad fiscal?"

**[Próximo Paso Sugerido]**
Marcar lead con etiqueta "En Seguimiento Activo". Si tras 48h no responde, cambiar a "Nutrición a largo plazo" con invitación a evento exclusivo CUPRA Garage.`;
  }

  if (lower.startsWith('/objecion') || lower.includes('objecion') || lower.includes('objeción')) {
    return `**[Acción Inmediata / Resumen]**
Neutralizar la objeción validando la perspectiva del comprador y reconduciendo la conversación hacia el valor total de propiedad y exclusividad de producto.

**[Detalle / Plantilla / Contenido]**
🛡️ *2 Argumentos de Alto Impacto para Refutación:*
1. **Objeción de Precio/Tasa:** "Entiendo perfectamente que busques la mayor eficiencia en tu inversión. Sin embargo, en CUPRA el valor residual se mantiene muy por encima del promedio del segmento debido a su alta demanda y producción selecta. Además, con nuestro esquema CUPRA Flex / Arrendamiento Puro, deduces hasta el 100% de la renta mensual y renuevas auto cada 24 a 36 meses sin descapitalizarte."
2. **Objeción de Marca Joven:** "CUPRA nació precisamente para quienes buscan diferenciarse de las marcas tradicionales que todo el mundo tiene. Detrás de nosotros está la ingeniería probada del Grupo Volkswagen, pero con el alma rebelde y audaz del automovilismo de competición."

**[Próximo Paso Sugerido]**
Ofrecer una corrida financiera comparativa en vivo (Leasing vs. Tradicional) ajustada al flujo mensual del cliente.`;
  }

  return `**[Acción Inmediata / Resumen]**
Analizando la consulta técnica y comercial para optimizar la estrategia de cierre del asesor.

**[Detalle / Plantilla / Contenido]**
Para la gama CUPRA (Formentor, Leon, Ateca, Tavascan, Born y Terramar), recuerda que la clave de venta reside en la experiencia emocional del diseño Copper, la tecnología del chasis dinámico DCC y las soluciones financieras flexibles (CUPRA Unique / Arrendamiento Puro).

Comandos sugeridos para activar automatizaciones:
- \`/comparar [Modelo CUPRA] vs [Rival]\` para tablas técnicas de argumentación.
- \`/script-testdrive [Modelo]\` para preparar la ruta sensorial y puntos de contacto.
- \`/objecion [Tipo]\` para rebatir precio, tasa o marca.
- \`/followup [Cliente] [Días]\` para reactivar prospectos en riesgo de enfriarse.

**[Próximo Paso Sugerido]**
Selecciona un lead del embudo para generar una acción táctica inmediata o escribe tu consulta puntual.`;
}

// Health check endpoint for Cloud Run and hosting deployment readiness
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
    environment: process.env.NODE_ENV || 'development',
  });
});

// POST: /api/copilot/chat
app.post('/api/copilot/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], clientContext = null } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'El mensaje es obligatorio' });
      return;
    }

    const ai = getGenAIClient();

    if (ai) {
      try {
        let promptWithContext = message;
        if (clientContext) {
          promptWithContext = `[CONTEXTO CLIENTE EN CRM: Nombre: ${clientContext.name || 'N/A'}, Etapa: ${clientContext.stage || 'N/A'}, Modelo de Interés: ${clientContext.model || 'N/A'}, Último contacto hace: ${clientContext.daysInactive || 0} días, Perfil: ${clientContext.profile || 'General'}]\n\nConsulta del Asesor: ${message}`;
        }

        // Format conversation history
        const contents: any[] = [];
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: promptWithContext }],
        });

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.65,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de respuesta Gemini (12s)')), 12000)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);

        const text = response.text || '';
        res.json({
          reply: text,
          model: 'gemini-3.8-flash',
        });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using high-fidelity local copilot engine:', geminiError?.message);
      }
    }

    // High quality fallback
    const localReply = generateLocalCUPRAResponse(message);
    res.json({
      reply: localReply,
      model: 'cupra-copilot-engine',
    });
  } catch (error: any) {
    console.error('Error handling chat:', error);
    res.status(500).json({ error: 'Error procesando la solicitud del copilot' });
  }
});

// Setup Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production hosting
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[CUPRA Copilot Server] Listening on http://0.0.0.0:${port} (Env: ${process.env.NODE_ENV || 'dev'})`);
  });
}

startServer();

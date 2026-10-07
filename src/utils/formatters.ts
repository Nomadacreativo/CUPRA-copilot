export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createWhatsAppUrl(phone: string, text: string): string {
  // Clean phone number (keep digits only)
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encoded = encodeURIComponent(text);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Robust clipboard copy supporting browser permissions, iframe sandboxes, and mobile devices
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to DOM fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Clipboard copy error:', err);
    return false;
  }
}

/**
 * Resilient parser that extracts the 3 required sections from CUPRA Copilot answers
 */
export function parseCopilotResponse(text: string) {
  let immediateAction = '';
  let detailContent = '';
  let suggestedNextStep = '';

  // Match Action section with flexible markdown headings (#, ##, ###, **), numbers, and brackets
  const actionRegex = /(?:(?:#+|\*\*|\d+\.?|\s)*\[(?:Acción Inmediata|Accion Inmediata)\s*\/\s*Resumen\](?:\*\*|#*)?)([\s\S]*?)(?=(?:#+|\*\*|\d+\.?|\s)*\[Detalle|(?:#+|\*\*|\d+\.?|\s)*\[Próximo Paso|$)/i;
  // Match Detail section
  const detailRegex = /(?:(?:#+|\*\*|\d+\.?|\s)*\[Detalle\s*\/\s*Plantilla\s*\/\s*Contenido\](?:\*\*|#*)?)([\s\S]*?)(?=(?:#+|\*\*|\d+\.?|\s)*\[Próximo Paso|(?:#+|\*\*|\d+\.?|\s)*\[Proximo Paso|$)/i;
  // Match Next Step section
  const nextStepRegex = /(?:(?:#+|\*\*|\d+\.?|\s)*\[(?:Próximo Paso|Proximo Paso)\s*Sugerido\](?:\*\*|#*)?)([\s\S]*?)$/i;

  const actionMatch = text.match(actionRegex);
  const detailMatch = text.match(detailRegex);
  const nextStepMatch = text.match(nextStepRegex);

  if (actionMatch && detailMatch && nextStepMatch) {
    immediateAction = actionMatch[1].trim();
    detailContent = detailMatch[1].trim();
    suggestedNextStep = nextStepMatch[1].trim();
  } else {
    // If strict regex didn't catch all three, attempt split by markdown headings/sections
    const parts = text.split(/\n\n(?=(?:#+|\*\*|\d+\.?|\s)*\[)/);
    if (parts.length >= 3) {
      immediateAction = parts[0].replace(/^.*\[(?:Acción Inmediata|Accion Inmediata)\s*\/\s*Resumen\](?:\*\*|#*)?\s*/i, '').trim();
      detailContent = parts[1].replace(/^.*\[Detalle\s*\/\s*Plantilla\s*\/\s*Contenido\](?:\*\*|#*)?\s*/i, '').trim();
      suggestedNextStep = parts[2].replace(/^.*\[(?:Próximo Paso|Proximo Paso)\s*Sugerido\](?:\*\*|#*)?\s*/i, '').trim();
    }
  }

  // Extract quoted or blockquoted WhatsApp message if present
  let whatsappMessage: string | undefined;
  const quoteMatch = detailContent.match(/["“]([^"”]{25,})["”]/) 
    || detailContent.match(/>\s*\*?["“]?([^*"”\n]{25,})/);
    
  if (quoteMatch) {
    whatsappMessage = quoteMatch[1].trim();
  }

  return {
    immediateAction,
    detailContent,
    suggestedNextStep,
    whatsappMessage,
    isStructured: !!(immediateAction && detailContent && suggestedNextStep),
  };
}

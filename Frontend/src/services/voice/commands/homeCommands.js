/**
 * homeCommands.js
 * Comandos específicos para la página Home
 * - Rappi, WhatsApp, Quiénes somos, Ubicación, Términos, Políticas
 */

import { clickActions, scrollActions, modalActions } from '../voiceActions.js';

/**
 * Abrir enlace de Rappi
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const openRappi = async (ttsService) => {
  try {
    console.log('[Home Commands] Opening Rappi');

    // Buscar enlace de Rappi
    const rappiLink = document.querySelector(
      'a[href*="rappi.com"], a[href*="rappi"], a[data-rappi], a[aria-label*="rappi" i]'
    ) || Array.from(document.querySelectorAll('a')).find(link =>
      link.textContent.toLowerCase().includes('rappi')
    );

    if (!rappiLink) {
      await ttsService?.speak('No encontré el enlace de Rappi');
      return { success: false, error: 'Rappi link not found' };
    }

    // Abrir en nueva ventana
    const href = rappiLink.href;
    window.open(href, '_blank', 'noopener,noreferrer');

    await ttsService?.speak('Abriendo Rappi en una nueva ventana');
    return { success: true, action: 'open_rappi', url: href };

  } catch (error) {
    console.error('[Home Commands] Error opening Rappi:', error);
    await ttsService?.speak('No pude abrir Rappi');
    return { success: false, error: error.message };
  }
};

/**
 * Abrir WhatsApp para contacto
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const openWhatsapp = async (ttsService) => {
  try {
    console.log('[Home Commands] Opening WhatsApp');

    // Buscar enlace de WhatsApp
    const whatsappLink = document.querySelector(
      'a[href*="wa.me"], a[href*="whatsapp"], a[href*="api.whatsapp"], a[data-whatsapp], a[aria-label*="whatsapp" i]'
    ) || Array.from(document.querySelectorAll('a')).find(link =>
      link.textContent.toLowerCase().includes('whatsapp')
    );

    if (!whatsappLink) {
      await ttsService?.speak('No encontré el enlace de WhatsApp');
      return { success: false, error: 'WhatsApp link not found' };
    }

    // Abrir WhatsApp
    const href = whatsappLink.href;
    window.open(href, '_blank', 'noopener,noreferrer');

    await ttsService?.speak('Abriendo WhatsApp');
    return { success: true, action: 'open_whatsapp', url: href };

  } catch (error) {
    console.error('[Home Commands] Error opening WhatsApp:', error);
    await ttsService?.speak('No pude abrir WhatsApp');
    return { success: false, error: error.message };
  }
};

/**
 * Ir a sección "Quiénes Somos" / "Sobre Nosotros"
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const goToAboutUs = async (ttsService) => {
  try {
    console.log('[Home Commands] Going to About Us section');

    // Intentar buscar modal primero
    const aboutModal = document.querySelector(
      '[id*="about" i], [id*="quienes" i], [id*="nosotros" i], [data-modal="about"]'
    );

    if (aboutModal) {
      // Abrir modal
      const success = modalActions.openModal(aboutModal.id || 'about');
      if (success) {
        await ttsService?.speak('Abriendo información sobre nosotros');
        return { success: true, action: 'open_about_modal' };
      }
    }

    // Buscar botón que abra el modal
    const aboutButton = clickActions.clickByAccessibleName('quiénes somos') ||
                       clickActions.clickByAccessibleName('sobre nosotros') ||
                       clickActions.clickByAccessibleName('acerca de') ||
                       clickActions.clickByAccessibleName('nosotros');

    if (aboutButton) {
      await ttsService?.speak('Abriendo quiénes somos');
      return { success: true, action: 'open_about_button' };
    }

    // Intentar scroll a sección
    const aboutSection = document.querySelector(
      '#quienes-somos, #sobre-nosotros, #about-us, #nosotros, section[data-section="about"]'
    ) || Array.from(document.querySelectorAll('section, div[id]')).find(el => {
      const text = el.textContent.toLowerCase();
      const id = el.id.toLowerCase();
      return id.includes('about') || id.includes('quienes') || id.includes('nosotros') ||
             text.includes('quiénes somos') || text.includes('sobre nosotros');
    });

    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      await ttsService?.speak('Ir a quiénes somos');
      return { success: true, action: 'scroll_to_about' };
    }

    await ttsService?.speak('No encontré la sección de quiénes somos');
    return { success: false, error: 'About section not found' };

  } catch (error) {
    console.error('[Home Commands] Error going to about us:', error);
    await ttsService?.speak('No pude ir a quiénes somos');
    return { success: false, error: error.message };
  }
};

/**
 * Ir a sección de ubicación / Abrir Google Maps
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const goToLocation = async (ttsService) => {
  try {
    console.log('[Home Commands] Going to location');

    // Buscar enlace de Google Maps
    const mapsLink = document.querySelector(
      'a[href*="maps.google"], a[href*="goo.gl/maps"], a[href*="maps.app.goo.gl"], a[data-maps], a[aria-label*="ubicación" i], a[aria-label*="location" i]'
    ) || Array.from(document.querySelectorAll('a')).find(link => {
      const text = link.textContent.toLowerCase();
      const href = link.href.toLowerCase();
      return href.includes('maps') || text.includes('ubicación') || text.includes('mapa') || text.includes('cómo llegar');
    });

    if (mapsLink) {
      // Abrir Google Maps en nueva ventana
      window.open(mapsLink.href, '_blank', 'noopener,noreferrer');
      await ttsService?.speak('Abriendo ubicación en Google Maps');
      return { success: true, action: 'open_maps', url: mapsLink.href };
    }

    // Buscar botón que abra modal de ubicación
    const locationButton = clickActions.clickByAccessibleName('ubicación') ||
                          clickActions.clickByAccessibleName('dónde estamos') ||
                          clickActions.clickByAccessibleName('cómo llegar') ||
                          clickActions.clickByAccessibleName('mapa');

    if (locationButton) {
      await ttsService?.speak('Mostrando ubicación');
      return { success: true, action: 'open_location_modal' };
    }

    // Intentar scroll a sección de ubicación
    const locationSection = document.querySelector(
      '#ubicacion, #location, #mapa, #map, section[data-section="location"]'
    ) || Array.from(document.querySelectorAll('section, div[id]')).find(el => {
      const text = el.textContent.toLowerCase();
      const id = el.id.toLowerCase();
      return id.includes('ubicacion') || id.includes('location') || id.includes('mapa') ||
             text.includes('ubicación') || text.includes('dónde estamos') || text.includes('cómo llegar');
    });

    if (locationSection) {
      locationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      await ttsService?.speak('Ir a ubicación');
      return { success: true, action: 'scroll_to_location' };
    }

    // Buscar iframe de Google Maps y hacer scroll
    const mapsIframe = document.querySelector('iframe[src*="google.com/maps"]');
    if (mapsIframe) {
      mapsIframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await ttsService?.speak('Mostrando mapa');
      return { success: true, action: 'scroll_to_map' };
    }

    await ttsService?.speak('No encontré la ubicación');
    return { success: false, error: 'Location not found' };

  } catch (error) {
    console.error('[Home Commands] Error going to location:', error);
    await ttsService?.speak('No pude mostrar la ubicación');
    return { success: false, error: error.message };
  }
};

/**
 * Abrir términos y condiciones
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const openTerms = async (ttsService) => {
  try {
    console.log('[Home Commands] Opening terms and conditions');

    // Buscar modal de términos
    const termsModal = document.querySelector(
      '[id*="terms" i], [id*="terminos" i], [id*="condiciones" i], [data-modal="terms"]'
    );

    if (termsModal) {
      const success = modalActions.openModal(termsModal.id || 'terms');
      if (success) {
        await ttsService?.speak('Abriendo términos y condiciones');
        return { success: true, action: 'open_terms_modal' };
      }
    }

    // Buscar enlace o botón
    const termsLink = clickActions.clickByAccessibleName('términos y condiciones') ||
                     clickActions.clickByAccessibleName('términos') ||
                     clickActions.clickByAccessibleName('condiciones de uso') ||
                     document.querySelector('a[href*="terms"], a[href*="terminos"]');

    if (termsLink) {
      if (termsLink.tagName === 'A') {
        // Si es enlace, abrir en nueva ventana
        window.open(termsLink.href, '_blank', 'noopener,noreferrer');
      } else {
        // Si es botón, hacer click
        clickActions.simulateReactClick(termsLink);
      }
      await ttsService?.speak('Abriendo términos y condiciones');
      return { success: true, action: 'open_terms' };
    }

    await ttsService?.speak('No encontré los términos y condiciones');
    return { success: false, error: 'Terms not found' };

  } catch (error) {
    console.error('[Home Commands] Error opening terms:', error);
    await ttsService?.speak('No pude abrir los términos');
    return { success: false, error: error.message };
  }
};

/**
 * Abrir políticas de privacidad
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const openPrivacy = async (ttsService) => {
  try {
    console.log('[Home Commands] Opening privacy policy');

    // Buscar modal de privacidad
    const privacyModal = document.querySelector(
      '[id*="privacy" i], [id*="privacidad" i], [data-modal="privacy"]'
    );

    if (privacyModal) {
      const success = modalActions.openModal(privacyModal.id || 'privacy');
      if (success) {
        await ttsService?.speak('Abriendo políticas de privacidad');
        return { success: true, action: 'open_privacy_modal' };
      }
    }

    // Buscar enlace o botón
    const privacyLink = clickActions.clickByAccessibleName('política de privacidad') ||
                       clickActions.clickByAccessibleName('políticas de privacidad') ||
                       clickActions.clickByAccessibleName('privacidad') ||
                       clickActions.clickByAccessibleName('aviso de privacidad') ||
                       document.querySelector('a[href*="privacy"], a[href*="privacidad"]');

    if (privacyLink) {
      if (privacyLink.tagName === 'A') {
        // Si es enlace, abrir en nueva ventana
        window.open(privacyLink.href, '_blank', 'noopener,noreferrer');
      } else {
        // Si es botón, hacer click
        clickActions.simulateReactClick(privacyLink);
      }
      await ttsService?.speak('Abriendo políticas de privacidad');
      return { success: true, action: 'open_privacy' };
    }

    await ttsService?.speak('No encontré las políticas de privacidad');
    return { success: false, error: 'Privacy policy not found' };

  } catch (error) {
    console.error('[Home Commands] Error opening privacy:', error);
    await ttsService?.speak('No pude abrir las políticas');
    return { success: false, error: error.message };
  }
};

/**
 * Leer información de contacto
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readContactInfo = async (ttsService) => {
  try {
    console.log('[Home Commands] Reading contact info');

    // Buscar sección de contacto
    const contactSection = document.querySelector(
      '#contacto, #contact, section[data-section="contact"]'
    ) || Array.from(document.querySelectorAll('section, div[id]')).find(el => {
      const text = el.textContent.toLowerCase();
      const id = el.id.toLowerCase();
      return id.includes('contacto') || id.includes('contact') || text.includes('contáctanos');
    });

    if (!contactSection) {
      await ttsService?.speak('No encontré información de contacto');
      return { success: false, error: 'Contact section not found' };
    }

    // Extraer información
    const phones = Array.from(contactSection.querySelectorAll('a[href^="tel:"]')).map(a => a.textContent.trim());
    const emails = Array.from(contactSection.querySelectorAll('a[href^="mailto:"]')).map(a => a.textContent.trim());
    const address = contactSection.querySelector('[itemprop="address"], .address, .direccion')?.textContent.trim();

    // Leer información
    await ttsService?.speak('Información de contacto');

    if (phones.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await ttsService?.speak(`Teléfonos: ${phones.join(', ')}`);
    }

    if (emails.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await ttsService?.speak(`Correos: ${emails.join(', ')}`);
    }

    if (address) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await ttsService?.speak(`Dirección: ${address}`);
    }

    return {
      success: true,
      action: 'read_contact',
      contact: { phones, emails, address }
    };

  } catch (error) {
    console.error('[Home Commands] Error reading contact info:', error);
    await ttsService?.speak('No pude leer la información de contacto');
    return { success: false, error: error.message };
  }
};

export default {
  openRappi,
  openWhatsapp,
  goToAboutUs,
  goToLocation,
  openTerms,
  openPrivacy,
  readContactInfo
};

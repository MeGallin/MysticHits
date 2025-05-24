/**
 * Device detection utility for identifying device types from user agent
 */

export type DeviceType =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'smart-tv'
  | 'speaker'
  | 'unknown';

/**
 * Detect device type from user agent string
 * @param userAgent - Browser user agent string
 * @returns Device type enum value
 */
export const detectDeviceType = (userAgent?: string): DeviceType => {
  const ua = userAgent || navigator.userAgent;

  if (!ua) {
    return 'unknown';
  }

  const uaLower = ua.toLowerCase();

  // Smart TV detection
  if (
    uaLower.includes('smart-tv') ||
    uaLower.includes('smarttv') ||
    uaLower.includes('googletv') ||
    uaLower.includes('appletv') ||
    uaLower.includes('roku') ||
    uaLower.includes('chromecast') ||
    uaLower.includes('webos') ||
    uaLower.includes('tizen') ||
    uaLower.includes('netcast') ||
    uaLower.includes('viera')
  ) {
    return 'smart-tv';
  }

  // Speaker detection (smart speakers, audio devices)
  if (
    uaLower.includes('alexa') ||
    uaLower.includes('echo') ||
    uaLower.includes('googlehome') ||
    uaLower.includes('homepod') ||
    uaLower.includes('sonos') ||
    uaLower.includes('bose') ||
    uaLower.includes('spotify connect')
  ) {
    return 'speaker';
  }

  // Mobile detection (phones)
  if (
    uaLower.includes('mobile') ||
    (uaLower.includes('android') && !uaLower.includes('tablet')) ||
    uaLower.includes('iphone') ||
    uaLower.includes('ipod') ||
    uaLower.includes('blackberry') ||
    uaLower.includes('windows phone') ||
    (uaLower.includes('webos') && uaLower.includes('mobile'))
  ) {
    return 'mobile';
  }

  // Tablet detection
  if (
    uaLower.includes('tablet') ||
    uaLower.includes('ipad') ||
    (uaLower.includes('android') && !uaLower.includes('mobile')) ||
    uaLower.includes('kindle') ||
    uaLower.includes('silk') ||
    uaLower.includes('playbook') ||
    // Android tablets often don't include 'mobile' in UA
    (uaLower.includes('android') &&
      uaLower.includes('webkit') &&
      !uaLower.includes('mobile'))
  ) {
    return 'tablet';
  }

  // Everything else is considered desktop
  return 'desktop';
};

/**
 * Get current device type
 * @returns Current device type
 */
export const getCurrentDeviceType = (): DeviceType => {
  return detectDeviceType();
};

/**
 * Get additional device information for analytics
 * @returns Object with device info
 */
export const getDeviceInfo = () => {
  const deviceType = getCurrentDeviceType();
  const userAgent = navigator.userAgent;

  return {
    deviceType,
    userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    platform: navigator.platform,
  };
};

export default {
  detectDeviceType,
  getCurrentDeviceType,
  getDeviceInfo,
};

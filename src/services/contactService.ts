import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../config/firebase';
import { ContactSettings } from '../types';

export const NOOR_MUHAMMAD_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.243577317769!2d73.0517669762413!3d30.150132174868903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393d3f0023d88447%3A0xd98f24516003b7e1!2sNoor%20Muhammad%20Protein%20Farm!5e0!3m2!1sen!2spk!4v1726900000000!5m2!1sen!2spk';

export const NOOR_MUHAMMAD_MAPS_DIRECT_URL =
  'https://www.google.com/maps/place/Noor+Muhammad+Protein+Farm/@30.1501275,73.0543419,17z/data=!3m1!4b1!4m6!3m5!1s0x393d3f0023d88447:0xd98f24516003b7e1!8m2!3d30.1501275!4d73.0543419!16s%2Fg%2F11mrhb162y';

/**
 * Validates and converts Google Maps links (including standard share/place URLs)
 * into a safe, valid iframe embed URL.
 */
export function getEmbedUrlFromMapsUrl(url?: string): string {
  if (!url || typeof url !== 'string') return NOOR_MUHAMMAD_MAP_EMBED_URL;
  const trimmed = url.trim();
  if (!trimmed) return NOOR_MUHAMMAD_MAP_EMBED_URL;

  // If already an embed URL, return it
  if (trimmed.includes('google.com/maps/embed')) {
    return trimmed;
  }

  // If it points to Noor Muhammad Protein Farm by name, coordinates, or place id
  if (
    trimmed.includes('0x393d3f0023d88447') ||
    trimmed.includes('Noor+Muhammad+Protein+Farm') ||
    (trimmed.includes('30.1501275') && trimmed.includes('73.0543419'))
  ) {
    return NOOR_MUHAMMAD_MAP_EMBED_URL;
  }

  // If coordinates are found in the URL (@lat,lng)
  const coordsMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const placeIdMatch = trimmed.match(/(0x[a-fA-F0-9]+:0x[a-fA-F0-9]+)/);

  if (placeIdMatch && coordsMatch) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2];
    const placeHex = encodeURIComponent(placeIdMatch[1]);
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.24!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${placeHex}!2sNoor%20Muhammad%20Protein%20Farm!5e0!3m2!1sen!2spk!4v1726900000000!5m2!1sen!2spk`;
  }

  if (coordsMatch) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2];
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.24!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393d3f0023d88447%3A0xd98f24516003b7e1!2sNoor%20Muhammad%20Protein%20Farm!5e0!3m2!1sen!2spk!4v1726900000000!5m2!1sen!2spk`;
  }

  return trimmed;
}

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  ownerName: 'Haji Noor Muhammad',
  ownerPhone: '+92 300 1234567',
  ownerWhatsApp: '923001234567',
  ownerPhotoUrl: '',
  managerName: 'Muhammad Rizwan',
  managerPhone: '+923016119000',
  managerWhatsApp: '923016119000',
  managerPhotoUrl: '',
  farmAddress: 'Chak 45-JB, Gojra / Toba Tek Singh Road, Punjab, Pakistan',
  farmAddressUrdu: 'چک 45-جے بی، گوجرہ روڈ، پنجاب، پاکستان',
  farmEmail: 'info@noormuhammadproteinfarm.com',
  mapEmbedUrl: NOOR_MUHAMMAD_MAP_EMBED_URL,
  mapsDirectUrl: NOOR_MUHAMMAD_MAPS_DIRECT_URL,
  updatedAt: new Date().toISOString(),
};

const SETTINGS_DOC_PATH = 'settings/contact';

export function subscribeToContactSettings(
  callback: (settings: ContactSettings) => void,
  onError?: (err: unknown) => void
) {
  const ref = doc(db, 'settings', 'contact');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ContactSettings;
        // If the mapEmbedUrl is still pointing to the old placeholder/Gojra or empty or raw place link, upgrade it
        const currentUrl = data.mapEmbedUrl || '';
        if (
          !currentUrl ||
          currentUrl.includes('0x392336338b320d31') ||
          currentUrl.includes('Gojra%2C') ||
          !currentUrl.includes('google.com/maps/embed')
        ) {
          data.mapEmbedUrl = getEmbedUrlFromMapsUrl(currentUrl);
        }
        if (!data.mapsDirectUrl) {
          data.mapsDirectUrl = NOOR_MUHAMMAD_MAPS_DIRECT_URL;
        }
        if (!data.managerPhone || data.managerPhone.includes('7654321')) {
          data.managerPhone = '+923016119000';
        }
        if (!data.managerWhatsApp || data.managerWhatsApp.includes('7654321')) {
          data.managerWhatsApp = '923016119000';
        }
        callback(data);
      } else {
        // Provide defaults if not yet initialized
        callback(DEFAULT_CONTACT_SETTINGS);
      }
    },
    (error) => {
      const err = handleFirestoreError(error, OperationType.GET, SETTINGS_DOC_PATH);
      if (onError) onError(err);
    }
  );
}

export async function getContactSettings(): Promise<ContactSettings> {
  const ref = doc(db, 'settings', 'contact');
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as ContactSettings;
      const currentUrl = data.mapEmbedUrl || '';
      if (
        !currentUrl ||
        currentUrl.includes('0x392336338b320d31') ||
        currentUrl.includes('Gojra%2C') ||
        !currentUrl.includes('google.com/maps/embed')
      ) {
        data.mapEmbedUrl = getEmbedUrlFromMapsUrl(currentUrl);
      }
      if (!data.mapsDirectUrl) {
        data.mapsDirectUrl = NOOR_MUHAMMAD_MAPS_DIRECT_URL;
      }
      if (!data.managerPhone || data.managerPhone.includes('7654321')) {
        data.managerPhone = '+923016119000';
      }
      if (!data.managerWhatsApp || data.managerWhatsApp.includes('7654321')) {
        data.managerWhatsApp = '923016119000';
      }
      return data;
    }
    return DEFAULT_CONTACT_SETTINGS;
  } catch (error) {
    console.warn('Could not fetch settings from Firestore, returning defaults:', error);
    return DEFAULT_CONTACT_SETTINGS;
  }
}

export async function updateContactSettings(settings: Partial<ContactSettings>): Promise<void> {
  const ref = doc(db, 'settings', 'contact');
  try {
    const safeMapEmbedUrl = settings.mapEmbedUrl
      ? getEmbedUrlFromMapsUrl(settings.mapEmbedUrl)
      : undefined;

    const payload = {
      ...settings,
      ...(safeMapEmbedUrl ? { mapEmbedUrl: safeMapEmbedUrl } : {}),
      mapsDirectUrl: settings.mapsDirectUrl || NOOR_MUHAMMAD_MAPS_DIRECT_URL,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, removeUndefinedFields(payload), { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.UPDATE, SETTINGS_DOC_PATH);
  }
}

export async function initializeContactSettingsIfMissing(): Promise<void> {
  const ref = doc(db, 'settings', 'contact');
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, DEFAULT_CONTACT_SETTINGS);
    }
  } catch (err) {
    console.warn('Contact settings init probe (normal if unauthenticated):', err);
  }
}

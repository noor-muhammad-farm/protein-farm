import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../config/firebase';
import { ContactSettings } from '../types';

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  ownerName: 'Haji Noor Muhammad',
  ownerPhone: '+92 300 1234567',
  ownerWhatsApp: '923001234567',
  managerName: 'Muhammad Rizwan',
  managerPhone: '+92 321 7654321',
  managerWhatsApp: '923217654321',
  farmAddress: 'Chak 45-JB, Faisalabad Road, Gojra / Toba Tek Singh, Punjab, Pakistan',
  farmAddressUrdu: 'چک 45-جے بی، فیصل آباد روڈ، گوجرہ / ٹوبہ ٹیک سنگھ، پنجاب، پاکستان',
  farmEmail: 'info@noormuhammadproteinfarm.com',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108873.34241908235!2d72.63294328867389!3d31.15340620808003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392336338b320d31%3A0x6b40552b947e4369!2sGojra%2C%20Toba%20Tek%20Singh%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s',
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
        callback(snap.data() as ContactSettings);
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
      return snap.data() as ContactSettings;
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
    const payload = {
      ...settings,
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

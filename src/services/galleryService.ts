import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../config/firebase';
import { GalleryPhoto } from '../types';

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'default-photo-1',
    imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80',
    title: 'Healthy Layer Poultry Flock',
    titleUrdu: 'صحت مند اور فعال لیئر مرغیاں',
    description: 'Expertly raised, fully vaccinated commercial layers under strict biosecure environment.',
    category: 'Layers & Birds',
    order: 1,
    createdAt: '2026-09-01T10:00:00.000Z',
    createdBy: 'system',
  },
  {
    id: 'default-photo-2',
    imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=1200&q=80',
    title: 'Daily Fresh Egg Harvest',
    titleUrdu: 'روزانہ تازہ انڈوں کی چنائی اور گریڈنگ',
    description: 'Fresh Grade-A table eggs collected every morning, graded and packed for wholesale supply.',
    category: 'Fresh Eggs',
    order: 2,
    createdAt: '2026-09-02T10:00:00.000Z',
    createdBy: 'system',
  },
  {
    id: 'default-photo-3',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80',
    title: 'Controlled Environment Sheds',
    titleUrdu: 'جدید کنٹرولڈ شیڈز اور خوراک کا انتظام',
    description: 'Climate-controlled shedding with automatic watering, nutritious feed and sterile hygiene.',
    category: 'Farm Facility',
    order: 3,
    createdAt: '2026-09-03T10:00:00.000Z',
    createdBy: 'system',
  },
  {
    id: 'default-photo-4',
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80',
    title: 'Crate Sorting & Packaging',
    titleUrdu: 'کریٹ پیکنگ اور ہول سیل ترسیل',
    description: 'Standard 30-egg wholesale crates packed securely for immediate distribution across Punjab.',
    category: 'Packaging',
    order: 4,
    createdAt: '2026-09-04T10:00:00.000Z',
    createdBy: 'system',
  },
  {
    id: 'default-photo-5',
    imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=1200&q=80',
    title: 'Veterinary Inspection & Care',
    titleUrdu: 'ماہر ویٹرنری ڈاکٹرز کی مسلسل نگرانی',
    description: 'Regular health checks, flock monitoring and balanced feed formulated for optimal hen health.',
    category: 'Biosecurity',
    order: 5,
    createdAt: '2026-09-05T10:00:00.000Z',
    createdBy: 'system',
  },
];

const GALLERY_COLLECTION = 'gallery_photos';

/**
 * Subscribes in real-time to gallery photos from Firestore.
 * Automatically orders photos by order index or createdAt.
 */
export function subscribeToGalleryPhotos(
  callback: (photos: GalleryPhoto[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, GALLERY_COLLECTION);
  const q = query(colRef, orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const photos: GalleryPhoto[] = [];
      snapshot.forEach((docSnap) => {
        photos.push({ id: docSnap.id, ...(docSnap.data() as Omit<GalleryPhoto, 'id'>) });
      });
      callback(photos);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, GALLERY_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Adds a new gallery photo to Firestore
 */
export async function addGalleryPhoto(
  photo: Omit<GalleryPhoto, 'id' | 'createdAt'>
): Promise<GalleryPhoto> {
  const colRef = collection(db, GALLERY_COLLECTION);
  const newDocRef = doc(colRef);
  const createdAt = new Date().toISOString();

  const newPhoto: GalleryPhoto = {
    ...photo,
    id: newDocRef.id,
    order: photo.order ?? Date.now(),
    createdAt,
  };

  const payload = removeUndefinedFields(newPhoto);

  try {
    await setDoc(newDocRef, payload);
    return newPhoto;
  } catch (error) {
    throw handleFirestoreError(error, OperationType.CREATE, `${GALLERY_COLLECTION}/${newDocRef.id}`);
  }
}

/**
 * Deletes a gallery photo by ID from Firestore
 */
export async function deleteGalleryPhoto(id: string): Promise<void> {
  const docRef = doc(db, GALLERY_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, `${GALLERY_COLLECTION}/${id}`);
  }
}

/**
 * Updates an existing photo
 */
export async function updateGalleryPhoto(
  id: string,
  updates: Partial<Omit<GalleryPhoto, 'id'>>
): Promise<void> {
  const docRef = doc(db, GALLERY_COLLECTION, id);
  const payload = removeUndefinedFields(updates);

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.UPDATE, `${GALLERY_COLLECTION}/${id}`);
  }
}

/**
 * Seeds default curated showcase photos into Firestore
 */
export async function seedDefaultGalleryPhotos(userEmail?: string): Promise<void> {
  const batch = writeBatch(db);

  for (const photo of DEFAULT_GALLERY_PHOTOS) {
    const docRef = doc(db, GALLERY_COLLECTION, photo.id);
    const data = removeUndefinedFields({
      ...photo,
      createdBy: userEmail || 'system_seed',
      createdAt: new Date().toISOString(),
    });
    batch.set(docRef, data);
  }

  try {
    await batch.commit();
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, GALLERY_COLLECTION);
  }
}

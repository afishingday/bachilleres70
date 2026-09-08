/**
 * Fotos en pending/ están en Storage con lectura solo para admins.
 * En Firestore guardamos fullPath del objeto (p. ej. pending/xyz/infancia.jpg).
 */
import {
  ref,
  getDownloadURL,
  getBytes,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';

export function isHttpsUrl(val) {
  return typeof val === 'string' && /^https?:\/\//i.test(val.trim());
}

/** URL de vista para admin (o URL legada ya guardada como https). */
export async function pendienteRawToDownloadUrl(storage, raw) {
  const t = String(raw ?? '').trim();
  if (!t) return '';
  if (isHttpsUrl(t)) return t;
  return getDownloadURL(ref(storage, t));
}

async function blobToApprovedPath(storage, grupo, estudianteId, tipo, bytes, extFallback) {
  const ext =
    (/\.([a-z0-9]+)$/i.exec(extFallback ?? '') ?? [])[1]?.toLowerCase() || 'jpg';
  const destRef = ref(storage, `fotos/${grupo}/${estudianteId}/${tipo}.${ext}`);
  await uploadBytes(destRef, bytes);
  return { destRef, publicUrl: await getDownloadURL(destRef) };
}

/**
 * Copia la foto pendiente a fotos/ (lector público) y borra el original pending.
 */
export async function promotePendingPhotoToPublic(storage, pendienteRaw, grupo, estudianteId, tipo) {
  const t = String(pendienteRaw ?? '').trim();
  if (!t) throw new Error('No hay foto pendiente');

  let bytes;
  let sourceRef = null;

  if (isHttpsUrl(t)) {
    try {
      sourceRef = ref(storage, t);
      bytes = await getBytes(sourceRef);
    } catch {
      const res = await fetch(t);
      if (!res.ok) throw new Error('No se pudo leer la imagen pendiente.');
      bytes = new Uint8Array(await res.arrayBuffer());
      sourceRef = null;
    }
    const tail = sourceRef?.fullPath.split('/').pop() ?? `${tipo}.jpg`;
    const { publicUrl } = await blobToApprovedPath(storage, grupo, estudianteId, tipo, bytes, tail);
    if (sourceRef) {
      try {
        await deleteObject(sourceRef);
      } catch {
        /* legado o URL ajena */
      }
    }
    return publicUrl;
  }

  sourceRef = ref(storage, t);
  bytes = await getBytes(sourceRef);
  const tail = sourceRef.fullPath.split('/').pop() || tipo;
  const { publicUrl } = await blobToApprovedPath(storage, grupo, estudianteId, tipo, bytes, tail);
  await deleteObject(sourceRef);
  return publicUrl;
}

/** Elimina objeto en Storage tanto si Firestore tiene path como URL de descarga. */
export async function deletePendienteObject(storage, raw) {
  const t = String(raw ?? '').trim();
  if (!t) return;
  try {
    if (isHttpsUrl(t)) await deleteObject(ref(storage, t));
    else await deleteObject(ref(storage, t));
  } catch {
    /* objeto ya borrado o URL no reconocida */
  }
}

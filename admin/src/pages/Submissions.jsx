import { useEffect, useMemo, useState } from 'react';
import { db, storage } from '../firebase';
import {
  collection, onSnapshot, doc, updateDoc, getDocs, query, orderBy,
} from 'firebase/firestore';
import {
  pendienteRawToDownloadUrl,
  promotePendingPhotoToPublic,
  deletePendienteObject,
} from '../storagePending';

const TIPOS = ['infancia', 'actual', 'muro'];

function placeholder(nombre, tipo) {
  return `https://picsum.photos/seed/${encodeURIComponent((nombre || '') + '-' + tipo)}/160/160`;
}

/** Miniaturas de pending: Firestore guarda path; el admin autenticado pide la URL. */
function StoragePendienteImg({ raw, nombre, tipo, className, caption }) {
  const fallback = useMemo(() => placeholder(nombre, tipo), [nombre, tipo]);
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    let cancel = false;
    const t = String(raw ?? '').trim();
    if (!t) {
      setSrc(fallback);
      return undefined;
    }
    if (/^https?:\/\//i.test(t)) {
      setSrc(t);
      return undefined;
    }
    pendienteRawToDownloadUrl(storage, t)
      .then(url => {
        if (!cancel && url) setSrc(url);
      })
      .catch(() => {
        if (!cancel) setSrc(fallback);
      });
    return () => {
      cancel = true;
    };
  }, [raw, fallback]);

  return (
    <div className="text-center">
      {caption && <p className="text-xs text-gray-400 mb-1">{caption}</p>}
      <img src={src} alt={tipo} className={className} />
    </div>
  );
}

// ── Pestaña: fotos pendientes vinculadas a estudiantes ──────────────────────
function TabVinculados() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    return onSnapshot(collection(db, 'estudiantes'), snap => {
      const withPending = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => TIPOS.some(t => s[`foto_${t}_pendiente`]));
      setPending(withPending);
      setLoading(false);
    });
  }, []);

  const items = pending.flatMap(s =>
    TIPOS.filter(t => s[`foto_${t}_pendiente`]).map(tipo => ({ student: s, tipo }))
  );

  async function aprobar(student, tipo) {
    const key = `${student.id}-${tipo}`;
    setProcessing(p => ({ ...p, [key]: true }));
    setError('');
    try {
      const pend = student[`foto_${tipo}_pendiente`];
      const publicUrl = await promotePendingPhotoToPublic(storage, pend, student.grupo, student.id, tipo);
      await updateDoc(doc(db, 'estudiantes', student.id), {
        [`foto_${tipo}`]: publicUrl,
        [`foto_${tipo}_pendiente`]: '',
      });
    } catch (err) {
      setError('Error al aprobar: ' + err.message);
    } finally {
      setProcessing(p => ({ ...p, [key]: false }));
    }
  }

  async function rechazar(student, tipo) {
    const key = `${student.id}-${tipo}`;
    setProcessing(p => ({ ...p, [key]: true }));
    setError('');
    try {
      await deletePendienteObject(storage, student[`foto_${tipo}_pendiente`]);
      await updateDoc(doc(db, 'estudiantes', student.id), {
        [`foto_${tipo}_pendiente`]: '',
      });
    } catch (err) {
      setError('Error al rechazar: ' + err.message);
    } finally {
      setProcessing(p => ({ ...p, [key]: false }));
    }
  }

  if (loading) return <p className="text-gray-500 py-8">Cargando…</p>;

  return (
    <div>
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {!items.length ? (
        <div className="bg-white rounded-lg shadow p-16 text-center">
          <p className="text-gray-400 text-sm">No hay fotos pendientes vinculadas a estudiantes ✓</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ student, tipo }) => {
            const key = `${student.id}-${tipo}`;
            const busy = !!processing[key];
            return (
              <div key={key} className="bg-white rounded-lg shadow p-4 flex gap-5 items-start">
                <div className="flex gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1.5">Actual</p>
                    <img src={student[`foto_${tipo}`] || placeholder(student.nombre, tipo)} alt=""
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 bg-gray-100" />
                  </div>
                  <StoragePendienteImg
                    raw={student[`foto_${tipo}_pendiente`]}
                    nombre={student.nombre}
                    tipo={tipo}
                    caption="Propuesta"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-yellow-400 bg-gray-100"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.nombre}</p>
                  <p className="text-sm text-gray-500 mb-4">{student.grupo} · foto de <strong>{tipo}</strong></p>
                  <div className="flex gap-2">
                    <button onClick={() => aprobar(student, tipo)} disabled={busy}
                      className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                      {busy ? 'Procesando…' : 'Aprobar'}
                    </button>
                    <button onClick={() => rechazar(student, tipo)} disabled={busy}
                      className="border border-red-300 text-red-600 px-4 py-1.5 rounded text-sm hover:bg-red-50 disabled:opacity-50">
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Pestaña: envíos sin asignar (nombre no encontrado en BD) ────────────────
function TabSinAsignar() {
  const [envios, setEnvios] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const [selectedStudent, setSelectedStudent] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubEnvios = onSnapshot(
      query(collection(db, 'envios_pendientes'), orderBy('fecha_envio', 'desc')),
      snap => {
        setEnvios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    // Load student list for assignment selector
    getDocs(query(collection(db, 'estudiantes'), orderBy('nombre')))
      .then(snap => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsubEnvios;
  }, []);

  const pendientes = envios.filter(e => e.estado === 'pendiente');

  async function asignarYAprobar(envio) {
    const studentId = selectedStudent[envio.id];
    if (!studentId) { setError('Selecciona un estudiante antes de asignar.'); return; }
    setAssigning(a => ({ ...a, [envio.id]: true }));
    setError('');
    try {
      const updates = {
        autorizacion: true,
        autorizacion_fecha: envio.autorizacion_fecha || '',
      };
      const pInf = envio.foto_infancia_path || envio.foto_infancia_url;
      const pAct = envio.foto_actual_path || envio.foto_actual_url;
      const pMur = envio.foto_muro_path || envio.foto_muro_url;
      if (pInf) updates.foto_infancia_pendiente = pInf;
      if (pAct) updates.foto_actual_pendiente = pAct;
      if (pMur) updates.foto_muro_pendiente = pMur;
      if (envio.dedicatoria)       updates.dedicatoria             = envio.dedicatoria;
      if (envio.sueno)             updates.sueno                   = envio.sueno;
      if (envio.cancion)           updates.cancion                 = envio.cancion;

      await updateDoc(doc(db, 'estudiantes', studentId), updates);
      await updateDoc(doc(db, 'envios_pendientes', envio.id), {
        estado: 'asignado',
        estudiante_id: studentId,
      });
    } catch (err) {
      setError('Error al asignar: ' + err.message);
    } finally {
      setAssigning(a => ({ ...a, [envio.id]: false }));
    }
  }

  async function descartar(envio) {
    if (!window.confirm('¿Descartar este envío? Se eliminará permanentemente.')) return;
    try {
      await Promise.all(
        TIPOS.map(async t => {
          const raw = envio[`foto_${t}_path`] || envio[`foto_${t}_url`];
          await deletePendienteObject(storage, raw);
        }),
      );
      await updateDoc(doc(db, 'envios_pendientes', envio.id), { estado: 'descartado' });
    } catch (err) {
      setError('Error al descartar: ' + err.message);
    }
  }

  if (loading) return <p className="text-gray-500 py-8">Cargando…</p>;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Estos envíos llegaron con un nombre que no coincidió exactamente con ningún estudiante registrado.
        Revisa y asígnalos manualmente.
      </p>
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {!pendientes.length ? (
        <div className="bg-white rounded-lg shadow p-16 text-center">
          <p className="text-gray-400 text-sm">No hay envíos sin asignar ✓</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendientes.map(envio => (
            <div key={envio.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex gap-4 mb-4">
                {/* Fotos enviadas */}
                <div className="flex gap-2 shrink-0">
                  {TIPOS.filter(t => envio[`foto_${t}_path`] || envio[`foto_${t}_url`]).map(tipo => (
                    <StoragePendienteImg
                      key={tipo}
                      raw={envio[`foto_${tipo}_path`] || envio[`foto_${tipo}_url`]}
                      nombre={envio.nombre_enviado}
                      tipo={tipo}
                      caption={tipo}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 bg-gray-100"
                    />
                  ))}
                </div>
                {/* Datos enviados */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{envio.nombre_enviado}</p>
                  <p className="text-sm text-gray-500">Grado {envio.grupo}</p>
                  {envio.dedicatoria && (
                    <p className="text-sm text-gray-600 mt-1 italic line-clamp-2">"{envio.dedicatoria}"</p>
                  )}
                  {envio.sueno && <p className="text-sm text-gray-500 mt-0.5">Sueño: {envio.sueno}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Enviado: {envio.fecha_envio ? new Date(envio.fecha_envio).toLocaleString('es-CO') : '—'}
                  </p>
                </div>
              </div>

              {/* Asignación */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Asignar a estudiante:</p>
                <div className="flex gap-2 flex-wrap items-center">
                  <select
                    value={selectedStudent[envio.id] || ''}
                    onChange={e => setSelectedStudent(s => ({ ...s, [envio.id]: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48"
                  >
                    <option value="">— Busca y selecciona el estudiante —</option>
                    {students
                      .filter(s => !envio.grupo || s.grupo === envio.grupo)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.grupo})</option>
                      ))
                    }
                  </select>
                  <button
                    onClick={() => asignarYAprobar(envio)}
                    disabled={!!assigning[envio.id] || !selectedStudent[envio.id]}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {assigning[envio.id] ? 'Asignando…' : 'Asignar y enviar a pendientes'}
                  </button>
                  <button
                    onClick={() => descartar(envio)}
                    disabled={!!assigning[envio.id]}
                    className="border border-red-300 text-red-600 px-4 py-1.5 rounded text-sm hover:bg-red-50"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Submissions() {
  const [tab, setTab] = useState('vinculados');
  const [countSinAsignar, setCountSinAsignar] = useState(0);

  useEffect(() => {
    return onSnapshot(collection(db, 'envios_pendientes'), snap => {
      setCountSinAsignar(snap.docs.filter(d => d.data().estado === 'pendiente').length);
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Revisión de contenido público</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-2xl">
        Las familias suben fotos y textos que primero quedan pendientes. Aquí puedes <strong>aprobar</strong> (pasan a verse en el portal cuando el alumno está activo) o <strong>rechazar</strong>.
        La pestaña <em>Sin asignar</em> es cuando el nombre no coincidió con ninguna ficha.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('vinculados')}
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
            tab === 'vinculados'
              ? 'bg-white border border-b-white border-gray-200 -mb-px text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Fotos de estudiantes
        </button>
        <button
          onClick={() => setTab('sin-asignar')}
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors flex items-center gap-1.5 ${
            tab === 'sin-asignar'
              ? 'bg-white border border-b-white border-gray-200 -mb-px text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sin asignar
          {countSinAsignar > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {countSinAsignar}
            </span>
          )}
        </button>
      </div>

      {tab === 'vinculados' ? <TabVinculados /> : <TabSinAsignar />}
    </div>
  );
}

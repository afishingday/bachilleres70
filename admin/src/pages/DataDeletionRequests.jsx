import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection, doc, onSnapshot, orderBy, query, updateDoc,
} from 'firebase/firestore';

export default function DataDeletionRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState({});
  const [filtro, setFiltro] = useState('pendiente');
  const [notas, setNotas] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'solicitudes_borrado'), orderBy('fecha', 'desc'));
    return onSnapshot(
      q,
      snap => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(() => {
    if (filtro === 'todas') return items;
    return items.filter(it => (it.estado || 'pendiente') === filtro);
  }, [items, filtro]);

  const pendCount = items.filter(it => (it.estado || 'pendiente') === 'pendiente').length;

  async function marcarAtendida(it) {
    setBusy(b => ({ ...b, [it.id]: true }));
    setError('');
    try {
      await updateDoc(doc(db, 'solicitudes_borrado', it.id), {
        estado: 'atendida',
        atendida_en: new Date().toISOString(),
        notas_admin: String(notas[it.id] ?? '').trim(),
      });
      setNotas(n => ({ ...n, [it.id]: '' }));
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setBusy(b => ({ ...b, [it.id]: false }));
    }
  }

  if (loading) return <p className="text-gray-500 py-12">Cargando solicitudes…</p>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Solicitudes Ley 1581 · borrado / rectificación</h2>
          <p className="text-sm text-gray-600 mt-1">
            Envíos desde el aviso del portal público (nombre del estudiante, grupo y texto de la solicitud).
            Cuando ejecutes cambios en Firestore u orientes a la familia, marca aquí como <strong>Atendida</strong>.
          </p>
        </div>
        {pendCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1">
            {pendCount} pendiente{pendCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'pendiente', label: 'Pendientes' },
          { id: 'atendida', label: 'Atendidas' },
          { id: 'todas', label: 'Todas' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFiltro(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === t.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <p className="text-gray-400 text-sm">No hay solicitudes en esta vista.</p>
          <Link to="/estudiantes" className="text-blue-600 text-sm mt-3 inline-block hover:underline">
            Ir a estudiantes para editar datos directamente →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(it => {
            const estado = it.estado || 'pendiente';
            const fecha = it.fecha ? new Date(it.fecha) : null;
            const isBusy = !!busy[it.id];
            const pendiente = estado === 'pendiente';

            return (
              <article
                key={it.id}
                className={`rounded-xl border shadow-sm overflow-hidden bg-white ${pendiente ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'}`}
              >
                <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50/80">
                  <div>
                    <p className="font-semibold text-gray-900">{it.nombre_estudiante}</p>
                    <p className="text-sm text-gray-500">Grupo {it.grupo}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        pendiente ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {estado === 'atendida' ? 'Atendida' : 'Pendiente'}
                    </span>
                    {fecha && (
                      <p className="text-xs text-gray-400 mt-1">{fecha.toLocaleString('es-CO')}</p>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Detalle enviado</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{it.detalle}</p>
                  </div>
                  {(it.contacto_correo || '').trim() && (
                    <p className="text-sm">
                      <span className="text-gray-500">Correo de contacto:</span>{' '}
                      <a className="text-blue-600 hover:underline" href={`mailto:${it.contacto_correo}`}>
                        {it.contacto_correo}
                      </a>
                    </p>
                  )}
                  {it.atendida_en && (
                    <p className="text-xs text-gray-500">
                      Marcada atendida: {new Date(it.atendida_en).toLocaleString('es-CO')}
                    </p>
                  )}
                  {it.notas_admin && (
                    <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span className="font-medium text-gray-700">Notas internas: </span>
                      {it.notas_admin}
                    </div>
                  )}

                  {pendiente && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Nota interna (opcional)</label>
                      <textarea
                        rows={2}
                        value={notas[it.id] ?? ''}
                        onChange={e => setNotas(n => ({ ...n, [it.id]: e.target.value }))}
                        placeholder="Ej.: Fotos borradas desde ficha … / respondido por correo el …"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => marcarAtendida(it)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                      >
                        {isBusy ? 'Guardando…' : 'Marcar como atendida'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

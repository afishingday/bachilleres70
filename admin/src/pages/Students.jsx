import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';

const GRUPOS = ['11A', '11B', '11C', '11D', '11E', '11F'];
const EMPTY_FORM = { nombre: '', documento: '', grupo: '11A', dedicatoria: '', sueno: '', cancion: '' };

const normalize = s =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function placeholder(nombre, tipo) {
  return `https://picsum.photos/seed/${encodeURIComponent(nombre + '-' + tipo)}/80/80`;
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grupo, setGrupo] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'estudiantes'), orderBy('nombre'));
    return onSnapshot(q, snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const filtered = students.filter(s =>
    (!grupo || s.grupo === grupo) &&
    (!search || normalize(s.nombre).includes(normalize(search)))
  );

  const pendingCount = students.filter(s =>
    s.foto_infancia_pendiente || s.foto_actual_pendiente || s.foto_muro_pendiente
  ).length;

  async function handleAdd(e) {
    e.preventDefault();
    if (!addForm.nombre.trim() || !addForm.documento) {
      setAddError('Nombre y documento son obligatorios.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      await addDoc(collection(db, 'estudiantes'), {
        nombre: addForm.nombre.trim(),
        documento: Number(addForm.documento),
        grupo: addForm.grupo,
        dedicatoria: addForm.dedicatoria.trim(),
        sueno: addForm.sueno.trim(),
        cancion: addForm.cancion.trim(),
        foto_infancia: '',
        foto_actual: '',
        foto_muro: '',
        foto_infancia_pendiente: '',
        foto_actual_pendiente: '',
        foto_muro_pendiente: '',
        activo: true,
      });
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
    } catch (err) {
      setAddError('Error al agregar: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Estudiantes</h2>
          <p className="text-sm text-gray-500">
            {students.length} estudiantes · {pendingCount} con fotos pendientes
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← Panel
          </Link>
          {pendingCount > 0 && (
            <Link
              to="/pendientes"
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              Pendientes ({pendingCount})
            </Link>
          )}
          <button
            onClick={() => setShowAdd(v => !v)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Agregar
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-gray-800">Nuevo estudiante</h3>
          {addError && <p className="text-red-600 text-sm bg-red-50 rounded p-2">{addError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                value={addForm.nombre}
                onChange={e => setAddForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Documento *</label>
              <input
                type="number"
                value={addForm.documento}
                onChange={e => setAddForm(f => ({ ...f, documento: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Grupo</label>
              <select
                value={addForm.grupo}
                onChange={e => setAddForm(f => ({ ...f, grupo: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sueño / Meta</label>
              <input
                value={addForm.sueno}
                onChange={e => setAddForm(f => ({ ...f, sueno: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dedicatoria</label>
            <textarea
              value={addForm.dedicatoria}
              onChange={e => setAddForm(f => ({ ...f, dedicatoria: e.target.value }))}
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-y"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={addLoading}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {addLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); setAddError(''); }}
              className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex gap-3 flex-wrap items-center">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-36"
          />
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setGrupo('')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${!grupo ? 'bg-gray-900 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            >
              Todos
            </button>
            {GRUPOS.map(g => (
              <button
                key={g}
                onClick={() => setGrupo(g === grupo ? '' : g)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${grupo === g ? 'bg-gray-900 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y">
          {filtered.map(s => (
            <Link
              key={s.id}
              to={`/estudiantes/${s.id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <img
                src={s.foto_actual || placeholder(s.nombre, 'actual')}
                alt=""
                className="w-10 h-10 rounded-full object-cover bg-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{s.nombre}</p>
                <p className="text-sm text-gray-500 truncate">{s.grupo} · {s.sueno || 'Sin sueño'}</p>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                {s.activo === false && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Inactivo</span>
                )}
                {(s.foto_infancia_pendiente || s.foto_actual_pendiente || s.foto_muro_pendiente) && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pendiente</span>
                )}
              </div>
            </Link>
          ))}
          {!filtered.length && (
            <p className="p-10 text-center text-gray-400 text-sm">No se encontraron estudiantes</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, storage } from '../firebase';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const GRUPOS = ['11A', '11B', '11C', '11D', '11E', '11F'];
const TIPOS = [
  { key: 'infancia', label: 'Foto de infancia' },
  { key: 'actual', label: 'Foto actual' },
  { key: 'muro', label: 'Foto del muro' },
];

function placeholder(nombre, tipo) {
  return `https://picsum.photos/seed/${encodeURIComponent(nombre + '-' + tipo)}/160/160`;
}

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const fileRefs = { infancia: useRef(), actual: useRef(), muro: useRef() };

  useEffect(() => {
    return onSnapshot(doc(db, 'estudiantes', id), snap => {
      if (!snap.exists()) { navigate('/estudiantes'); return; }
      const data = { id: snap.id, ...snap.data() };
      setStudent(data);
      setForm({
        nombre: data.nombre || '',
        grupo: data.grupo || '11A',
        dedicatoria: data.dedicatoria || '',
        sueno: data.sueno || '',
        cancion: data.cancion || '',
        activo: data.activo !== false,
      });
    });
  }, [id, navigate]);

  function setField(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await updateDoc(doc(db, 'estudiantes', id), form);
      setMsg({ type: 'ok', text: 'Cambios guardados correctamente.' });
    } catch (err) {
      setMsg({ type: 'err', text: 'Error al guardar: ' + err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(tipo) {
    const file = fileRefs[tipo].current?.files[0];
    if (!file) { setMsg({ type: 'err', text: 'Selecciona un archivo primero.' }); return; }
    setUploading(u => ({ ...u, [tipo]: true }));
    setMsg({ type: '', text: '' });
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const storageRef = ref(storage, `fotos/${student.grupo}/${id}/${tipo}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'estudiantes', id), { [`foto_${tipo}`]: url });
      setMsg({ type: 'ok', text: `Foto de ${tipo} actualizada.` });
      if (fileRefs[tipo].current) fileRefs[tipo].current.value = '';
    } catch (err) {
      setMsg({ type: 'err', text: 'Error al subir: ' + err.message });
    } finally {
      setUploading(u => ({ ...u, [tipo]: false }));
    }
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar a ${student.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, 'estudiantes', id));
      navigate('/estudiantes');
    } catch (err) {
      setMsg({ type: 'err', text: 'Error al eliminar: ' + err.message });
    }
  }

  if (!student) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/estudiantes" className="text-gray-400 hover:text-gray-700 text-sm">← Volver a la lista</Link>
        <h2 className="text-xl font-bold text-gray-900">{student.nombre}</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{student.grupo}</span>
      </div>

      {msg.text && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Data form */}
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
        <h3 className="font-semibold text-gray-700">Datos del estudiante</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input value={form.nombre || ''} onChange={setField('nombre')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <select value={form.grupo || '11A'} onChange={setField('grupo')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sueño / Meta</label>
          <input value={form.sueno || ''} onChange={setField('sueno')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dedicatoria</label>
          <textarea value={form.dedicatoria || ''} onChange={setField('dedicatoria')}
            rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Canción favorita</label>
          <input value={form.cancion || ''} onChange={setField('cancion')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="activo" checked={form.activo !== false} onChange={setField('activo')} />
          <label htmlFor="activo" className="text-sm text-gray-700">Activo (visible en el portal)</label>
        </div>
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* Photos */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Fotos</h3>
        <div className="space-y-4">
          {TIPOS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <img
                src={student[`foto_${key}`] || placeholder(student.nombre, key)}
                alt={label}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {student[`foto_${key}`] ? '✓ Foto cargada' : 'Sin foto'}
                </p>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                <input ref={fileRefs[key]} type="file" accept="image/*" className="hidden" id={`foto-${key}`} />
                <label htmlFor={`foto-${key}`}
                  className="cursor-pointer border border-gray-300 text-gray-600 px-3 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors">
                  Elegir
                </label>
                <button type="button" onClick={() => handleUpload(key)} disabled={uploading[key]}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {uploading[key] ? 'Subiendo...' : 'Subir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-700 mb-2 text-sm">Zona de peligro</h3>
        <button type="button" onClick={handleDelete}
          className="border border-red-300 text-red-600 px-4 py-2 rounded text-sm hover:bg-red-100 transition-colors">
          Eliminar estudiante
        </button>
      </div>
    </div>
  );
}

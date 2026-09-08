import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const TIPOS = ['infancia', 'actual', 'muro'];

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [enviosSinAsignar, setEnviosSinAsignar] = useState(0);
  const [solicitudesPend, setSolicitudesPend] = useState(0);

  useEffect(() => {
    return onSnapshot(collection(db, 'estudiantes'), snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, 'envios_pendientes'), snap => {
      setEnviosSinAsignar(snap.docs.filter(d => d.data().estado === 'pendiente').length);
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, 'solicitudes_borrado'), snap => {
      setSolicitudesPend(
        snap.docs.filter(d => (d.data().estado || 'pendiente') === 'pendiente').length,
      );
    });
  }, []);

  const fotoPendientesVinculadas = useMemo(
    () =>
      students.filter(s => TIPOS.some(t => s[`foto_${t}_pendiente`])).reduce(
        (acc, s) =>
          acc + TIPOS.filter(t => s[`foto_${t}_pendiente`]).length,
        0,
      ),
    [students],
  );

  const revisionBadge = fotoPendientesVinculadas + enviosSinAsignar;

  const cards = [
    {
      to: '/estudiantes',
      title: 'Estudiantes',
      description: 'Alta manual, texto, fotos desde el panel, visibilidad en el portal (activo) y borrado de ficha.',
      stat: `${students.length} fichas`,
      color: 'from-slate-700 to-slate-900',
    },
    {
      to: '/pendientes',
      title: 'Revisión de contenido',
      description: 'Familias envían fotos pendientes hasta que apruebes. Aquí ves comparativa y Sin asignar.',
      stat: revisionBadge ? `${revisionBadge} pendientes` : 'Sin colas',
      highlight: revisionBadge > 0,
      color: 'from-amber-600 to-amber-800',
    },
    {
      to: '/solicitudes-borrado',
      title: 'Solicitudes Ley 1581',
      description: 'Borrados, rectificaciones y oposiciones enviadas desde el aviso de privacidad del portal.',
      stat: solicitudesPend ? `${solicitudesPend} nuevas` : 'Sin pendientes',
      highlight: solicitudesPend > 0,
      color: 'from-teal-600 to-teal-800',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de gestión</h1>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed max-w-2xl">
          Gestiona estudiantes, aprueba contenido antes de que sea público y atiende las solicitudes de derechos
          (supresión o rectificación) que envían las familias.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(c => (
          <Link
            key={c.to}
            to={c.to}
            className={`group relative rounded-2xl p-6 text-white shadow-lg overflow-hidden bg-gradient-to-br ${c.color} hover:opacity-95 hover:shadow-xl transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40`}
          >
            {c.highlight && (
              <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
            )}
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-white/85 text-sm mt-2 leading-relaxed min-h-[4.5rem]">{c.description}</p>
            <p className="mt-6 text-sm font-medium text-white/95 border-t border-white/20 pt-4">
              {c.stat}
              <span className="float-right opacity-80 group-hover:translate-x-0.5 transition-transform">→</span>
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-white border border-gray-200 shadow-sm p-5 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-2">Referencia rápida</p>
        <ul className="space-y-1.5 list-disc list-inside text-gray-600">
          <li>El portal público solo muestra alumnos con <strong>Activo</strong> marcado en su ficha.</li>
          <li>Las fotos que envían las familias quedan en <strong>pendientes</strong> hasta que las apruebes o rechaces.</li>
          <li>Las solicitudes de borrado de datos llegan desde el formulario dentro del aviso legal (nombre + grupo + detalle).</li>
        </ul>
      </div>
    </div>
  );
}

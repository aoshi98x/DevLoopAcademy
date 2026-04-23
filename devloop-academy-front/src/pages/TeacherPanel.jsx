import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TeacherPanel() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Pestañas internas del panel
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' o 'students'

  // Estados para Sesiones
  const [lessons, setLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [newLesson, setNewLesson] = useState({
    id: '', title: '', video_id: '', markdown_url: '', meeting_url: '', meeting_time: '', order_index: 0
  });

  // Estados para Estudiantes
  const [students, setStudents] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('all');

  useEffect(() => {
    // Protección: Solo profesores (o admins) pueden entrar
    if (profile && profile.role !== 'teacher' && profile.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchMyCourses();
  }, [profile, navigate]);

  const fetchMyCourses = async () => {
    setLoading(true);
    // Traer solo los cursos asignados a este profesor
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user.id);

    setMyCourses(data || []);
    setLoading(false);
  };

  const loadCourseData = async (course) => {
    setSelectedCourse(course);
    setSelectedSchedule('all');

    // Traer lecciones
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });

    setLessons(lessonsData || []);
    setNewLesson(prev => ({ ...prev, order_index: (lessonsData?.length || 0) + 1 }));

    // Traer estudiantes inscritos
    const { data: enrollmentsData, error } = await supabase
      .from('course_enrollments')
      .select(`
        schedule_text,
        profiles ( full_name, email )
      `)
      .eq('course_id', course.id);

    if (error) console.error("Error cargando estudiantes:", error);
    setStudents(enrollmentsData || []);
  };

  // --- GESTIÓN DE SESIONES ---
  const handleSaveLesson = async (e) => {
    e.preventDefault();

    const formattedTime = newLesson.meeting_time ? new Date(newLesson.meeting_time).toISOString() : null;

    if (editingLesson) {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: newLesson.title,
          video_id: newLesson.video_id,
          markdown_url: newLesson.markdown_url,
          meeting_url: newLesson.meeting_url,
          meeting_time: formattedTime,
          order_index: newLesson.order_index
        })
        .eq('id', newLesson.id);

      if (error) alert(error.message);
      else {
        alert("Sesión actualizada");
        setEditingLesson(false);
        loadCourseData(selectedCourse);
      }
    } else {
      const { error } = await supabase.from('lessons').insert([{
        id: newLesson.id,
        course_id: selectedCourse.id,
        title: newLesson.title,
        video_id: newLesson.video_id,
        markdown_url: newLesson.markdown_url,
        meeting_url: newLesson.meeting_url,
        meeting_time: formattedTime,
        order_index: newLesson.order_index
      }]);

      if (error) alert(error.message);
      else {
        alert("Sesión agregada");
        loadCourseData(selectedCourse);
      }
    }
  };

  const startEditLesson = (lesson) => {
    setEditingLesson(true);
    let localTime = '';
    if (lesson.meeting_time) {
      const d = new Date(lesson.meeting_time);
      localTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }

    setNewLesson({
      id: lesson.id,
      title: lesson.title,
      video_id: lesson.video_id || '',
      markdown_url: lesson.markdown_url || '',
      meeting_url: lesson.meeting_url || '',
      meeting_time: localTime,
      order_index: lesson.order_index
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uniqueSchedules = [...new Set(students.map(s => s.schedule_text))].filter(Boolean);
  const filteredStudents = selectedSchedule === 'all'
    ? students
    : students.filter(s => s.schedule_text === selectedSchedule);

  if (loading) return <div className="text-white p-10 font-bold animate-pulse">Cargando Panel de Profesor...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="bg-purple-600 text-[10px] px-2 py-1 rounded uppercase tracking-tighter">Docente</span>
        Panel de Profesor
      </h1>

      {!selectedCourse ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-400">Mis Cursos Asignados</h2>
          {myCourses.length === 0 ? (
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
              No tienes cursos asignados actualmente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <div key={course.id} className="bg-black border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group" onClick={() => loadCourseData(course)}>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">{course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <button className="text-xs bg-purple-900/20 text-purple-400 border border-purple-900/30 px-4 py-2 rounded-lg font-bold w-full">
                    Gestionar Clases y Alumnos
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
            &larr; Volver a mis cursos
          </button>

          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{selectedCourse.title}</h2>
            <p className="text-gray-500">Gestión de sesiones y alumnado</p>
          </div>

          <div className="flex gap-4 border-b border-gray-800 mb-6">
            <button onClick={() => setActiveTab('sessions')} className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'sessions' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500'}`}>
              Sesiones Sincrónicas
            </button>
            <button onClick={() => setActiveTab('students')} className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'students' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500'}`}>
              Estudiantes Inscritos
            </button>
          </div>

          {activeTab === 'sessions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <form onSubmit={handleSaveLesson} className={`p-6 rounded-2xl border flex flex-col gap-4 h-fit sticky top-24 transition-colors ${editingLesson ? 'bg-purple-900/10 border-purple-500/50' : 'bg-gray-900/50 border-gray-800'}`}>
                <h3 className="text-white font-bold mb-2">{editingLesson ? '📝 Reprogramar Sesión' : '➕ Nueva Sesión Sincrónica'}</h3>

                <input
                  placeholder="ID de lección (ej: clase-1)"
                  className={`bg-black border border-gray-700 p-2.5 rounded text-white text-sm ${editingLesson ? 'opacity-50' : ''}`}
                  value={newLesson.id} onChange={e => !editingLesson && setNewLesson({ ...newLesson, id: e.target.value })}
                  required disabled={editingLesson}
                />
                <input
                  placeholder="Título de la clase"
                  className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm"
                  value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                />
                <input
                  placeholder="YouTube Video ID (Grabación opcional)"
                  className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm"
                  value={newLesson.video_id} onChange={e => setNewLesson({ ...newLesson, video_id: e.target.value })}
                />
                <input
                  placeholder="URL Markdown (Material opcional)"
                  className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm"
                  value={newLesson.markdown_url} onChange={e => setNewLesson({ ...newLesson, markdown_url: e.target.value })}
                />

                {/* CORRECCIÓN: Renderizado condicional de Sesión en Vivo */}
                {selectedCourse?.is_synchronous && (
                  <div className="pt-2 border-t border-gray-800 mt-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">Sesión en Vivo</label>
                    <input
                      placeholder="Enlace de la reunión (Zoom/Meet)"
                      className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm w-full mt-2"
                      value={newLesson.meeting_url} onChange={e => setNewLesson({ ...newLesson, meeting_url: e.target.value })}
                    />
                    <input
                      type="datetime-local"
                      className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm w-full mt-2"
                      value={newLesson.meeting_time} onChange={e => setNewLesson({ ...newLesson, meeting_time: e.target.value })}
                    />
                  </div>
                )}

                <input
                  type="number" placeholder="Orden"
                  className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm mt-2"
                  value={newLesson.order_index} onChange={e => setNewLesson({ ...newLesson, order_index: parseInt(e.target.value) })}
                />

                <div className="flex flex-col gap-2 mt-2">
                  <button className={`font-bold py-2 rounded-lg transition-colors text-white ${editingLesson ? 'bg-purple-600 hover:bg-purple-500' : 'bg-green-600 hover:bg-green-500'}`}>
                    {editingLesson ? 'Guardar Cambios' : 'Guardar Sesión'}
                  </button>
                  {editingLesson && (
                    <button type="button" onClick={() => { setEditingLesson(false); setNewLesson({ id: '', title: '', video_id: '', markdown_url: '', meeting_url: '', meeting_time: '', order_index: lessons.length + 1 }); }} className="text-gray-400 text-xs hover:text-white underline py-1">
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>

              <div className="lg:col-span-2 space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-black border border-gray-800 p-4 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <span className="text-purple-500 font-bold">#{lesson.order_index}</span>
                      <div>
                        <h5 className="text-white font-medium">{lesson.title}</h5>

                        {/* CORRECCIÓN: Lógica dinámica de etiquetas */}
                        {selectedCourse?.is_synchronous ? (
                          lesson.meeting_time && (
                            <p className="text-[11px] text-orange-400 font-bold uppercase mt-1">
                              📅 {new Date(lesson.meeting_time).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          )
                        ) : (
                          <p className="text-[11px] text-purple-400 font-bold uppercase mt-1">Pre-grabado</p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => startEditLesson(lesson)} className="text-gray-500 hover:text-purple-400 transition-colors p-2" title="Modificar sesión">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-gray-900 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-white font-bold">
                  Total mostrados: <span className="text-purple-400">{filteredStudents.length}</span>
                </h3>

                {uniqueSchedules.length > 0 && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Grupo:</span>
                    <select
                      className="bg-black border border-gray-700 text-sm text-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 outline-none w-full sm:w-auto"
                      value={selectedSchedule}
                      onChange={(e) => setSelectedSchedule(e.target.value)}
                    >
                      <option value="all">Todos los inscritos</option>
                      {uniqueSchedules.map((schedule, idx) => (
                        <option key={idx} value={schedule}>{schedule}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300 min-w-max">
                  <thead className="bg-gray-900 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="p-4">Estudiante</th>
                      <th className="p-4">Correo Electrónico</th>
                      <th className="p-4">Horario Elegido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-gray-900/30 transition-colors">
                        <td className="p-4 font-medium text-white">{student.profiles?.full_name || 'Desconocido'}</td>
                        <td className="p-4 text-sm text-blue-400">{student.profiles?.email || 'N/A'}</td>
                        <td className="p-4 text-xs font-bold text-gray-400">{student.schedule_text}</td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-600">
                          {students.length === 0 ? 'No hay estudiantes inscritos aún.' : 'No hay estudiantes en este grupo.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
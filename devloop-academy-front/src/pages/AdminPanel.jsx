import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  
  // Estados para datos generales
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Editor de Lecciones
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [isEditingLesson, setIsEditingLesson] = useState(false); // Estado para modo edición
  const [newLesson, setNewLesson] = useState({ 
    id: '', 
    title: '', 
    video_id: '', 
    markdown_url: '', 
    order_index: 0 
  });

  // Estado para nuevo curso
  const [newCourse, setNewCourse] = useState({ id: '', title: '', description: '', image_url: '', video_id: '', syllabus_url: '' });

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard');
    }
    fetchAdminData();
  }, [profile, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data: coursesData } = await supabase.from('courses').select('*');
    const { data: usersData } = await supabase.from('profiles').select('*');
    setCourses(coursesData || []);
    setUsers(usersData || []);
    setLoading(false);
  };

  // --- LÓGICA DE CURSOS ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('courses').insert([newCourse]);
    if (error) alert(error.message);
    else {
      alert("¡Curso creado!");
      setNewCourse({ id: '', title: '', description: '', image_url: '', video_id: '', syllabus_url: '' });
      fetchAdminData();
    }
  };

  // --- LÓGICA DE LECCIONES ---
  const openLessonsEditor = async (course) => {
    setEditingCourse(course);
    setIsEditingLesson(false); // Resetear modo edición al cambiar de curso
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });
    
    if (error) console.error(error);
    setCourseLessons(data || []);
    setNewLesson({ id: '', title: '', video_id: '', markdown_url: '', order_index: (data?.length || 0) + 1 });
  };

  const startEditLesson = (lesson) => {
    setIsEditingLesson(true);
    setNewLesson({
      id: lesson.id,
      title: lesson.title,
      video_id: lesson.video_id || '',
      markdown_url: lesson.markdown_url || '',
      order_index: lesson.order_index
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    
    if (isEditingLesson) {
      // ACTUALIZAR LECCIÓN EXISTENTE
      const { error } = await supabase
        .from('lessons')
        .update({
          title: newLesson.title,
          video_id: newLesson.video_id,
          markdown_url: newLesson.markdown_url,
          order_index: newLesson.order_index
        })
        .eq('id', newLesson.id);

      if (error) alert(error.message);
      else {
        alert("Lección actualizada");
        setIsEditingLesson(false);
        openLessonsEditor(editingCourse);
      }
    } else {
      // CREAR NUEVA LECCIÓN
      const { error } = await supabase.from('lessons').insert([{
        ...newLesson,
        course_id: editingCourse.id
      }]);

      if (error) alert(error.message);
      else {
        alert("Lección agregada correctamente");
        openLessonsEditor(editingCourse);
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("¿Seguro que quieres borrar esta lección?")) return;
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) alert(error.message);
    else openLessonsEditor(editingCourse);
  };

  // --- LÓGICA DE USUARIOS ---
  const toggleUserStatus = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);
    
    if (error) alert(error.message);
    else fetchAdminData();
  };

  if (loading) return <div className="text-white p-10 font-bold animate-pulse">Cargando DevLoop Academy Control...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="bg-red-600 text-[10px] px-2 py-1 rounded uppercase tracking-tighter">Admin</span>
        DevLoop Academy Control
      </h1>

      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b border-gray-800">
        <button 
          onClick={() => { setActiveTab('courses'); setEditingCourse(null); }}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'courses' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Gestionar Cursos
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Estudiantes
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="space-y-8">
          {!editingCourse ? (
            <>
              <form onSubmit={handleCreateCourse} className="bg-gray-900/30 p-6 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="col-span-full text-lg font-bold text-white mb-2 text-blue-400">Crear Nuevo Curso</h3>
                <input 
                  type="text" placeholder="ID (ej: unity-multiplayer)" 
                  className="bg-black border border-gray-700 p-3 rounded-lg text-white"
                  value={newCourse.id} onChange={e => setNewCourse({...newCourse, id: e.target.value})}
                  required
                />
                <input 
                  type="text" placeholder="Título del curso" 
                  className="bg-black border border-gray-700 p-3 rounded-lg text-white"
                  value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Descripción corta" 
                  className="bg-black border border-gray-700 p-3 rounded-lg text-white col-span-full"
                  value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg col-span-full transition-all">
                  Publicar Curso
                </button>
              </form>

              <div className="grid gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-black border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-gray-600 transition-all">
                    <div>
                      <h4 className="text-white font-bold">{course.title}</h4>
                      <p className="text-gray-500 text-sm font-mono">{course.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openLessonsEditor(course)}
                        className="text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/30 px-4 py-2 rounded-lg transition-all"
                      >
                        Editar Lecciones
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setEditingCourse(null)}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-2 mb-4"
              >
                &larr; Volver a cursos
              </button>
              
              <h2 className="text-2xl font-bold text-white">Editando: <span className="text-blue-500">{editingCourse.title}</span></h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario Nueva/Editar Lección */}
                <form onSubmit={handleSaveLesson} className={`p-6 rounded-2xl border flex flex-col gap-4 h-fit sticky top-24 transition-colors ${isEditingLesson ? 'bg-blue-900/10 border-blue-500/50' : 'bg-gray-900/50 border-gray-800'}`}>
                  <h3 className="text-white font-bold mb-2">{isEditingLesson ? '📝 Editando Lección' : '➕ Añadir Lección'}</h3>
                  <input 
                    placeholder="ID lección" 
                    className={`bg-black border border-gray-700 p-2.5 rounded text-white text-sm ${isEditingLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={newLesson.id} onChange={e => !isEditingLesson && setNewLesson({...newLesson, id: e.target.value})}
                    required
                    disabled={isEditingLesson}
                  />
                  <input 
                    placeholder="Título de la clase" 
                    className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm"
                    value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="YouTube Video ID" 
                    className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm"
                    value={newLesson.video_id} onChange={e => setNewLesson({...newLesson, video_id: e.target.value})}
                  />
                  <input 
                    placeholder="URL Markdown (Storage)" 
                    className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm"
                    value={newLesson.markdown_url} onChange={e => setNewLesson({...newLesson, markdown_url: e.target.value})}
                  />
                  <input 
                    type="number" placeholder="Orden" 
                    className="bg-black border border-gray-700 p-2.5 rounded text-white text-sm"
                    value={newLesson.order_index} onChange={e => setNewLesson({...newLesson, order_index: parseInt(e.target.value)})}
                  />
                  <div className="flex flex-col gap-2">
                    <button className={`font-bold py-2 rounded-lg transition-colors text-white ${isEditingLesson ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}>
                      {isEditingLesson ? 'Actualizar Lección' : 'Guardar Lección'}
                    </button>
                    {isEditingLesson && (
                      <button 
                        type="button" 
                        onClick={() => { setIsEditingLesson(false); openLessonsEditor(editingCourse); }}
                        className="text-gray-400 text-xs hover:text-white underline py-1"
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>
                </form>

                {/* Lista de Lecciones con botón Editar */}
                <div className="lg:col-span-2 space-y-3">
                  {courseLessons.map((lesson) => (
                    <div key={lesson.id} className="bg-black border border-gray-800 p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <span className="text-blue-500 font-bold">#{lesson.order_index}</span>
                        <div>
                          <h5 className="text-white font-medium">{lesson.title}</h5>
                          <p className="text-[10px] text-gray-500 font-mono">{lesson.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => startEditLesson(lesson)}
                          className="text-gray-500 hover:text-blue-400 transition-colors p-2"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-gray-600 hover:text-red-500 transition-colors p-2"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO: ESTUDIANTES */}
      {activeTab === 'users' && (
        <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Email</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="p-4 font-medium text-white">{u.full_name}</td>
                  <td className="p-4 text-sm">{u.email || 'N/A'}</td>
                  <td className="p-4">
                    {u.is_active ? 
                      <span className="text-green-500 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase">Activo</span> : 
                      <span className="text-gray-500 text-[10px] font-bold bg-gray-500/10 px-2 py-0.5 rounded border border-gray-500/20 uppercase">Inactivo</span>
                    }
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleUserStatus(u.id, u.is_active)}
                      className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all ${u.is_active ? 'bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/40' : 'bg-blue-900/20 text-blue-400 border border-blue-900/30 hover:bg-blue-900/40'}`}
                    >
                      {u.is_active ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
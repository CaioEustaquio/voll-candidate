/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  plan: string;
  created_at: string;
}

interface Schedule {
  id: number;
  studentId: number;
  student: Student;
  dateTime: string;
  notes: string;
  status: string;
  created_at: string;
}

export default function App() {
  const [view, setView] = useState<'dashboard' | 'agenda'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Mensal',
    status: 'Ativo'
  });

  const [newSchedule, setNewSchedule] = useState({
    studentId: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchSchedules();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}. Body: ${text.substring(0, 100)}...`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}. Body: ${text.substring(0, 100)}...`);
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (response.ok) {
        fetchStudents();
        setIsModalOpen(false);
        setNewStudent({ name: '', email: '', phone: '', plan: 'Mensal', status: 'Ativo' });
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${newSchedule.date}T${newSchedule.time}`).toISOString();
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: newSchedule.studentId,
          dateTime,
          notes: newSchedule.notes
        })
      });
      if (response.ok) {
        fetchSchedules();
        setIsAgendaModalOpen(false);
        setNewSchedule({ studentId: '', date: '', time: '', notes: '' });
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'Ativo').length,
    trial: students.filter(s => s.status === 'Experimental').length,
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-900">VOLL Candidate</h1>
          </div>
          
          <nav className="space-y-1">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={view === 'dashboard'} 
              onClick={() => setView('dashboard')}
            />
            <NavItem 
              icon={<Calendar size={20} />} 
              label="Agenda" 
              active={view === 'agenda'} 
              onClick={() => setView('agenda')}
            />
            <NavItem icon={<TrendingUp size={20} />} label="Financeiro" disabled />
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-100">
          <NavItem icon={<Settings size={20} />} label="Configurações" />
          <NavItem icon={<LogOut size={20} />} label="Sair" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar alunos..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Novo Aluno
          </button>
        </header>

        {/* Main Content Area */}
        <div className="p-8 overflow-y-auto">
          {view === 'dashboard' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Bem-vindo ao VOLL</h2>
                <p className="text-slate-500 text-sm">Gerencie seus alunos e acompanhe o crescimento do seu studio.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                  label="Total de Alunos" 
                  value={stats.total} 
                  icon={<Users className="text-blue-600" />} 
                  trend="+12% este mês"
                />
                <StatCard 
                  label="Alunos Ativos" 
                  value={stats.active} 
                  icon={<CheckCircle2 className="text-emerald-600" />} 
                  trend="94% de retenção"
                />
                <StatCard 
                  label="Aulas Experimentais" 
                  value={stats.trial} 
                  icon={<Clock className="text-amber-600" />} 
                  trend="3 pendentes"
                />
              </div>

              {/* Student List Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Lista de Alunos</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Todos</span>
                    <span className="px-3 py-1 text-slate-400 rounded-full text-xs font-medium hover:bg-slate-50 cursor-pointer">Ativos</span>
                    <span className="px-3 py-1 text-slate-400 rounded-full text-xs font-medium hover:bg-slate-50 cursor-pointer">Inativos</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Aluno</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Plano</th>
                        <th className="px-6 py-4 font-semibold">Contato</th>
                        <th className="px-6 py-4 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Carregando alunos...</td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhum aluno encontrado.</td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">{student.name}</p>
                                  <p className="text-xs text-slate-500">Desde {new Date(student.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={student.status} />
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-600">{student.plan}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Phone size={12} /> {student.phone}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Mail size={12} /> {student.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">Agenda de Aulas</h2>
                  <p className="text-slate-500 text-sm">Organize os horários dos seus alunos.</p>
                </div>
                <button 
                  onClick={() => setIsAgendaModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  Agendar Aula
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Clock size={18} className="text-emerald-600" />
                    Próximas Aulas
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    {schedules.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">Nenhum agendamento encontrado.</div>
                    ) : (
                      schedules.map((schedule) => (
                        <div key={schedule.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {new Date(schedule.dateTime).toLocaleDateString('pt-BR', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold text-slate-800 leading-none">
                                {new Date(schedule.dateTime).getDate()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{schedule.student.name}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> 
                                  {new Date(schedule.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {schedule.notes && <span className="italic">"{schedule.notes}"</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={schedule.status} />
                            <button 
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Calendar Placeholder / Stats */}
                <div className="space-y-6">
                  <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20">
                    <h4 className="font-bold mb-4">Resumo da Semana</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-300">Total de Aulas</span>
                        <span className="font-bold">{schedules.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-300">Experimental</span>
                        <span className="font-bold">{schedules.filter(s => s.student.status === 'Experimental').length}</span>
                      </div>
                      <div className="w-full h-1 bg-emerald-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-2/3" />
                      </div>
                      <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">65% da capacidade atingida</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Novo Aluno</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ex: João Silva"
                    value={newStudent.name}
                    onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="joao@email.com"
                      value={newStudent.email}
                      onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="(11) 99999-9999"
                      value={newStudent.phone}
                      onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plano</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newStudent.plan}
                    onChange={e => setNewStudent({...newStudent, plan: e.target.value})}
                  >
                    <option>Mensal</option>
                    <option>Trimestral</option>
                    <option>Semestral</option>
                    <option>Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Inicial</label>
                  <div className="flex gap-2">
                    {['Ativo', 'Experimental'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewStudent({...newStudent, status})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          newStudent.status === status 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Cadastrar Aluno
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Agenda Modal */}
      <AnimatePresence>
        {isAgendaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAgendaModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Novo Agendamento</h3>
                <button onClick={() => setIsAgendaModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddSchedule} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aluno</label>
                  <select 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newSchedule.studentId}
                    onChange={e => setNewSchedule({...newSchedule, studentId: e.target.value})}
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newSchedule.date}
                      onChange={e => setNewSchedule({...newSchedule, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horário</label>
                    <input 
                      required
                      type="time" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newSchedule.time}
                      onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ex: Focar em alongamento"
                    rows={3}
                    value={newSchedule.notes}
                    onChange={e => setNewSchedule({...newSchedule, notes: e.target.value})}
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} />
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, disabled = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, disabled?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`
      flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all group
      ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
      ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}
    `}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {active && <ChevronRight size={14} />}
      {disabled && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Em breve</span>}
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string, value: number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <h4 className="text-3xl font-bold text-slate-800">{value}</h4>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    'Ativo': 'bg-emerald-100 text-emerald-700',
    'Experimental': 'bg-amber-100 text-amber-700',
    'Inativo': 'bg-slate-100 text-slate-700',
  }[status] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  );
}

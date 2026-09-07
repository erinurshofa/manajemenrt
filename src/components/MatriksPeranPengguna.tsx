import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Key,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  Code2,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Sparkles,
  Info,
  Crown,
  FileText,
  Wallet,
  User,
} from 'lucide-react';
import { UserCredential, UserRole, UserSession, ProfilRt } from '../types';
import {
  ROLE_DEFINITIONS,
  PERMISSION_MATRIX_DATA,
  isDeveloper,
  isAdminOrLeader,
} from '../utils/permissions';
import { generateDummyCredentials } from '../utils/dummyDataGenerator';

interface MatriksPeranPenggunaProps {
  credentials: UserCredential[];
  onTambahCredential: (cred: UserCredential) => void;
  onEditCredential: (cred: UserCredential) => void;
  onHapusCredential: (nik: string) => void;
  currentUser?: UserSession | null;
  profilRt: ProfilRt;
  isSupabaseConnected?: boolean;
  totalWarga: number;
  totalKk: number;
  totalKas: number;
}

export const MatriksPeranPengguna: React.FC<MatriksPeranPenggunaProps> = ({
  credentials,
  onTambahCredential,
  onEditCredential,
  onHapusCredential,
  currentUser,
  profilRt,
  isSupabaseConnected = false,
  totalWarga,
  totalKk,
  totalKas,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'users' | 'developer'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Modal State Tambah / Edit Akun
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<UserCredential | null>(null);
  const [formNik, setFormNik] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('warga');
  const [formJabatan, setFormJabatan] = useState('');
  const [formNoHp, setFormNoHp] = useState('');
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isUserDev = isDeveloper(currentUser?.role);
  const isLeader = isAdminOrLeader(currentUser?.role);

  // Filter daftar akun
  const filteredCredentials = useMemo(() => {
    return credentials.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.nik.toLowerCase().includes(q) ||
        c.nama.toLowerCase().includes(q) ||
        (c.jabatan && c.jabatan.toLowerCase().includes(q));

      const matchRole = filterRole === 'all' || c.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [credentials, searchQuery, filterRole]);

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingCred(null);
    setFormNik('');
    setFormPassword('');
    setFormNama('');
    setFormRole('warga');
    setFormJabatan('');
    setFormNoHp('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Generate Akun Pengguna untuk Setiap Peran
  const handleGenerateAllRoles = () => {
    if (confirm('Generate otomatis akun pengguna untuk seluruh 7 peran (Developer, Ketua RT, Sekretaris, Bendahara, Pengurus, Warga, dan Admin)? Akun dengan NIK yang sudah ada tidak akan diduplikasi.')) {
      const dummyCreds = generateDummyCredentials();
      let addedCount = 0;
      dummyCreds.forEach(dc => {
        const exists = credentials.some(c => c.nik.toLowerCase() === dc.nik.toLowerCase());
        if (!exists) {
          onTambahCredential(dc);
          addedCount++;
        }
      });
      alert(`Berhasil menambahkan ${addedCount} akun peran baru! Silakan gunakan untuk login pengujian.`);
    }
  };

  // Buka Modal Edit
  const handleOpenEdit = (cred: UserCredential) => {
    setEditingCred(cred);
    setFormNik(cred.nik);
    setFormPassword(cred.password);
    setFormNama(cred.nama);
    setFormRole(cred.role);
    setFormJabatan(cred.jabatan || '');
    setFormNoHp(cred.noHp || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Form Akun
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanNik = formNik.trim().toLowerCase();
    const cleanPassword = formPassword.trim();
    const cleanNama = formNama.trim();

    if (!cleanNik || !cleanPassword || !cleanNama) {
      setFormError('NIK/Username, Kata Sandi, dan Nama Lengkap wajib diisi.');
      return;
    }

    // Validasi Keamanan: Hanya Developer yang boleh membuat atau mengubah peran ke Developer
    if (formRole === 'developer' && !isUserDev) {
      setFormError('Akses ditolak: Hanya akun Developer yang memiliki wewenang menetapkan peran Developer.');
      return;
    }

    // Cek duplikasi jika menambah akun baru
    if (!editingCred) {
      const exists = credentials.some(c => c.nik.toLowerCase() === cleanNik);
      if (exists) {
        setFormError(`Username/NIK "${cleanNik}" sudah terdaftar. Gunakan username lain.`);
        return;
      }
    }

    const payload: UserCredential = {
      id: editingCred?.id || `cred-${Date.now()}`,
      nik: cleanNik,
      password: cleanPassword,
      nama: cleanNama,
      role: formRole,
      jabatan: formJabatan.trim() || ROLE_DEFINITIONS[formRole]?.title || 'Warga RT',
      noHp: formNoHp.trim() || undefined,
      createdAt: editingCred?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingCred) {
      onEditCredential(payload);
    } else {
      onTambahCredential(payload);
    }

    setIsModalOpen(false);
  };

  // Hapus akun dengan proteksi dinamis
  const handleDelete = (cred: UserCredential) => {
    if (currentUser?.nik && cred.nik.toLowerCase() === currentUser.nik.toLowerCase()) {
      alert('Anda tidak dapat menghapus akun yang sedang Anda gunakan untuk login saat ini.');
      return;
    }
    const adminCount = credentials.filter(c => c.role === 'developer' || c.role === 'ketua_rt' || c.role === 'admin').length;
    if ((cred.role === 'developer' || cred.role === 'ketua_rt' || cred.role === 'admin') && adminCount <= 1) {
      alert('Tidak dapat menghapus satu-satunya akun Administrator / Developer yang tersisa di sistem.');
      return;
    }
    if (confirm(`Yakin ingin menghapus akun "${cred.nama}" (${cred.nik})? Pengguna ini tidak akan bisa login lagi.`)) {
      onHapusCredential(cred.nik);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'developer':
        return <Code2 className="w-4 h-4 text-rose-600" />;
      case 'ketua_rt':
      case 'admin':
        return <Crown className="w-4 h-4 text-amber-600" />;
      case 'sekretaris':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'bendahara':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'pengurus':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-gradient-to-r from-[#2c1810] via-[#3a2014] to-[#1f110b] text-amber-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role-Based Access Control (RBAC) & Dev Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
              Matriks Hak Akses Peran & Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-2xl leading-relaxed">
              Standar tata kelola wewenang berjenjang untuk Developer, Pimpinan RT, Sekretariat, Bendahara, Pengurus Seksi, dan Penduduk Warga.
            </p>
          </div>

          {/* Tab Navigasi Internal */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'matrix'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Matriks Akses</span>
            </button>

            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'users'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kelola Akun ({credentials.length})</span>
            </button>

            {isUserDev && (
              <button
                onClick={() => setActiveSubTab('developer')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeSubTab === 'developer'
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'text-rose-300/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Dev Diagnostics</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: MATRIKS HAK AKSES PERAN */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* Kartu Ringkasan Peran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ROLE_DEFINITIONS)
              .filter(r => r.role !== 'admin')
              .map(roleItem => (
                <div
                  key={roleItem.role}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                        {getRoleIcon(roleItem.role)}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm">{roleItem.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleItem.badgeClass}`}>
                          {roleItem.badgeLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {roleItem.description}
                  </p>
                </div>
              ))}
          </div>

          {/* Tabel Matriks Hak Akses Peran */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-50/50">
              <div>
                <h3 className="font-bold text-stone-900 text-base">Tabel Matriks Hak Akses Modul</h3>
                <p className="text-xs text-stone-500">
                  Pembatasan fungsi Create, Read, Update, Delete, Export, dan Pengesahan antar-modul
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Modul Sistem</th>
                    <th className="py-3.5 px-3">Kategori</th>
                    <th className="py-3.5 px-3 text-rose-800">🛠️ Developer</th>
                    <th className="py-3.5 px-3 text-amber-900">👑 Ketua RT</th>
                    <th className="py-3.5 px-3 text-blue-900">📝 Sekretaris</th>
                    <th className="py-3.5 px-3 text-emerald-900">💰 Bendahara</th>
                    <th className="py-3.5 px-3 text-purple-900">👥 Pengurus</th>
                    <th className="py-3.5 px-3 text-stone-800">🏡 Warga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {PERMISSION_MATRIX_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <div>{row.modul}</div>
                        <div className="text-[10px] font-normal text-stone-500">{row.deskripsi}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-semibold">
                          {row.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-rose-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                          {row.developer}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-amber-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                          {row.ketua_rt}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-blue-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                          {row.sekretaris}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-emerald-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                          {row.bendahara}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-purple-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                          {row.pengurus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-stone-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-stone-100">
                          {row.warga}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MANAJEMEN PENGGUNA & KREDENSIAL */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Top Controls: Search, Filter, & Tambah Akun */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari NIK, nama, atau jabatan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-100 border-none rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-stone-100 border-none rounded-xl text-xs text-stone-700 font-semibold focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Semua Peran ({credentials.length})</option>
                <option value="developer">Developer / Superadmin</option>
                <option value="ketua_rt">Ketua RT</option>
                <option value="sekretaris">Sekretaris</option>
                <option value="bendahara">Bendahara</option>
                <option value="pengurus">Pengurus Bidang</option>
                <option value="warga">Warga</option>
              </select>
            </div>

            {isLeader && (
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerateAllRoles}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="Generate otomatis akun pengguna untuk setiap peran"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Generate Akun Semua Peran</span>
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Akun Pengguna</span>
                </button>
              </div>
            )}
          </div>

          {/* Daftar Pengguna */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-3">Username / NIK</th>
                    <th className="py-3 px-3">Peran (Role)</th>
                    <th className="py-3 px-3">Jabatan</th>
                    <th className="py-3 px-3">Kata Sandi</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCredentials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-500">
                        Tidak ada akun pengguna yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredCredentials.map(cred => {
                      const roleMeta = ROLE_DEFINITIONS[cred.role] || ROLE_DEFINITIONS.warga;

                      return (
                        <tr key={cred.nik} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                                {cred.nama.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-stone-900">{cred.nama}</div>
                                <div className="text-[10px] text-stone-500">{cred.noHp || 'No. HP belum diatur'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono font-semibold text-stone-700">
                            {cred.nik}
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleMeta.badgeClass}`}>
                              {roleMeta.badgeLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-stone-700 font-medium whitespace-nowrap">
                            {cred.jabatan || roleMeta.title}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-stone-500">
                            {isLeader ? (
                              <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                                {cred.password}
                              </span>
                            ) : (
                              <span>••••••••</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {isLeader && (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(cred)}
                                  className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-100/50 rounded-lg transition-colors cursor-pointer"
                                  title="Ubah Akun / Password"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(cred)}
                                  className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-100/50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Akun"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DEVELOPER & DIAGNOSTICS HUB */}
      {activeSubTab === 'developer' && isUserDev && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Cloud Supabase</span>
                <Database className={`w-4 h-4 ${isSupabaseConnected ? 'text-emerald-600' : 'text-stone-400'}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                <span className="font-black text-stone-900 text-lg">
                  {isSupabaseConnected ? 'Tersambung' : 'Mode Offline'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Realtime PostgreSQL sync active</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Akun Auth</span>
                <Key className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-stone-900">{credentials.length}</p>
              <p className="text-[11px] text-stone-500 mt-1">Akun RBAC aktif di sistem</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Rekord Data Warga</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-stone-900">{totalWarga} <span className="text-xs font-normal text-stone-500">Jiwa ({totalKk} KK)</span></p>
              <p className="text-[11px] text-stone-500 mt-1">Buku induk kependudukan</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Transaksi Kas</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-stone-900">{totalKas}</p>
              <p className="text-[11px] text-stone-500 mt-1">Baris pembukuan keuangan</p>
            </div>
          </div>

          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <Code2 className="w-4 h-4" />
              <span>Developer Environment Variables Status</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                <span className="text-stone-400 block mb-1">VITE_APP_URL:</span>
                <span className="text-emerald-400">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                <span className="text-stone-400 block mb-1">Google OAuth Client ID:</span>
                <span className="text-emerald-400">Terkonfigurasi via .env</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                <span className="text-stone-400 block mb-1">Penyimpanan Utama:</span>
                <span className="text-amber-300">Supabase Cloud + IndexedDB Fallback</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                <span className="text-stone-400 block mb-1">Versi Aplikasi:</span>
                <span className="text-amber-300">v2.4.0 (RBAC Multi-Role Edition)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT PENGGUNA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-900/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    {editingCred ? 'Ubah Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <p className="text-[11px] text-stone-500">Kredensial login dan pembagian hak akses</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Username / NIK */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Username / NIK Akun *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: nama_pengguna atau NIK warga"
                  value={formNik}
                  disabled={!!editingCred}
                  onChange={e => setFormNik(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    editingCred ? 'bg-stone-100 text-stone-500 cursor-not-allowed' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Nama Lengkap Pemilik Akun *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama pemegang akun"
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Kata Sandi */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Kata Sandi (Password) *
                </label>
                <div className="relative">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Peran / Role */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Peran & Hak Akses (Role) *
                </label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer bg-white"
                >
                  {isUserDev && (
                    <option value="developer">🛠️ Developer / Superadmin (Full Root)</option>
                  )}
                  <option value="ketua_rt">👑 Ketua RT (Pimpinan & Approval)</option>
                  <option value="sekretaris">📝 Sekretaris RT (Admin Kependudukan)</option>
                  <option value="bendahara">💰 Bendahara RT (Admin Keuangan & Kas)</option>
                  <option value="pengurus">👥 Pengurus Bidang / Seksi RT</option>
                  <option value="warga">🏡 Warga Lingkungan RT</option>
                </select>
                <p className="text-[10px] text-stone-500 mt-1">
                  {ROLE_DEFINITIONS[formRole]?.description}
                </p>
              </div>

              {/* Jabatan Struktural */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Jabatan Struktural (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Bendahara 1 atau Seksi Keamanan"
                  value={formJabatan}
                  onChange={e => setFormJabatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Tombol Simpan */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 transition-all shadow-sm active:scale-95"
                >
                  {editingCred ? 'Perbarui Akun' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

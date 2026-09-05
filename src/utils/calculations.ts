import { Warga, KartuKeluargaData, RekapitulasiBulanan, MutasiRecord } from '../types';

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function hitungUsia(tanggalLahir: string, referenceDate: Date = new Date()): number {
  if (!tanggalLahir) return 0;
  const birth = new Date(tanggalLahir);
  if (isNaN(birth.getTime())) return 0;
  
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const m = referenceDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = NAMA_BULAN[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatBulanTahun(tahun: number, bulan: number): string {
  return `${NAMA_BULAN[bulan - 1]} ${tahun}`;
}

export function kelompokkanPerKk(daftarWarga: Warga[]): KartuKeluargaData[] {
  const mapKk = new Map<string, Warga[]>();

  // Filter out citizens who moved away or died, or keep active ones in the KK representation
  const activeWarga = daftarWarga.filter(w => w.statusKehidupan === 'Hidup');

  for (const w of activeWarga) {
    const existing = mapKk.get(w.noKk) || [];
    existing.push(w);
    mapKk.set(w.noKk, existing);
  }

  const result: KartuKeluargaData[] = [];

  mapKk.forEach((anggota, noKk) => {
    // Sort anggota: Kepala Keluarga first, then Istri, then Anak, then others
    const sortPriority: Record<string, number> = {
      'KEPALA KELUARGA': 1,
      'ISTRI': 2,
      'ANAK': 3,
      'ORANG TUA': 4,
      'FAMILI LAIN': 5,
      'LAINNYA': 6,
    };

    const sortedAnggota = [...anggota].sort((a, b) => {
      const pA = sortPriority[a.hubunganKeluarga] || 99;
      const pB = sortPriority[b.hubunganKeluarga] || 99;
      if (pA !== pB) return pA - pB;
      return a.tanggalLahir.localeCompare(b.tanggalLahir);
    });

    const kepalaKeluarga = sortedAnggota.find(w => w.hubunganKeluarga === 'KEPALA KELUARGA') || sortedAnggota[0] || null;
    const sample = kepalaKeluarga || sortedAnggota[0];

    result.push({
      noKk,
      kepalaKeluarga,
      alamat: sample ? sample.alamat : '-',
      rt: sample ? sample.rt : '02',
      rw: sample ? sample.rw : '04',
      anggota: sortedAnggota,
    });
  });

  return result.sort((a, b) => {
    const nameA = a.kepalaKeluarga?.nama || '';
    const nameB = b.kepalaKeluarga?.nama || '';
    return nameA.localeCompare(nameB);
  });
}

/**
 * Otomatis menghitung Rekapitulasi Data Penduduk Bulanan
 * Memeriksa status warga pada awal bulan dan mutasi (lahir, mati, datang, pindah) pada bulan terpilih
 */
export function hitungRekapitulasiBulanan(
  daftarWarga: Warga[],
  daftarMutasi: MutasiRecord[],
  tahun: number,
  bulan: number // 1-12
): RekapitulasiBulanan {
  // Start of target month: YYYY-MM-01
  const targetYearMonth = `${tahun}-${String(bulan).padStart(2, '0')}`;
  const startOfNextMonth = bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;
  const startOfCurrentMonth = `${targetYearMonth}-01`;
  const refDateForAge = new Date(tahun, bulan - 1, 28);

  // Filter mutasi bulan ini
  const mutasiBulanIni = daftarMutasi.filter(m => m.tanggal.startsWith(targetYearMonth));

  let lahirLaki = 0;
  let lahirPerempuan = 0;
  let masukLaki = 0;
  let masukPerempuan = 0;
  let matiLaki = 0;
  let matiPerempuan = 0;
  let keluarLaki = 0;
  let keluarPerempuan = 0;

  for (const m of mutasiBulanIni) {
    const isLaki = m.jenisKelamin === 'L';
    switch (m.jenisMutasi) {
      case 'Lahir':
        if (isLaki) lahirLaki++;
        else lahirPerempuan++;
        break;
      case 'Pindah_Masuk':
        if (isLaki) masukLaki++;
        else masukPerempuan++;
        break;
      case 'Meninggal':
        if (isLaki) matiLaki++;
        else matiPerempuan++;
        break;
      case 'Pindah_Keluar':
        if (isLaki) keluarLaki++;
        else keluarPerempuan++;
        break;
    }
  }

  // Penduduk akhir bulan adalah yang terdaftar sebelum/pada bulan ini dan masih hidup & tidak pindah pada akhir bulan
  const pendudukAkhir = daftarWarga.filter(w => {
    // Terdaftar sampai akhir bulan ini
    if (w.tanggalDaftar >= startOfNextMonth) return false;

    // Jika meninggal atau pindah keluar, cek apakah terjadi setelah bulan ini
    if (w.statusKehidupan !== 'Hidup') {
      if (w.tanggalMutasi && w.tanggalMutasi >= startOfNextMonth) {
        // Masih hidup/berada di RT pada akhir bulan target
        return true;
      }
      // Sudah meninggal/pindah sebelum atau pada akhir bulan target
      return false;
    }
    return true;
  });

  let akhirLaki = 0;
  let akhirPerempuan = 0;
  let balitaL = 0;
  let balitaP = 0;
  let anakL = 0;
  let anakP = 0;
  let produktifL = 0;
  let produktifP = 0;
  let lansiaL = 0;
  let lansiaP = 0;

  const activeKkSet = new Set<string>();

  for (const w of pendudukAkhir) {
    activeKkSet.add(w.noKk);
    const usia = hitungUsia(w.tanggalLahir, refDateForAge);
    const isLaki = w.jenisKelamin === 'L';

    if (isLaki) {
      akhirLaki++;
      if (usia < 5) balitaL++;
      else if (usia < 18) anakL++;
      else if (usia < 60) produktifL++;
      else lansiaL++;
    } else {
      akhirPerempuan++;
      if (usia < 5) balitaP++;
      else if (usia < 18) anakP++;
      else if (usia < 60) produktifP++;
      else lansiaP++;
    }
  }

  const tambahLaki = lahirLaki + masukLaki;
  const tambahPerempuan = lahirPerempuan + masukPerempuan;
  const kurangLaki = matiLaki + keluarLaki;
  const kurangPerempuan = matiPerempuan + keluarPerempuan;

  // Formula Kependudukan: Penduduk Akhir = Penduduk Awal + Tambah - Kurang
  // Sehingga: Penduduk Awal = Penduduk Akhir - Tambah + Kurang
  const awalLaki = Math.max(0, akhirLaki - tambahLaki + kurangLaki);
  const awalPerempuan = Math.max(0, akhirPerempuan - tambahPerempuan + kurangPerempuan);

  return {
    periodeBulan: bulan,
    periodeTahun: tahun,
    namaBulan: NAMA_BULAN[bulan - 1],

    awalLaki,
    awalPerempuan,
    awalTotal: awalLaki + awalPerempuan,

    lahirLaki,
    lahirPerempuan,
    lahirTotal: lahirLaki + lahirPerempuan,

    masukLaki,
    masukPerempuan,
    masukTotal: masukLaki + masukPerempuan,

    matiLaki,
    matiPerempuan,
    matiTotal: matiLaki + matiPerempuan,

    keluarLaki,
    keluarPerempuan,
    keluarTotal: keluarLaki + keluarPerempuan,

    akhirLaki,
    akhirPerempuan,
    akhirTotal: akhirLaki + akhirPerempuan,

    totalKk: activeKkSet.size,

    balitaL,
    balitaP,
    anakL,
    anakP,
    produktifL,
    produktifP,
    lansiaL,
    lansiaP,

    daftarMutasi: mutasiBulanIni,
  };
}

export function unduhCsv(daftarWarga: Warga[], namaFile: string = 'data-warga-rt.csv') {
  const header = [
    'No',
    'No KK',
    'NIK',
    'Nama Lengkap',
    'Hubungan Keluarga',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Usia',
    'Agama',
    'Status Perkawinan',
    'Pekerjaan',
    'Alamat',
    'RT/RW',
    'Status Kependudukan',
    'Status Kehidupan',
    'No HP'
  ];

  const rows = daftarWarga.map((w, index) => [
    index + 1,
    `'${w.noKk}`,
    `'${w.nik}`,
    `"${w.nama.replace(/"/g, '""')}"`,
    w.hubunganKeluarga,
    w.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    `"${w.tempatLahir}"`,
    w.tanggalLahir,
    hitungUsia(w.tanggalLahir),
    w.agama,
    w.statusPerkawinan,
    `"${w.pekerjaan}"`,
    `"${w.alamat.replace(/"/g, '""')}"`,
    `RT ${w.rt} / RW ${w.rw}`,
    w.statusKependudukan,
    w.statusKehidupan,
    w.noHp ? `'${w.noHp}` : '-'
  ]);

  const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', namaFile);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

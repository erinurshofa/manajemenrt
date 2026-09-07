import React from 'react';
import { TransaksiKas } from '../../types';
import { TrendingUp, TrendingDown, Eye, Trash2, Receipt } from 'lucide-react';
import { useConfirm } from '../../context/NotificationContext';

interface KasTableProps {
  filteredKas: TransaksiKas[];
  isAdmin: boolean;
  onHapusKas: (id: string) => void;
  onPreviewBukti: (bukti: { url: string; nama: string }) => void;
  formatRupiah: (angka: number) => string;
  totalPemasukanFiltered: number;
  totalPengeluaranFiltered: number;
}

export const KasTable: React.FC<KasTableProps> = ({
  filteredKas,
  isAdmin,
  onHapusKas,
  onPreviewBukti,
  formatRupiah,
  totalPemasukanFiltered,
  totalPengeluaranFiltered,
}) => {
  const confirmDialog = useConfirm();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Tanggal & No. Bukti</th>
              <th className="py-3.5 px-4">Arus</th>
              <th className="py-3.5 px-4">Kategori</th>
              <th className="py-3.5 px-4">Keterangan & Pihak</th>
              <th className="py-3.5 px-4 text-right">Nominal</th>
              <th className="py-3.5 px-4 text-center">Bukti / Nota</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredKas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">Belum ada transaksi kas pada periode ini</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Klik "Catat Transaksi Kas" untuk membukukan pemasukan atau pengeluaran baru.
                  </p>
                </td>
              </tr>
            ) : (
              filteredKas.map(t => {
                const isPemasukan = t.jenis === 'PEMASUKAN';
                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Tanggal & No. Bukti */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{t.tanggal}</div>
                      <div className="text-[11px] font-mono text-slate-400">{t.nomorBukti || '-'}</div>
                    </td>

                    {/* Arus Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isPemasukan ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <TrendingUp className="w-3 h-3" />
                          <span>Pemasukan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <TrendingDown className="w-3 h-3" />
                          <span>Pengeluaran</span>
                        </span>
                      )}
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {t.kategori}
                    </td>

                    {/* Keterangan & Warga */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium line-clamp-2">{t.keterangan}</div>
                      {(t.namaWarga || t.noKk) && (
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
                          {t.namaWarga && (
                            <span className="font-semibold text-blue-700">{t.namaWarga}</span>
                          )}
                          {t.noKk && <span className="font-mono">({t.noKk})</span>}
                        </div>
                      )}
                    </td>

                    {/* Nominal */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold font-mono text-sm ${
                          isPemasukan ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPemasukan ? '+' : '-'} {formatRupiah(t.nominal)}
                      </span>
                    </td>

                    {/* Bukti Nota Attachment */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {t.fileBukti ? (
                        <button
                          onClick={() =>
                            onPreviewBukti({
                              url: t.fileBukti!,
                              nama: t.fileBuktiNama || 'Bukti Transaksi',
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                          title="Lihat lampiran bukti kwitansi/nota"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lampiran</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">-</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isAdmin ? (
                        <button
                          onClick={async () => {
                            const setuju = await confirmDialog({
                              title: 'Hapus Transaksi Kas',
                              message: `Apakah Anda yakin ingin menghapus catatan transaksi "${t.keterangan}" (${formatRupiah(t.jumlah)})?`,
                              variant: 'danger',
                              confirmText: 'Ya, Hapus Transaksi',
                              cancelText: 'Batal',
                            });
                            if (setuju) {
                              onHapusKas(t.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus transaksi ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredKas.length > 0 && (
            <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-xs text-slate-900">
              <tr>
                <td colSpan={4} className="py-3 px-4">
                  TOTAL PERIODE INI ({filteredKas.length} Transaksi)
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  <div className="text-emerald-700">Masuk: +{formatRupiah(totalPemasukanFiltered)}</div>
                  <div className="text-rose-700">Keluar: -{formatRupiah(totalPengeluaranFiltered)}</div>
                  <div className="text-slate-900 pt-1 border-t border-slate-200">
                    Selisih: {formatRupiah(totalPemasukanFiltered - totalPengeluaranFiltered)}
                  </div>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

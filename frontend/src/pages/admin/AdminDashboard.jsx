import { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Topbar from "../../components/layout/Topbar";
import Card from "../../components/common/Card";
import KpiCard from "../../components/common/KpiCard";
import Button from "../../components/common/Button";
import {
  pb,
  COLLECTIONS,
  ROOM_FIELDS,
  RESERVATION_FIELDS,
  RESERVATION_STATUS,
} from "../../services/pocketbase";

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({ month: 0, occupancy: 0, rooms: 0, processed: 0 });
  const [byDay, setByDay] = useState(new Array(7).fill(0));
  const [byHour, setByHour] = useState([]);
  const [topRooms, setTopRooms] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    if (!exportMenuOpen) return;
    const close = () => setExportMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [exportMenuOpen]);

  async function loadStats() {
    setLoadError(null);
    try {
      const rooms = await pb.collection(COLLECTIONS.ROOMS).getFullList();
      const reservations = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
        expand: RESERVATION_FIELDS.room,
      });

      const now = new Date();
      const thisMonth = reservations.filter((r) => {
        const d = new Date(r[RESERVATION_FIELDS.start]);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const processed = reservations.filter(
        (r) => r[RESERVATION_FIELDS.status] !== RESERVATION_STATUS.PENDING
      ).length;

      // Réservations par jour de la semaine (Lun=0 ... Dim=6)
      const dayCounts = new Array(7).fill(0);
      reservations.forEach((r) => {
        const d = new Date(r[RESERVATION_FIELDS.start]);
        const idx = (d.getDay() + 6) % 7;
        dayCounts[idx] += 1;
      });
      const maxDay = Math.max(...dayCounts, 1);
      setByDay(dayCounts.map((c) => Math.round((c / maxDay) * 100)));

      // Heures de pointe (8h -> 18h)
      const hourBuckets = {};
      for (let h = 8; h <= 18; h++) hourBuckets[h] = 0;
      reservations.forEach((r) => {
        const startVal = r[RESERVATION_FIELDS.start];
        if (!startVal) return;
        const hour = new Date(startVal).getHours();
        if (hourBuckets[hour] !== undefined) hourBuckets[hour] += 1;
      });
      const maxHour = Math.max(...Object.values(hourBuckets), 1);
      setByHour(
        Object.entries(hourBuckets).map(([h, c]) => ({
          hour: `${h}h`,
          pct: Math.round((c / maxHour) * 100),
        }))
      );

      // Salles les plus utilisées
      const usage = {};
      reservations.forEach((r) => {
        const name = r.expand?.[RESERVATION_FIELDS.room]?.[ROOM_FIELDS.name] || "Salle";
        usage[name] = (usage[name] || 0) + 1;
      });
      const sorted = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const maxUsage = sorted[0]?.[1] || 1;

      setKpis({
        month: thisMonth.length,
        occupancy: rooms.length
          ? Math.round((reservations.length / (rooms.length * 20)) * 100)
          : 0,
        rooms: rooms.length,
        processed,
      });
      setTopRooms(
        sorted.map(([name, count]) => ({
          name,
          count,
          pct: Math.round((count / maxUsage) * 100),
        }))
      );
    } catch (err) {
      setLoadError(
        err?.data?.message ||
          err?.message ||
          "Impossible de charger les statistiques depuis PocketBase."
      );
    }
  }

  // ---------- Helpers export ----------
  function buildRows(reservations) {
    return reservations.map((r) => {
      const room = r.expand?.salle;
      const user = r.expand?.utilisateur;

      const start = r.debut ? new Date(r.debut) : null;
      const end = r.fin ? new Date(r.fin) : null;

      const pad = (n) => String(n).padStart(2, "0");
      const formatDate = (d) =>
        d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";
      const formatTime = (d) =>
        d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : "";

      const demandeur =
        [user?.nom, user?.prenom].filter(Boolean).join(" ") ||
        user?.email ||
        "";

      return {
        Salle: room?.nom || "",
        Date: formatDate(start),
        Debut: formatTime(start),
        Fin: formatTime(end),
        Statut: r.statut || "",
        Motif: r.motif || "",
        Demandeur: demandeur,
        Email: user?.email || "",
      };
    });
  }

  async function fetchReservations() {
    return pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
      expand: "utilisateur,salle",
      sort: "-debut",
    });
  }

  // ---------- Export Excel ----------
  async function exportExcel() {
    setIsExporting(true);
    setLoadError(null);
    setExportMenuOpen(false);
    try {
      const reservations = await fetchReservations();
      const rows = buildRows(reservations);

      const data =
        rows.length > 0
          ? rows
          : [{
              Salle: "", Date: "", Debut: "", Fin: "",
              Statut: "", Motif: "", Demandeur: "", Email: "",
            }];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const headers = Object.keys(data[0]);

      worksheet["!cols"] = headers.map((header) => {
        let maxLen = header.length;
        data.forEach((row) => {
          const val = String(row[header] ?? "");
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
      });

      const blackBorder = {
        top:    { style: "medium", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left:   { style: "medium", color: { rgb: "000000" } },
        right:  { style: "medium", color: { rgb: "000000" } },
      };

      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        fill: { patternType: "solid", fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: blackBorder,
      };

      const cellStyle = {
        font: { sz: 10 },
        alignment: { vertical: "center" },
        border: blackBorder,
      };

      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[addr]) worksheet[addr] = { t: "s", v: "" };
          worksheet[addr].s = R === 0 ? headerStyle : cellStyle;
        }
      }
      worksheet["!rows"] = [{ hpt: 22 }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");
      XLSX.writeFile(
        workbook,
        `unisalle-reservations-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (err) {
      console.error(err);
      setLoadError(err?.message || "L'export Excel a échoué.");
    } finally {
      setIsExporting(false);
    }
  }

  // ---------- Export PDF ----------
  async function exportPdf() {
    setIsExporting(true);
    setLoadError(null);
    setExportMenuOpen(false);
    try {
      const reservations = await fetchReservations();
      const rows = buildRows(reservations);

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("UniSalle — Liste des réservations", 14, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Exporté le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
        14,
        21
      );

      const headers = ["Salle", "Date", "Début", "Fin", "Statut", "Motif", "Demandeur", "Email"];
      const body = rows.map((r) => [
        r.Salle, r.Date, r.Debut, r.Fin, r.Statut, r.Motif, r.Demandeur, r.Email,
      ]);

      autoTable(doc, {
        startY: 26,
        head: [headers],
        body,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          textColor: [30, 30, 30],
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 24 },
          2: { cellWidth: 16 },
          3: { cellWidth: 16 },
          4: { cellWidth: 24 },
          5: { cellWidth: 40 },
          6: { cellWidth: 45 },
          7: { cellWidth: "auto" },
        },
        margin: { left: 14, right: 14 },
      });

      doc.save(`unisalle-reservations-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
      setLoadError(err?.message || "L'export PDF a échoué.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <Topbar title="Administration" />
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[19px] font-bold">Tableau de bord administrateur</h2>
            <p className="text-[12.5px] text-gray-500">Statistiques — période en cours</p>
          </div>

          {/* Menu Export Excel / PDF */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              onClick={() => setExportMenuOpen((o) => !o)}
              disabled={isExporting}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
              </svg>
              {isExporting ? "Export..." : "Exporter"}
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Button>

            {exportMenuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={exportExcel}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="text-base">📊</span> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={exportPdf}
                  className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="text-base">📄</span> PDF (.pdf)
                </button>
              </div>
            )}
          </div>
        </div>

        {loadError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {loadError}
          </p>
        )}

        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon="📘" value={kpis.month} label="Réservations ce mois" />
          <KpiCard icon="📈" iconColor="green" value={`${kpis.occupancy}%`} label="Taux d'occupation moyen" />
          <KpiCard icon="🏢" iconColor="blue" value={kpis.rooms} label="Salles disponibles" />
          <KpiCard icon="✓" iconColor="green" value={kpis.processed} label="Demandes traitées" />
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-2">
          <Card className="p-[18px]">
            <h3 className="mb-3.5 text-[13.5px] font-bold">Réservations par jour de la semaine</h3>
            <div className="flex h-40 items-end gap-3.5">
              {WEEK_DAYS.map((d, i) => (
                <div key={d} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div className="w-3/5 rounded-t bg-brand-600" style={{ height: `${byDay[i]}%` }} />
                  <div className="mt-2 text-[11px] text-gray-500">{d}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-[18px]">
            <h3 className="mb-3.5 text-[13.5px] font-bold">Salles les plus utilisées</h3>
            {topRooms.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">Pas encore de données.</p>
            )}
            {topRooms.map((room, i) => (
              <div key={room.name} className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-0">
                <span className="w-5 text-[12.5px] font-bold text-gray-400">{i + 1}</span>
                <span className="w-32 flex-shrink-0 truncate text-[13px] font-semibold">{room.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-gray-100">
                  <div className="h-full rounded bg-brand-600" style={{ width: `${room.pct}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-bold text-brand-600">{room.pct}%</span>
              </div>
            ))}
          </Card>
        </div>

        <Card className="p-[18px]">
          <h3 className="mb-3.5 text-[13.5px] font-bold">Heures de pointe (charge horaire)</h3>
          <div className="flex h-32 items-end gap-2">
            {byHour.map((b) => (
              <div key={b.hour} className="flex h-full flex-1 flex-col items-center justify-end">
                <div className="w-3/5 rounded-t bg-brand-500" style={{ height: `${b.pct}%` }} />
                <div className="mt-1.5 text-[10px] text-gray-500">{b.hour}</div>
              </div>
            ))}
            {byHour.length === 0 && (
              <p className="w-full py-8 text-center text-sm text-gray-400">Pas encore de données.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
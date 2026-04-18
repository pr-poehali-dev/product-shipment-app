import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "journal" | "reports" | "notifications";

interface Shipment {
  id: string;
  date: string;
  destination: string;
  items: number;
  weight: string;
  status: "delivered" | "transit" | "pending" | "problem";
  carrier: string;
  invoice: string;
}

interface Notification {
  id: string;
  type: "new" | "warning" | "error" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const SHIPMENTS: Shipment[] = [
  { id: "ОТГ-2026-0184", date: "18.04.2026", destination: "Новосибирск, ул. Ленина 45", items: 48, weight: "1 240 кг", status: "transit", carrier: "СДЭК", invoice: "ФС-2026-0412" },
  { id: "ОТГ-2026-0183", date: "17.04.2026", destination: "Екатеринбург, пр. Мира 12", items: 120, weight: "3 800 кг", status: "delivered", carrier: "Деловые линии", invoice: "ФС-2026-0411" },
  { id: "ОТГ-2026-0182", date: "17.04.2026", destination: "Казань, ул. Баумана 8", items: 30, weight: "890 кг", status: "problem", carrier: "ПЭК", invoice: "ФС-2026-0410" },
  { id: "ОТГ-2026-0181", date: "16.04.2026", destination: "Краснодар, ул. Красная 91", items: 72, weight: "2 140 кг", status: "delivered", carrier: "СДЭК", invoice: "ФС-2026-0409" },
  { id: "ОТГ-2026-0180", date: "16.04.2026", destination: "Самара, пр. Победы 33", items: 15, weight: "430 кг", status: "pending", carrier: "Boxberry", invoice: "ФС-2026-0408" },
  { id: "ОТГ-2026-0179", date: "15.04.2026", destination: "Ростов-на-Дону, ул. Садовая 5", items: 90, weight: "2 700 кг", status: "delivered", carrier: "Деловые линии", invoice: "ФС-2026-0407" },
  { id: "ОТГ-2026-0178", date: "15.04.2026", destination: "Уфа, ул. Цюрупы 101", items: 60, weight: "1 800 кг", status: "transit", carrier: "ПЭК", invoice: "ФС-2026-0406" },
  { id: "ОТГ-2026-0177", date: "14.04.2026", destination: "Воронеж, пр. Революции 19", items: 24, weight: "720 кг", status: "delivered", carrier: "СДЭК", invoice: "ФС-2026-0405" },
];

const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "new", title: "Новая отгрузка зарегистрирована", message: "ОТГ-2026-0184 — 48 позиций, Новосибирск. Перевозчик СДЭК.", time: "Сегодня, 09:14", read: false },
  { id: "n2", type: "error", title: "Проблема с отгрузкой ОТГ-2026-0182", message: "Перевозчик ПЭК сообщает о задержке доставки в Казань. Требуется уточнение.", time: "Вчера, 16:47", read: false },
  { id: "n3", type: "warning", title: "Расхождение в накладной", message: "ФС-2026-0408: фактический вес 430 кг, в накладной указано 450 кг. Проверьте данные.", time: "Вчера, 11:22", read: false },
  { id: "n4", type: "info", title: "Отгрузка ОТГ-2026-0183 доставлена", message: "Доставлено в Екатеринбург, подпись получателя получена.", time: "17.04.2026, 14:05", read: true },
  { id: "n5", type: "info", title: "Отгрузка ОТГ-2026-0181 доставлена", message: "Доставлено в Краснодар, все 72 позиции. Подпись получателя получена.", time: "16.04.2026, 18:31", read: true },
];

const STATUS_MAP = {
  delivered: { label: "Доставлено", cls: "badge-success" },
  transit: { label: "В пути", cls: "badge-warning" },
  pending: { label: "Ожидает", cls: "badge-neutral" },
  problem: { label: "Проблема", cls: "badge-danger" },
};

const NOTIF_ICON: Record<string, string> = {
  new: "PackagePlus",
  warning: "AlertTriangle",
  error: "AlertCircle",
  info: "CheckCircle2",
};

const NOTIF_COLOR: Record<string, string> = {
  new: "hsl(var(--blue-accent))",
  warning: "hsl(var(--warning))",
  error: "hsl(var(--danger))",
  info: "hsl(var(--success))",
};

// ─── Mini sparkline bar chart ───────────────────────────────────────────────
function SparkBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: i === data.length - 1 ? 1 : 0.45 }}
        />
      ))}
    </div>
  );
}

const CLIENTS = [
  "ООО «Альфа Трейд»",
  "АО «СтройГрупп»",
  "ИП Петров А.В.",
  "ООО «Мегаопт»",
  "АО «ПромТехника»",
  "ООО «Северная логистика»",
  "ЗАО «ТехноМаш»",
  "ИП Сидоренко К.Л.",
];

// ─── New shipment modal ────────────────────────────────────────────────────
function NewShipmentModal({ onClose, onSave }: { onClose: () => void; onSave: (s: Shipment) => void }) {
  const [client, setClient] = useState("");
  const [cipher, setCipher] = useState("");
  const [qty, setQty] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canSubmit = client && cipher.trim() && qty.trim() && photo;

  const handleSubmit = () => {
    const newId = `ОТГ-2026-0${185 + Math.floor(Math.random() * 10)}`;
    onSave({
      id: newId,
      date: "18.04.2026",
      destination: client,
      items: parseInt(qty) || 0,
      weight: "—",
      status: "pending",
      carrier: "—",
      invoice: `ФС-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
    });
    setStep("success");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,18,35,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in"
        style={{ border: "1px solid hsl(var(--border))" }}
      >
        {step === "success" ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "hsl(142 65% 92%)" }}
            >
              <Icon name="CheckCircle2" size={32} style={{ color: "hsl(142 65% 35%)" }} />
            </div>
            <div>
              <p className="text-lg font-semibold">Отгрузка зарегистрирована</p>
              <p className="text-sm text-muted-foreground mt-1">Запись добавлена в журнал</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "hsl(var(--primary))" }}
            >
              Закрыть
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center"
                  style={{ background: "hsl(var(--blue-accent))" }}
                >
                  <Icon name="PackagePlus" size={14} className="text-white" />
                </div>
                <p className="text-sm font-semibold">Новая отгрузка</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
              >
                <Icon name="X" size={15} style={{ color: "hsl(var(--muted-foreground))" }} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Client select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Заказчик *
                </label>
                <div className="relative">
                  <select
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full appearance-none bg-white border rounded px-3 py-2.5 text-sm outline-none pr-8 cursor-pointer"
                    style={{
                      borderColor: client ? "hsl(var(--blue-accent))" : "hsl(var(--border))",
                      color: client ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    <option value="">Выберите заказчика...</option>
                    {CLIENTS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Icon
                    name="ChevronDown"
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  />
                </div>
              </div>

              {/* Cipher */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Шифр *
                </label>
                <input
                  type="text"
                  value={cipher}
                  onChange={(e) => setCipher(e.target.value)}
                  placeholder="Например: ПР-2026-АВ12"
                  className="border rounded px-3 py-2.5 text-sm outline-none font-mono-nums transition-colors"
                  style={{
                    borderColor: cipher ? "hsl(var(--blue-accent))" : "hsl(var(--border))",
                    background: "white",
                  }}
                />
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Количество (позиций) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0"
                  className="border rounded px-3 py-2.5 text-sm outline-none font-mono-nums transition-colors"
                  style={{
                    borderColor: qty ? "hsl(var(--blue-accent))" : "hsl(var(--border))",
                    background: "white",
                  }}
                />
              </div>

              {/* Photo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Фото отгрузки *
                </label>
                <label
                  className="relative flex flex-col items-center justify-center rounded border-2 border-dashed cursor-pointer transition-all overflow-hidden"
                  style={{
                    borderColor: photo ? "hsl(var(--blue-accent))" : "hsl(var(--border))",
                    minHeight: 110,
                    background: photo ? "hsl(216 28% 97%)" : "hsl(216 20% 98%)",
                  }}
                >
                  {photo ? (
                    <div className="relative w-full">
                      <img src={photo} alt="preview" className="w-full object-cover" style={{ maxHeight: 140 }} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.4)" }}>
                        <p className="text-white text-xs font-medium">Изменить фото</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: "hsl(216 20% 92%)" }}
                      >
                        <Icon name="Camera" size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>Прикрепить фото</p>
                        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, HEIC до 20 МБ</p>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhoto} />
                </label>
                {photoName && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Icon name="Paperclip" size={11} />
                    {photoName}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center justify-between border-t"
              style={{ borderColor: "hsl(var(--border))", background: "hsl(216 20% 98%)" }}
            >
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm font-medium border transition-colors hover:bg-secondary"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-5 py-2 rounded text-sm font-medium text-white transition-opacity"
                style={{
                  background: "hsl(var(--primary))",
                  opacity: canSubmit ? 1 : 0.4,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                <Icon name="PackagePlus" size={14} />
                Зарегистрировать
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Journal view ─────────────────────────────────────────────────────────
function JournalView() {
  const [filter, setFilter] = useState<"all" | Shipment["status"]>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [shipments, setShipments] = useState(SHIPMENTS);

  const filtered = shipments.filter((s) => {
    const matchStatus = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.id.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      s.carrier.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filters: { id: "all" | Shipment["status"]; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "delivered", label: "Доставлено" },
    { id: "transit", label: "В пути" },
    { id: "pending", label: "Ожидает" },
    { id: "problem", label: "Проблемы" },
  ];

  const handleSave = (s: Shipment) => {
    setShipments((prev) => [s, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4 animate-slide-in">
      {/* Hero banner */}
      <div
        className="relative rounded-lg overflow-hidden px-8 py-7 flex items-center justify-between"
        style={{
          background: "linear-gradient(120deg, hsl(220 35% 16%) 0%, hsl(221 55% 25%) 60%, hsl(211 80% 38%) 100%)",
          minHeight: 120,
        }}
      >
        {/* decorative grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* glow */}
        <div
          className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at right center, hsl(211 80% 65%), transparent 70%)" }}
        />
        <div className="relative z-10">
          <p className="text-white text-lg font-semibold leading-tight">Журнал отгрузок</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
            {shipments.length} записей · обновлено сегодня
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="relative z-10 flex items-center gap-2.5 px-5 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Icon name="Plus" size={16} />
          Новая отгрузка
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-1.5 bg-white border rounded px-3 py-1.5 flex-1 min-w-48"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <Icon name="Search" size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
          <input
            type="text"
            placeholder="Поиск по номеру, городу, перевозчику..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all border"
              style={{
                background: filter === f.id ? "hsl(var(--primary))" : "white",
                color: filter === f.id ? "white" : "hsl(var(--foreground))",
                borderColor: filter === f.id ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(216 20% 97%)" }}>
              {["Номер отгрузки", "Дата", "Получатель", "Позиции", "Вес", "Перевозчик", "Статус", ""].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                className="table-row-hover cursor-pointer"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
              >
                <td className="px-4 py-3">
                  <span className="font-mono-nums text-xs font-medium" style={{ color: "hsl(var(--blue-accent))" }}>
                    {s.id}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono-nums text-xs text-muted-foreground">{s.date}</td>
                <td className="px-4 py-3 text-sm" style={{ maxWidth: 180 }}>
                  <span className="line-clamp-1">{s.destination}</span>
                </td>
                <td className="px-4 py-3 font-mono-nums text-sm text-right">{s.items}</td>
                <td className="px-4 py-3 font-mono-nums text-xs text-muted-foreground">{s.weight}</td>
                <td className="px-4 py-3 text-xs">{s.carrier}</td>
                <td className="px-4 py-3">
                  <span className={STATUS_MAP[s.status].cls}>{STATUS_MAP[s.status].label}</span>
                </td>
                <td className="px-4 py-3">
                  <Icon name="ChevronRight" size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">Нет записей по выбранным фильтрам</div>
        )}
        <div
          className="px-4 py-3 flex items-center justify-between border-t"
          style={{ borderColor: "hsl(var(--border))", background: "hsl(216 20% 98%)" }}
        >
          <span className="text-xs text-muted-foreground">
            Показано {filtered.length} из {shipments.length} записей
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-secondary transition-colors">
              <Icon name="ChevronLeft" size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
            </button>
            <span className="text-xs px-2 py-0.5 rounded bg-primary text-white font-medium">1</span>
            <button className="p-1 rounded hover:bg-secondary transition-colors">
              <Icon name="ChevronRight" size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <NewShipmentModal
          onClose={() => setShowModal(false)}
          onSave={(s) => { handleSave(s); }}
        />
      )}
    </div>
  );
}

// ─── Reports view ─────────────────────────────────────────────────────────
function ReportsView() {
  const weekData = [42, 38, 55, 61, 48, 70, 67];
  const monthLabels = ["Янв", "Фев", "Мар", "Апр"];
  const monthData = [210, 248, 295, 184];
  const maxMonth = Math.max(...monthData);

  const stats = [
    { label: "Всего отгрузок (апрель)", value: "184", delta: "+12%", icon: "Package", positive: true },
    { label: "Успешно доставлено", value: "172", delta: "93.5%", icon: "CheckCircle2", positive: true },
    { label: "В пути сейчас", value: "8", delta: "2 ↑", icon: "Truck", positive: true },
    { label: "С проблемами", value: "4", delta: "+2 за день", icon: "AlertTriangle", positive: false },
  ];

  const carriers = [
    { name: "СДЭК", count: 72, share: 39 },
    { name: "Деловые линии", count: 58, share: 32 },
    { name: "ПЭК", count: 34, share: 18 },
    { name: "Boxberry", count: 20, share: 11 },
  ];

  return (
    <div className="flex flex-col gap-5 animate-slide-in">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: "hsl(216 28% 96%)" }}
              >
                <Icon name={s.icon} size={15} style={{ color: "hsl(var(--blue-accent))" }} />
              </div>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: s.positive ? "hsl(142 65% 92%)" : "hsl(0 72% 92%)",
                  color: s.positive ? "hsl(142 65% 25%)" : "hsl(0 72% 30%)",
                }}
              >
                {s.delta}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono-nums" style={{ color: "hsl(var(--foreground))" }}>
                {s.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Weekly chart */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold">Отгрузки за неделю</p>
              <p className="text-xs text-muted-foreground mt-0.5">12–18 апреля 2026</p>
            </div>
            <span className="badge-success">+18%</span>
          </div>
          <div className="flex items-end gap-1.5 h-32 mb-2">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, i) => {
              const h = weekData[i];
              const max = Math.max(...weekData);
              const isToday = i === 6;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end" style={{ height: 96 }}>
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${(h / max) * 100}%`,
                        background: isToday ? "hsl(var(--blue-accent))" : "hsl(221 65% 28% / 0.18)",
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "hsl(var(--border))" }}>
            <span className="text-xs text-muted-foreground">Итого за неделю</span>
            <span className="font-mono-nums text-sm font-semibold">381 отгрузка</span>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold">Динамика по месяцам</p>
              <p className="text-xs text-muted-foreground mt-0.5">Январь — апрель 2026</p>
            </div>
          </div>
          <div className="flex items-end gap-4 h-24 mb-3">
            {monthLabels.map((m, i) => {
              const h = monthData[i];
              const isCurrent = i === 3;
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-mono-nums font-medium" style={{ color: isCurrent ? "hsl(var(--blue-accent))" : "hsl(var(--muted-foreground))" }}>
                    {h}
                  </span>
                  <div className="w-full flex items-end" style={{ height: 64 }}>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${(h / maxMonth) * 100}%`,
                        background: isCurrent ? "hsl(var(--blue-accent))" : "hsl(221 65% 28% / 0.2)",
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{m}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "hsl(var(--border))" }}>
            <span className="text-xs text-muted-foreground">Среднее в месяц</span>
            <span className="font-mono-nums text-sm font-semibold">234 отгрузки</span>
          </div>
        </div>
      </div>

      {/* Carriers */}
      <div className="stat-card">
        <p className="text-sm font-semibold mb-4">Распределение по перевозчикам</p>
        <div className="flex flex-col gap-3">
          {carriers.map((c) => (
            <div key={c.name} className="flex items-center gap-4">
              <span className="text-sm w-32 shrink-0">{c.name}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(216 20% 92%)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${c.share}%`, background: "hsl(var(--blue-accent))" }}
                />
              </div>
              <span className="font-mono-nums text-sm text-right w-20 text-muted-foreground">
                {c.count} / {c.share}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications view ───────────────────────────────────────────────────
function NotificationsView() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read);

  const markAll = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="flex flex-col gap-4 max-w-2xl animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Непрочитанных:</span>
          <span
            className="font-mono-nums text-sm font-semibold px-2 py-0.5 rounded"
            style={{ background: "hsl(var(--danger))", color: "white" }}
          >
            {unread.length}
          </span>
        </div>
        {unread.length > 0 && (
          <button
            onClick={markAll}
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: "hsl(var(--blue-accent))" }}
          >
            Прочитать все
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded border p-4 flex gap-3 cursor-pointer transition-all"
            style={{
              borderColor: !n.read ? "hsl(var(--blue-accent) / 0.4)" : "hsl(var(--border))",
              opacity: n.read ? 0.7 : 1,
            }}
            onClick={() => markOne(n.id)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${NOTIF_COLOR[n.type]}22` }}
            >
              <Icon name={NOTIF_ICON[n.type]} size={15} style={{ color: NOTIF_COLOR[n.type] }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight">{n.title}</p>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "hsl(var(--blue-accent))" }} />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
              <p className="text-xs mt-1.5 font-mono-nums" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>
                {n.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────
export default function Dashboard({ activeTab }: { activeTab: Tab }) {
  if (activeTab === "journal") return <JournalView />;
  if (activeTab === "reports") return <ReportsView />;
  return <NotificationsView />;
}
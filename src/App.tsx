import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Icon from "@/components/ui/icon";
import Dashboard from "@/pages/Index";

type Tab = "journal" | "reports" | "notifications";

const queryClient = new QueryClient();

function AppLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("journal");
  const [notifCount] = useState(3);

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "journal", label: "Журнал отгрузок", icon: "ClipboardList" },
    { id: "reports", label: "Отчёты и статистика", icon: "BarChart3" },
    { id: "notifications", label: "Уведомления", icon: "Bell" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col w-60 shrink-0 h-full"
        style={{ background: "hsl(var(--navy))", borderRight: "1px solid hsl(var(--sidebar-border))" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded flex items-center justify-center shrink-0"
              style={{ background: "hsl(var(--blue-accent))" }}
            >
              <Icon name="Package" size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">ЛогистикаПро</p>
              <p className="text-xs" style={{ color: "hsl(var(--sidebar-foreground))", opacity: 0.6 }}>
                Учёт отгрузок
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p
            className="text-xs font-semibold uppercase tracking-widest px-3 mb-2"
            style={{ color: "hsl(var(--sidebar-foreground))", opacity: 0.4 }}
          >
            Разделы
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item w-full text-left ${activeTab === item.id ? "active" : ""}`}
              style={
                activeTab !== item.id
                  ? { color: "hsl(var(--sidebar-foreground))" }
                  : undefined
              }
            >
              <div className="relative">
                <Icon name={item.icon} size={16} />
                {item.id === "notifications" && notifCount > 0 && (
                  <span className="notification-dot" />
                )}
              </div>
              <span>{item.label}</span>
              {item.id === "notifications" && notifCount > 0 && (
                <span
                  className="ml-auto text-xs font-mono-nums px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: activeTab === item.id ? "rgba(255,255,255,0.2)" : "hsl(var(--danger))",
                    color: "white",
                  }}
                >
                  {notifCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ background: "hsl(var(--blue-accent))" }}
            >
              АД
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">Администратор</p>
              <p className="text-xs truncate" style={{ color: "hsl(var(--sidebar-foreground))", opacity: 0.55 }}>
                admin@company.ru
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 shrink-0 flex items-center justify-between px-6 border-b bg-white"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <div>
            <h1 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono-nums px-2.5 py-1 rounded border"
              style={{ color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))" }}
            >
              18 апреля 2026
            </span>
            <button
              className="relative p-2 rounded transition-colors hover:bg-secondary"
              onClick={() => setActiveTab("notifications")}
            >
              <Icon name="Bell" size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
              {notifCount > 0 && <span className="notification-dot" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div key={activeTab} className="flex-1 overflow-auto p-6 animate-fade-in">
          <Dashboard activeTab={activeTab} />
        </div>
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AppLayout />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
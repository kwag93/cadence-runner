import { Zap, User } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md flex justify-between items-center px-6" style={{ paddingTop: 'var(--sat)', height: 'calc(var(--header-height) + var(--sat))' }}>
      <div className="flex items-center gap-3">
        <Zap className="w-6 h-6 text-primary" />
        <h1 className="font-heading uppercase font-bold text-primary italic text-2xl tracking-tighter">
          케이던스
        </h1>
      </div>
      {title && (
        <span className="font-heading uppercase tracking-[0.2em] font-bold text-primary text-sm">
          {title}
        </span>
      )}
      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-primary/30 flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
    </header>
  );
}

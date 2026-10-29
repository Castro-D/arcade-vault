"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "./session-provider";

export function Nav() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  const libraryActive = pathname === "/" || pathname.startsWith("/juegos");
  const hallActive = pathname === "/salon";
  const authActive = pathname === "/acceso";
  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={libraryActive ? "active" : ""}>
            Biblioteca
          </Link>
          <Link href="/salon" className={hallActive ? "active" : ""}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={logout}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/acceso" className="btn auth-btn">
            Iniciar Sesión
          </Link>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close}></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan mb-4 text-[11px]">MENÚ</div>
        <Link href="/" className={libraryActive ? "active" : ""} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon" className={hallActive ? "active" : ""} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/acceso" className={authActive ? "active" : ""} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div className="flex-1"></div>
        <div className="pixel text-[9px] tracking-[0.16em] text-(--ink-faint)">CRÉDITOS · 03</div>
      </aside>
    </>
  );
}

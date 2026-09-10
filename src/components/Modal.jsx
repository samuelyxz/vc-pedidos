import { useEffect, useRef } from 'react';

// Pilha de modais abertos — só o do topo responde a ESC / prende o Tab.
const stack = [];

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Wrapper de modal com backdrop, fechar no ESC / clique fora, foco preso,
// foco restaurado ao fechar e atributos ARIA de diálogo.
export function Modal({ onClose, children, className = '', ariaLabel }) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  // Onde o clique começou. Arrastar para selecionar texto de dentro do painel
  // termina o clique no backdrop — sem isso, selecionar texto fechava o modal.
  const inicioNoFundoRef = useRef(false);

  // Guardado em ref para o efeito de montagem não depender da identidade da
  // função: quem chama costuma recriá-la a cada render, e reexecutar o efeito
  // devolveria o foco para o primeiro campo a cada tecla digitada.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const token = {};
    stack.push(token);
    restoreFocusRef.current = document.activeElement;

    const panel = panelRef.current;
    const focusables = () => [...panel.querySelectorAll(FOCUSABLE)];
    (focusables()[0] || panel).focus();

    const isTop = () => stack[stack.length - 1] === token;
    const onKey = (e) => {
      if (!isTop()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) {
        e.preventDefault();
        return;
      }
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey, true);
      const i = stack.indexOf(token);
      if (i !== -1) stack.splice(i, 1);
      document.body.style.overflow = prevOverflow;
      const el = restoreFocusRef.current;
      if (el && typeof el.focus === 'function') el.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4"
      onMouseDown={(e) => {
        inicioNoFundoRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && inicioNoFundoRef.current) {
          onClose?.();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`bg-white outline-none ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

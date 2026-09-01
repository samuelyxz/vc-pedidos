import { Component } from 'react';
import { RefreshCw } from 'lucide-react';
import { VC_GREEN } from '../lib/constants.js';

// Error boundaries precisam ser classe, mesmo no React 19.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset });
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-stone-200 rounded-xl p-6 text-center">
          <h2 className="font-semibold text-stone-900 mb-1">Algo deu errado</h2>
          <p className="text-sm text-stone-500 mb-4">
            Essa parte do app travou. Seus dados salvos não foram afetados.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full text-white font-medium text-sm py-2 rounded-lg inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: VC_GREEN }}
          >
            <RefreshCw size={14} />
            Recarregar
          </button>
          {error?.message && (
            <details className="mt-3 text-left">
              <summary className="text-[11px] text-stone-400 cursor-pointer">
                Detalhes técnicos
              </summary>
              <pre className="mt-1 text-[10px] text-stone-500 whitespace-pre-wrap break-words">
                {String(error.message)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

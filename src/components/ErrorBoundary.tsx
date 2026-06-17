import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReset = () => {
    try { localStorage.clear(); } catch { /* ignore */ }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#F4F4F4',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#1f7a7e',
              marginBottom: '8px',
            }}>
              Oups, quelque chose s'est mal passé
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#6B5A5A',
              marginBottom: '8px',
              lineHeight: 1.5,
            }}>
              L'application a rencontré une erreur inattendue.
              Ceci peut arriver si le fichier est ouvert directement depuis le système de fichiers.
            </p>
            {this.state.error && (
              <details style={{
                marginBottom: '16px',
                textAlign: 'left',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '11px',
                color: '#6B5A5A',
                border: '1px solid #E8CFCB',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '4px' }}>
                  Détails de l'erreur
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#37C2C7',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                🔄 Réessayer
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: '1px solid #E8CFCB',
                  backgroundColor: 'white',
                  color: '#6B5A5A',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                🗑️ Réinitialiser les données et recharger
              </button>
            </div>
            <p style={{
              fontSize: '10px',
              color: '#6B5A5A',
              marginTop: '20px',
              opacity: 0.6,
              lineHeight: 1.5,
            }}>
              💡 <strong>Astuce :</strong> Si le problème persiste, essayez d'héberger le fichier HTML
              en ligne (Netlify, GitHub Pages…) et d'y accéder via une URL https://.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

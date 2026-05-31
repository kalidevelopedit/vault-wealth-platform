import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[ErrorBoundary:${this.props.section ?? "unknown"}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          padding: "28px 20px", textAlign: "center",
          color: "rgba(255,255,255,0.35)", fontSize: 13,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>⚠</div>
          <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
            {this.props.section ? `${this.props.section} failed to load` : "Something went wrong"}
          </div>
          <div style={{ fontSize: 12, marginBottom: 14 }}>{this.state.error.message}</div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: "6px 16px", borderRadius: 8, cursor: "pointer",
              background: "#2563ff", color: "#fff", border: "none",
              fontSize: 12.5, fontWeight: 600,
            }}
          >Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

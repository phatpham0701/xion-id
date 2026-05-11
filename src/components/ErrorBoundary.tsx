import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[XIONID] Unhandled render error:", error, info.componentStack);
    // Stale lazy-chunk after redeploy → reload once to grab fresh assets.
    const msg = String(error?.message || "");
    const isChunkError =
      /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed|ChunkLoadError/i.test(msg);
    if (isChunkError && typeof window !== "undefined") {
      const KEY = "xionid:chunk-reload";
      try {
        if (!sessionStorage.getItem(KEY)) {
          sessionStorage.setItem(KEY, String(Date.now()));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }

  private reset = () => {
    try { sessionStorage.removeItem("xionid:chunk-reload"); } catch { /* noop */ }
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground break-all">
            {import.meta.env.DEV
              ? this.state.error.message
              : "An unexpected error occurred."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={this.reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.location.assign("/")}>
              Go home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

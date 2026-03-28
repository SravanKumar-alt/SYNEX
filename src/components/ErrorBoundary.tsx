import * as React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-8">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <RefreshCcw size={18} />
              <span>Refresh Page</span>
            </button>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-8 p-4 bg-secondary rounded-xl text-left text-xs overflow-auto max-h-40 text-muted-foreground">
                {(this as any).state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

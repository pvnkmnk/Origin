import { Component, ReactNode } from "react";

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

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-primary flex items-center justify-center p-4">
          <div className="max-w-2xl border border-accent p-8 space-y-4">
            <div className="font-mono text-accent text-xl">SYSTEM_ERROR</div>
            <div className="font-mono text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred"}
            </div>
            <button
              onClick={() => window.location.href = "/"}
              className="border border-primary px-4 py-2 font-mono hover:bg-primary hover:text-black"
            >
              RETURN_TO_HOME
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

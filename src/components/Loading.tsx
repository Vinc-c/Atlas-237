import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullPage?: boolean;
}

export function Loading({ text = 'Loading...', fullPage = false }: LoadingProps) {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ink-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-3 text-sm text-ink-500">{text}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      <span className="ml-2 text-sm text-ink-500">{text}</span>
    </div>
  );
}

declare module 'react-dom/client' {
  export function createRoot(container: HTMLElement): {
    render(element: React.ReactNode): void;
    unmount(): void;
  };
} 
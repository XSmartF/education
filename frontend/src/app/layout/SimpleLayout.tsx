import { Outlet } from '@tanstack/react-router';

export default function SimpleLayout() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <main className="flex flex-1 flex-col items-center justify-center gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

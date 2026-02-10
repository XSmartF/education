import { Outlet } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

const showDevtools = import.meta.env.MODE === 'development';

export default function RootLayout() {
  return (
    <>
      <Outlet />
      {showDevtools ? <TanStackRouterDevtools /> : null}
      {showDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </>
  );
}

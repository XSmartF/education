import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock router navigation used by `LoginPage` so tests don't require a RouterProvider
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => () => {},
  };
});
import '../src/shared/i18n';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../src/domains/auth/pages/LoginPage';
import { store } from '../src/app/store/store';
import { queryClient } from '../src/app/query/query-client';

describe('App shell', () => {
  it('renders auth screen', async () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <LoginPage />
        </QueryClientProvider>
      </Provider>
    );

    const heading = await screen.findByRole('heading', { name: /sign in|dang nhap/i });
    expect(heading).toBeInTheDocument();
  });
});

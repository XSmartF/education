import { render, screen } from '@testing-library/react';
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

    const title = await screen.findByText(/sign in|dang nhap/i);
    expect(title).toBeInTheDocument();
  });
});

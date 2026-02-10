import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '../src/app/routes/router';
import { store } from '../src/app/store/store';
import { queryClient } from '../src/app/query/query-client';

describe('App shell', () => {
  it('renders auth screen', async () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
    );

    const title = await screen.findByText(/sign in|dang nhap/i);
    expect(title).toBeInTheDocument();
  });
});

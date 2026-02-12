import { render, screen } from '@testing-library/react';
import '../src/shared/i18n';
import { AuthPanel } from '../src/domains/auth/ui/AuthPanel';

describe('App shell', () => {
  it('renders auth screen', async () => {
    render(<AuthPanel onAuth={() => undefined} mode="login" />);

    const heading = await screen.findByRole('heading', { name: /sign in|dang nhap/i });
    expect(heading).toBeInTheDocument();
  });
});

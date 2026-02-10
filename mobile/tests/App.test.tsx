import { render, screen } from '@testing-library/react-native';
import '../src/shared/i18n';
import App from '../src/app/App';

describe('App', () => {
  it('shows title', () => {
    render(<App />);
    expect(screen.getByText('Education')).toBeTruthy();
  });
});

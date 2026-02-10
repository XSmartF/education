import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CButton, CCard, CCardContent, CCardHeader, CCardTitle } from '@/shared/components';

export default function NotFoundPage() {
  const { t: translate } = useTranslation('notFound');

  return (
    <CCard className="mx-auto w-full max-w-md">
      <CCardHeader>
        <CCardTitle>{translate('title')}</CCardTitle>
      </CCardHeader>
      <CCardContent>
        <CButton asChild variant="ghost">
          <Link to="/">{translate('backHome')}</Link>
        </CButton>
      </CCardContent>
    </CCard>
  );
}
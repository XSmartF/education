import { useAuth } from '@/domains/auth/hooks/use-auth';
import { FileList } from '@/domains/files/ui/FileList';
import { useTranslation } from 'react-i18next';
import { PageIntro } from '@/shared/ui';

export default function FilesPage() {
  const auth = useAuth();
  const { t: translate } = useTranslation('files');

  return (
    <section className="space-y-4">
      <PageIntro title={translate('title')} description={translate('subtitle')} />
      <FileList canEdit={auth.isAuthenticated} />
    </section>
  );
}

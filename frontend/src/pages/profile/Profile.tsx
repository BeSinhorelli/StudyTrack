import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';

export function Profile() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Perfil" subtitle="Suas informações" />
      <Card>
        <p><strong>Nome:</strong> {user?.name}</p>
        <p style={{ marginTop: 8 }}><strong>Email:</strong> {user?.email}</p>
      </Card>
    </>
  );
}
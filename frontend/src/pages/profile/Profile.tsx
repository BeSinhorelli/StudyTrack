import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { formatDate } from '../../utils/format';
import styles from './Profile.module.css';

export function Profile() {
  const { user, updateUser } = useAuth();

  // ── Editar perfil ─────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  function openProfileModal() {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setProfileError('');
    setProfileOpen(true);
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);
    try {
      const updated = await authService.updateMe({ name: name.trim(), email: email.trim() });
      updateUser(updated);
      setProfileOpen(false);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Trocar senha ─────────────────────────────
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  function openPasswordModal() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordOpen(true);
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Nova senha deve ter no mínimo 8 caracteres');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordOpen(false);
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <PageHeader title="Perfil" subtitle="Suas informações pessoais" />

      <Card className={styles.headerCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.info}>
          <h2>{user.name}</h2>
          <p className="text-muted">{user.email}</p>
          <p className={styles.since}>
            Membro desde {formatDate(user.createdAt)}
          </p>
        </div>
      </Card>

      <div className={styles.actions}>
        <Card className={styles.actionCard}>
          <h3>Dados pessoais</h3>
          <p className="text-muted">Atualize seu nome e email.</p>
          <Button onClick={openProfileModal}>Editar perfil</Button>
        </Card>

        <Card className={styles.actionCard}>
          <h3>Senha</h3>
          <p className="text-muted">Altere sua senha de acesso.</p>
          <Button variant="secondary" onClick={openPasswordModal}>
            Trocar senha
          </Button>
        </Card>
      </div>

      {/* Modal editar perfil */}
      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Editar perfil"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProfileOpen(false)} disabled={profileLoading}>
              Cancelar
            </Button>
            <Button type="submit" form="profile-form" loading={profileLoading}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="profile-form" onSubmit={handleProfileSubmit} className={styles.form}>
          {profileError && <ErrorMessage message={profileError} />}

          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
            autoFocus
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Modal trocar senha */}
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Trocar senha"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPasswordOpen(false)} disabled={passwordLoading}>
              Cancelar
            </Button>
            <Button type="submit" form="password-form" loading={passwordLoading}>
              Trocar
            </Button>
          </>
        }
      >
        <form id="password-form" onSubmit={handlePasswordSubmit} className={styles.form}>
          {passwordError && <ErrorMessage message={passwordError} />}

          <Input
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            autoFocus
          />

          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </form>
      </Modal>
    </>
  );
}
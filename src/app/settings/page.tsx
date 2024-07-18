import ProfileForm from '@/components/profile/ProfileForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">User Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Profile</h2>
          <ProfileForm />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
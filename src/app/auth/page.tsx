import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Sign Up or Sign In</h1>
      <AuthForm />
    </div>
  );
}
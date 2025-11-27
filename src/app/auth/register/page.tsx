import { redirect } from 'next/navigation';

// Redirect to the canonical sign-up page
export default function RegisterPage() {
  redirect('/auth/sign-up');
}

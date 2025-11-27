import { redirect } from 'next/navigation';

// This page is no longer needed as the main login page serves as the entry point.
export default function RoleSelectPage() {
  redirect('/auth/login');
}

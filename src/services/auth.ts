import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role: 'resident' | 'business';
  area?: string;
  phone?: string;
  businessName?: string;
}

export async function signUp({
  email,
  password,
  fullName,
  role,
  area,
  phone,
  businessName,
}: SignUpParams): Promise<void> {
  const metadata: Record<string, string> = {
    full_name: fullName,
    role,
  };

  if (area) {
    metadata.area = area;
  }
  if (phone) {
    metadata.phone = phone;
  }
  if (role === 'business' && businessName) {
    metadata.business_name = businessName;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data ?? null;
}

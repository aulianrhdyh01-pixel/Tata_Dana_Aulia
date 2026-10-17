// ==============================================================================
// TataDana: Client-Side User Store & Registered Users Manager
// Manages tatadana_registered_users, session storage, password recovery, and OTP
// ==============================================================================

export interface RegisteredUser {
  nama: string;
  email: string;
  kontak: string;
  password?: string;
  avatarUrl: string;
  statusPaket: string;
  role?: string;
  isVerified: boolean;
  isApproved?: boolean;
  createdAt?: string;
}

export const DEFAULT_DEMO_USERS: RegisteredUser[] = [
  {
    nama: 'Superadmin TataDana Prime',
    email: 'shopnoure1619@gmail.com',
    kontak: '+62 812-1619-0000',
    password: 'tugasbisnis16',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaSuperadminVIP',
    statusPaket: 'PRO VIP',
    role: 'SUPERADMIN',
    isVerified: true,
    isApproved: true,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    nama: 'Pengguna TataDana',
    email: 'user@tatadana.com',
    kontak: '+62 812-3456-7890',
    password: 'password123',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
    statusPaket: 'Pro Lifetime (Rp99k)',
    role: 'USER',
    isVerified: true,
    isApproved: true,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    nama: 'Budi Santoso',
    email: 'budi.santoso@tatadana.id',
    kontak: '+62 812-8899-0011',
    password: 'password123',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiSantoso',
    statusPaket: 'Pro Lifetime (Rp99k)',
    role: 'USER',
    isVerified: true,
    isApproved: true,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    nama: 'Super Admin TataDana',
    email: 'admin@tatadana.com',
    kontak: '+62 811-9988-7766',
    password: 'password123',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaAdmin',
    statusPaket: 'PRO VIP',
    role: 'SUPERADMIN',
    isVerified: true,
    isApproved: true,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
];

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    return '+62 ' + digits.slice(2).replace(/(\d{3,4})(\d{4})(\d{0,4})/, '$1-$2-$3').trim().replace(/-$/, '');
  }
  if (digits.startsWith('0')) {
    return '+62 ' + digits.slice(1).replace(/(\d{3,4})(\d{4})(\d{0,4})/, '$1-$2-$3').trim().replace(/-$/, '');
  }
  return raw.trim();
}

export function cleanPhoneDigits(raw: string): string {
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return DEFAULT_DEMO_USERS;
  try {
    const raw = localStorage.getItem('tatadana_registered_users');
    if (!raw) {
      localStorage.setItem('tatadana_registered_users', JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('tatadana_registered_users', JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    // Ensure default demo user exists
    const hasDefaultUser = parsed.some((u: RegisteredUser) => u.email?.toLowerCase() === 'user@tatadana.com');
    if (!hasDefaultUser) {
      parsed.unshift(DEFAULT_DEMO_USERS[0]);
      localStorage.setItem('tatadana_registered_users', JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return DEFAULT_DEMO_USERS;
  }
}

export function saveRegisteredUsers(users: RegisteredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tatadana_registered_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered users:', e);
  }
}

export function findUserByIdentifier(identifier: string): RegisteredUser | null {
  const users = getRegisteredUsers();
  const trimmed = identifier.trim().toLowerCase();
  const digits = cleanPhoneDigits(identifier);

  for (const u of users) {
    if (u.email && u.email.toLowerCase() === trimmed) {
      return u;
    }
    if (u.kontak) {
      if (u.kontak.toLowerCase() === trimmed) return u;
      const uDigits = cleanPhoneDigits(u.kontak);
      if (digits && digits.length >= 8 && uDigits === digits) return u;
    }
  }
  return null;
}

export function registerNewUser(user: RegisteredUser): void {
  const users = getRegisteredUsers();
  const index = users.findIndex(
    (u) =>
      (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
      (u.kontak && user.kontak && cleanPhoneDigits(u.kontak) === cleanPhoneDigits(user.kontak))
  );
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  saveRegisteredUsers(users);
}

export function updateUserPasswordByIdentifier(identifier: string, newPassword: string): boolean {
  const users = getRegisteredUsers();
  const user = findUserByIdentifier(identifier);
  if (!user) return false;

  const updated = users.map((u) => {
    if (
      (user.email && u.email?.toLowerCase() === user.email.toLowerCase()) ||
      (user.kontak && u.kontak && cleanPhoneDigits(u.kontak) === cleanPhoneDigits(user.kontak))
    ) {
      return { ...u, password: newPassword };
    }
    return u;
  });
  saveRegisteredUsers(updated);
  return true;
}

export function saveActiveSession(profile: {
  nama: string;
  kontak: string;
  email: string;
  avatarUrl: string;
  statusPaket: string;
  role?: string;
  isApproved?: boolean;
}): void {
  if (typeof window === 'undefined') return;
  const sessionData = {
    ...profile,
    role: profile.role || (profile.email === 'shopnoure1619@gmail.com' ? 'SUPERADMIN' : 'USER'),
    isApproved: profile.isApproved !== undefined ? profile.isApproved : true,
    isLoggedIn: true,
  };
  try {
    localStorage.setItem('tatadana_user_profile', JSON.stringify(sessionData));
    localStorage.setItem('user_profile', JSON.stringify(sessionData));
    localStorage.setItem('tatadana_user', JSON.stringify(sessionData));
    window.dispatchEvent(new Event('tatadana_profile_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save active session:', e);
  }
}

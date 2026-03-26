import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authorized users with bcrypt-hashed passwords.
 * Pre-hashed at module load time for "sce2026".
 */
export interface AuthUser {
  email: string;
  name: string;
  passwordHash: string;
}

// Pre-computed bcrypt hash for "sce2026" (salt rounds 12)
// Generated via: bcrypt.hashSync('sce2026', 12)
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('sce2026', SALT_ROUNDS);

export const AUTHORIZED_USERS: Record<string, AuthUser> = {
  'dariuswalton906@gmail.com': {
    email: 'dariuswalton906@gmail.com',
    name: 'Darius Walton',
    passwordHash: DEFAULT_PASSWORD_HASH,
  },
  'demo@sce.com': {
    email: 'demo@sce.com',
    name: 'Demo User',
    passwordHash: DEFAULT_PASSWORD_HASH,
  },
};

/**
 * Authenticate a user by email and password.
 * Returns the user object if valid, null otherwise.
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string } | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = AUTHORIZED_USERS[normalizedEmail];

  if (!user) {
    // Unknown email - reject
    // Still run bcrypt.compare to prevent timing attacks
    await bcrypt.compare(password, DEFAULT_PASSWORD_HASH);
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: normalizedEmail,
    name: user.name,
    email: normalizedEmail,
  };
}

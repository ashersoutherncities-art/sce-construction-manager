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

export interface AuthUser {
  email: string;
  name: string;
  passwordHash: string;
}

// Bcrypt hashes are read from env vars — no plaintext in source, no secrets in Git.
// Set ADMIN_PASSWORD_HASH and (optionally) ASHER_PASSWORD_HASH in Vercel env.
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ASHER_PASSWORD_HASH = process.env.ASHER_PASSWORD_HASH || '';

// Dummy hash used only to keep bcrypt.compare timing consistent for unknown emails.
// It is not a valid credential for any real account.
const TIMING_DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeuXqmY7uKZ1V4jVpjb1x9zTGKq3f6WvV.';

function buildAuthorizedUsers(): Record<string, AuthUser> {
  const users: Record<string, AuthUser> = {};
  if (ADMIN_PASSWORD_HASH) {
    users['dariuswalton906@gmail.com'] = {
      email: 'dariuswalton906@gmail.com',
      name: 'Darius Walton',
      passwordHash: ADMIN_PASSWORD_HASH,
    };
  }
  if (ASHER_PASSWORD_HASH) {
    users['asher@developthesouth.com'] = {
      email: 'asher@developthesouth.com',
      name: 'Asher',
      passwordHash: ASHER_PASSWORD_HASH,
    };
  }
  return users;
}

export const AUTHORIZED_USERS: Record<string, AuthUser> = buildAuthorizedUsers();

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
    await bcrypt.compare(password, TIMING_DUMMY_HASH);
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

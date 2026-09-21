/**
 * =======================================================================
 * ADMIN ACCESS CONFIGURATION
 * =======================================================================
 * Only users whose email address appears in this list will automatically
 * be granted the "admin" role upon sign-in.
 * 
 * To grant admin access to another user or manager:
 * Add their email in lowercase to the ADMIN_EMAILS list below.
 * Example: ['noormuhammadproteinfarm@gmail.com', 'manager@example.com']
 */

export const ADMIN_EMAILS: readonly string[] = [
  'noormuhammadproteinfarm@gmail.com',
  // Add additional admin emails here:
  // 'owner@noormuhammadfarm.com',
];

/**
 * Checks if a given email is authorized for admin privileges.
 */
export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === normalized);
}

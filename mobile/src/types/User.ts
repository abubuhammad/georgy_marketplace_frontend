export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'seller' | 'admin' | 'delivery' | 'realtor' | 'house_agent' | 'house_owner' | 'employer' | 'job_seeker' | 'artisan';
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
}

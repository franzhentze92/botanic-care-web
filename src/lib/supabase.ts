/**
 * Local shim: the app catalog uses Shopify (see @/lib/shopify).
 * Legacy admin/dashboard code still imports `supabase`; this stub returns empty data
 * so the bundle builds. Manage products, orders, and media in Shopify Admin.
 */

function emptyList() {
  return Promise.resolve({ data: [], error: null });
}

function notFoundRow() {
  return Promise.resolve({
    data: null,
    error: { code: 'PGRST116', message: 'No rows', details: null, hint: null },
  });
}

function chain(): Record<string, unknown> {
  const b: Record<string, unknown> = {};
  const next = () => b;
  const keys = [
    'select',
    'eq',
    'neq',
    'in',
    'not',
    'or',
    'order',
    'limit',
    'range',
    'gte',
    'lte',
    'match',
    'contains',
    'insert',
    'update',
    'delete',
    'upsert',
  ];
  keys.forEach((k) => {
    b[k] = next;
  });
  b.single = () => notFoundRow();
  b.maybeSingle = () => Promise.resolve({ data: null, error: null });
  b.then = (onFulfilled: (v: unknown) => unknown) => emptyList().then(onFulfilled);
  return b;
}

const storageBucket = () => ({
  upload: async () => ({ data: null, error: { message: 'Use Shopify Admin for files' } }),
  getPublicUrl: () => ({ data: { publicUrl: '' } }),
});

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: { message: 'Use Shopify customer accounts' },
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: { message: 'Use Shopify customer accounts' },
    }),
    signOut: async () => {},
    resetPasswordForEmail: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } }),
    updateUser: async () => ({
      data: { user: null },
      error: null,
    }),
  },
  storage: {
    from: () => storageBucket(),
  },
  rpc: async () => ({ data: null, error: null }),
  from: () => chain(),
};

export const supabasePublic = supabase;

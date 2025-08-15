# Database & Data Management Guidelines

This file provides specialized guidance for database operations, data validation, schema design, and data management patterns.

## Core Data Philosophy

### Data Integrity First

- **MUST validate ALL external data**: API responses, form inputs, URL params, environment variables
- **MUST use branded types**: For all IDs and domain-specific values
- **MUST fail fast**: Validate at system boundaries, throw errors immediately
- **NEVER trust external data** without validation

## 🛡️ Data Validation with Zod (MANDATORY FOR ALL EXTERNAL DATA)

### MUST Follow These Validation Rules

- **MUST validate ALL external data**: API responses, form inputs, URL params, environment variables
- **MUST use branded types**: For all IDs and domain-specific values
- **MUST fail fast**: Validate at system boundaries, throw errors immediately
- **MUST use type inference**: Always derive TypeScript types from Zod schemas

### Schema Design Patterns (MANDATORY PATTERNS)

```typescript
import {z} from 'zod';

// MUST use branded types for ALL IDs
const UserIdSchema = z.string().uuid().brand<'UserId'>();
const ProductIdSchema = z.string().uuid().brand<'ProductId'>();
const CategoryIdSchema = z.string().uuid().brand<'CategoryId'>();

type UserId = z.infer<typeof UserIdSchema>;
type ProductId = z.infer<typeof ProductIdSchema>;
type CategoryId = z.infer<typeof CategoryIdSchema>;

// Base entity schema with common fields
const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User schema with proper validation
const UserSchema = BaseEntitySchema.extend({
  id: UserIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'moderator']),
  isActive: z.boolean().default(true),
  profile: z.object({
    avatar: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']).default('light'),
      notifications: z.boolean().default(true),
    }).optional(),
  }).optional(),
});

type User = z.infer<typeof UserSchema>;

// Product schema with complex validation
const ProductSchema = BaseEntitySchema.extend({
  id: ProductIdSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  price: z.number().min(0).max(999999.99),
  categoryId: CategoryIdSchema,
  sku: z.string().min(1).max(50),
  inStock: z.boolean().default(true),
  inventory: z.object({
    quantity: z.number().int().min(0),
    reserved: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(10),
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

type Product = z.infer<typeof ProductSchema>;
```

### API Response Validation

```typescript
// Generic API response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    error: z.string().optional(),
    timestamp: z.string().datetime(),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1).max(100),
      total: z.number().int().min(0),
      hasMore: z.boolean(),
    }).optional(),
  });

// Usage for specific endpoints
const getUsersResponseSchema = apiResponseSchema(z.array(UserSchema));
const getUserResponseSchema = apiResponseSchema(UserSchema);
const createUserResponseSchema = apiResponseSchema(UserSchema);

type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;
type GetUserResponse = z.infer<typeof getUserResponseSchema>;
```

### Form Validation Integration

```typescript
// Form schemas separate from database schemas for flexibility
const CreateUserFormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
  role: z.enum(['user', 'moderator']).default('user'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

const UpdateUserFormSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  profile: z.object({
    bio: z.string().max(500).optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']).optional(),
      notifications: z.boolean().optional(),
    }).optional(),
  }).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided for update",
  }
);

type CreateUserForm = z.infer<typeof CreateUserFormSchema>;
type UpdateUserForm = z.infer<typeof UpdateUserFormSchema>;
```

## 🔗 Firebase/Firestore Integration

### Firestore Configuration

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { env } from '@/lib/env';

const firebaseConfig = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Connect to emulators in development
if (env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    // Emulators already connected
  }
}
```

### Firestore Document Patterns

```typescript
// Collection and document type definitions
interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UserDocument extends FirestoreDocument {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  isActive: boolean;
  profile?: {
    avatar?: string;
    bio?: string;
    preferences?: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
}

// Repository pattern for data access
export class UserRepository {
  private collection = collection(db, 'users');

  async findById(id: UserId): Promise<User | null> {
    try {
      serverLogger.info('Fetching user by ID', 'db', { userId: id });
      
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        serverLogger.info('User not found', 'db', { userId: id });
        return null;
      }

      const data = docSnap.data() as UserDocument;
      const user = this.mapDocumentToUser(data);
      
      serverLogger.info('User fetched successfully', 'db', { userId: id });
      return UserSchema.parse(user);
    } catch (error) {
      serverLogger.error('Failed to fetch user', error instanceof Error ? error : new Error(String(error)), 'db', { userId: id });
      throw error;
    }
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      serverLogger.info('Creating new user', 'db', { email: userData.email });
      
      const now = Timestamp.now();
      const docRef = doc(this.collection);
      
      const userDocument: UserDocument = {
        id: docRef.id,
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, userDocument);
      
      const createdUser = this.mapDocumentToUser(userDocument);
      const validatedUser = UserSchema.parse(createdUser);
      
      serverLogger.info('User created successfully', 'db', { userId: validatedUser.id });
      return validatedUser;
    } catch (error) {
      serverLogger.error('Failed to create user', error instanceof Error ? error : new Error(String(error)), 'db', { email: userData.email });
      throw error;
    }
  }

  async update(id: UserId, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    try {
      serverLogger.info('Updating user', 'db', { userId: id, updateFields: Object.keys(updates) });
      
      const docRef = doc(this.collection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
      
      // Fetch updated document
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      serverLogger.info('User updated successfully', 'db', { userId: id });
      return updatedUser;
    } catch (error) {
      serverLogger.error('Failed to update user', error instanceof Error ? error : new Error(String(error)), 'db', { userId: id });
      throw error;
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      serverLogger.info('Deleting user', 'db', { userId: id });
      
      const docRef = doc(this.collection, id);
      await deleteDoc(docRef);
      
      serverLogger.info('User deleted successfully', 'db', { userId: id });
    } catch (error) {
      serverLogger.error('Failed to delete user', error instanceof Error ? error : new Error(String(error)), 'db', { userId: id });
      throw error;
    }
  }

  async findMany(options: {
    limit?: number;
    startAfter?: string;
    orderBy?: keyof UserDocument;
    direction?: 'asc' | 'desc';
  } = {}): Promise<{ users: User[]; hasMore: boolean; lastVisible?: string }> {
    try {
      const {
        limit = 25,
        startAfter,
        orderBy = 'createdAt',
        direction = 'desc'
      } = options;

      serverLogger.info('Fetching users with pagination', 'db', { limit, startAfter, orderBy, direction });

      let q = query(
        this.collection,
        orderBy(orderBy, direction),
        limit(limit + 1) // Fetch one extra to determine if there are more
      );

      if (startAfter) {
        const startAfterDoc = await getDoc(doc(this.collection, startAfter));
        q = query(q, startAfter(startAfterDoc));
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      
      const hasMore = docs.length > limit;
      const users = docs.slice(0, limit).map(doc => {
        const data = doc.data() as UserDocument;
        return UserSchema.parse(this.mapDocumentToUser(data));
      });

      const lastVisible = hasMore ? docs[limit - 1].id : undefined;

      serverLogger.info('Users fetched successfully', 'db', { 
        count: users.length, 
        hasMore, 
        lastVisible 
      });

      return { users, hasMore, lastVisible };
    } catch (error) {
      serverLogger.error('Failed to fetch users', error instanceof Error ? error : new Error(String(error)), 'db');
      throw error;
    }
  }

  private mapDocumentToUser(doc: UserDocument): User {
    return {
      id: doc.id as UserId,
      email: doc.email,
      name: doc.name,
      role: doc.role,
      isActive: doc.isActive,
      profile: doc.profile,
      createdAt: doc.createdAt.toDate(),
      updatedAt: doc.updatedAt.toDate(),
    };
  }
}
```

## 🔄 TanStack Query Integration for Data Management

### Query Hook Patterns for Data Access

```typescript
// User data queries
export function useUser(id: UserId) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const userRepository = new UserRepository();
      return await userRepository.findById(id);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    enabled: !!id, // Only run query if ID is provided
  });
}

export function useUsers(options: {
  limit?: number;
  startAfter?: string;
  orderBy?: string;
  direction?: 'asc' | 'desc';
} = {}) {
  return useQuery({
    queryKey: ['users', options],
    queryFn: async () => {
      const userRepository = new UserRepository();
      return await userRepository.findMany(options);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    keepPreviousData: true, // Keep previous data while fetching new page
  });
}

// Infinite query for pagination
export function useInfiniteUsers(options: {
  limit?: number;
  orderBy?: string;
  direction?: 'asc' | 'desc';
} = {}) {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite', options],
    queryFn: async ({ pageParam }) => {
      const userRepository = new UserRepository();
      return await userRepository.findMany({
        ...options,
        startAfter: pageParam as string,
      });
    },
    getNextPageParam: (lastPage) => lastPage.lastVisible || undefined,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  });
}
```

### Mutation Hook Patterns

```typescript
// User mutations
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      const userRepository = new UserRepository();
      return await userRepository.create(userData);
    },
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Optimistically update the cache
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          users: [newUser, ...old.users],
        };
      });
    },
    onError: (error, newUser, context) => {
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      serverLogger.error('Failed to create user', error instanceof Error ? error : new Error(String(error)), 'db');
    },
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['user', data.id], data);
      
      serverLogger.info('User created successfully', 'db', { userId: data.id });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: UserId; updates: UpdateUserForm }) => {
      const userRepository = new UserRepository();
      return await userRepository.update(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['user', id] });

      const previousUser = queryClient.getQueryData(['user', id]);
      
      // Optimistically update the user
      queryClient.setQueryData(['user', id], (old: User | undefined) => 
        old ? { ...old, ...updates } : old
      );

      return { previousUser };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(['user', id], context.previousUser);
      }
      
      serverLogger.error('Failed to update user', error instanceof Error ? error : new Error(String(error)), 'db');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      serverLogger.info('User updated successfully', 'db', { userId: data.id });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UserId) => {
      const userRepository = new UserRepository();
      await userRepository.delete(id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      
      // Remove user from cache
      queryClient.removeQueries({ queryKey: ['user', id] });
      
      // Remove from users list
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.filter((user: User) => user.id !== id),
        };
      });
    },
    onError: (error, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      serverLogger.error('Failed to delete user', error instanceof Error ? error : new Error(String(error)), 'db', { userId: id });
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      serverLogger.info('User deleted successfully', 'db', { userId: id });
    },
  });
}
```

## 🗃️ Database Schema Design Principles

### Schema Design Best Practices

1. **Normalization vs Denormalization**
   - Use normalized data for transactional consistency
   - Denormalize for read-heavy operations
   - Consider NoSQL document structure for complex nested data

2. **Indexing Strategy**
   - Index frequently queried fields
   - Composite indexes for multi-field queries
   - Monitor query performance and adjust indexes

3. **Data Validation Layers**
   - Database constraints for data integrity
   - Application-level validation with Zod
   - Client-side validation for user experience

### Collection Design Patterns

```typescript
// Collection structure design
interface Collections {
  users: UserDocument;
  products: ProductDocument;
  categories: CategoryDocument;
  orders: OrderDocument;
  'user-preferences': UserPreferencesDocument;
  'audit-logs': AuditLogDocument;
}

// Subcollection patterns
interface UserSubcollections {
  orders: OrderDocument;
  favorites: FavoriteDocument;
  notifications: NotificationDocument;
}

// Reference patterns
interface ProductDocument extends FirestoreDocument {
  categoryRef: DocumentReference<CategoryDocument>; // Reference to category
  vendorId: string; // Simple ID reference
  tags: string[]; // Array of simple values
  variants: ProductVariant[]; // Embedded documents
}
```

## Data Management FORBIDDEN Practices

- ❌ **NEVER trust external data** without Zod validation
- ❌ **NEVER use `any` type** for data structures
- ❌ **NEVER skip error handling** in database operations
- ❌ **NEVER log sensitive data** (passwords, tokens, PII)
- ❌ **NEVER perform operations without authentication checks**
- ❌ **NEVER forget to handle connection failures**
- ❌ **NEVER skip data migration strategies**
- ❌ **NEVER hardcode database configurations**

## Data Management Checklist

- [ ] All data schemas defined with Zod
- [ ] Branded types used for all IDs
- [ ] Repository pattern implemented for data access
- [ ] TanStack Query hooks for all data operations
- [ ] Optimistic updates implemented for mutations
- [ ] Error handling with structured logging
- [ ] Database operations properly authenticated
- [ ] Firestore security rules configured
- [ ] Data validation at all boundaries
- [ ] Cache invalidation strategies implemented
- [ ] Pagination patterns for large datasets
- [ ] Data migration strategies planned

---

*Specialized for database and data management*
*For complete guidelines, see main CLAUDE.md*
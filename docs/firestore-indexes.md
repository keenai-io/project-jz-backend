# Firestore Indexes

This document describes the Firestore indexes required by the application.

## Required Indexes

### Admin User Management Index

**Purpose**: Enables efficient querying of admin users ordered by creation date  
**Collection**: `users`  
**Query Pattern**: `where('role', '==', 'admin').orderBy('createdAt', 'desc')`

**Index Configuration**:
```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION", 
  "fields": [
    {
      "fieldPath": "role",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt", 
      "order": "DESCENDING"
    }
  ]
}
```

**Used By**:
- `scripts/admin-dashboard.ts` - Admin user listing with chronological order
- `scripts/list-admins.ts` - Admin user enumeration
- GitHub Actions admin management workflows

## Index Management

### Deploy Indexes
```bash
npm run deploy:firestore
```

### Manual Index Creation
Indexes can also be created manually in the Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database → Indexes
4. Click "Create Index" and configure the fields as shown above

### Index Configuration File
Indexes are defined in `firestore.indexes.json` and deployed automatically with Firestore rules.

## Performance Considerations

- **Query Performance**: Indexes enable fast queries even with large user collections
- **Write Performance**: Each index adds slight overhead to document writes
- **Storage**: Indexes consume additional storage proportional to document count
- **Cost**: Index storage and maintenance incur minimal Firebase costs

## Troubleshooting

### Index Creation Error
If you encounter "The query requires an index" errors:
1. Check that `firestore.indexes.json` contains the required index
2. Deploy indexes with `npm run deploy:firestore`
3. Wait 1-2 minutes for index creation to complete
4. Retry the query

### Index Build Time
- Small collections (< 1000 docs): Near-instant
- Medium collections (1000-100k docs): 1-5 minutes  
- Large collections (100k+ docs): 5-30 minutes

### Monitoring Index Status
Check index status in Firebase Console → Firestore → Indexes. Indexes show as "Building" during creation and "Enabled" when ready.

## Best Practices

1. **Create indexes before deployment** to avoid runtime errors
2. **Test queries locally** using Firebase emulators when possible
3. **Monitor index usage** in Firebase Console to identify unused indexes
4. **Remove unused indexes** to reduce storage costs and write overhead
5. **Consider query patterns** when designing document structure

## Related Documentation

- [Firebase Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firestore Security Rules](./firestore-rules.md)
- [Admin Management GitHub Actions](./github-actions-admin-management.md)
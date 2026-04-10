# 📚 Comprehensive Postman Testing Guide
## User Management System - MongoDB & Node.js

---

## 🚀 Quick Start

### Prerequisites
- Postman installed ([Download](https://www.postman.com/downloads/))
- Server running on `http://localhost:5000`
- MongoDB connected via Mongoose

### Import Collection
1. Open Postman
2. Click **Import** → **Upload Files**
3. Select `Postman_Collection_Complete.json`
4. Collection loads with all endpoints organized

---

## ⚙️ Environment Setup

### Create Environment in Postman

1. **Click Environments** (left sidebar)
2. **Create New** green button
3. **Name:** `Local Development`
4. **Add Variables:**
   ```
   Variable Name    | Initial Value           | Current Value
   base_url         | http://localhost:5000   | http://localhost:5000
   api_version      | api                     | api
   ```
5. **Save** and **select** from top-right dropdown

---

## 📋 Testing Sequence

### **Phase 1: Health Check & Data Creation**

#### 1.1 Verify Server is Running
```
GET {{base_url}}/api/health
```
**Expected:** `200 OK` with timestamp

#### 1.2 Create 5 Test Users (in order)

**User 1: Alice Johnson**
```
POST {{base_url}}/api/users
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "age": 25,
  "hobbies": ["photography", "hiking"],
  "bio": "Photography enthusiast and nature lover. Enjoy capturing beautiful moments"
}
```
**Copy `_id` for later use**

**User 2: Bob Smith**
```
POST {{base_url}}/api/users
{
  "name": "Bob Smith",
  "email": "bob.smith@example.com",
  "age": 35,
  "hobbies": ["coding", "gaming", "music"],
  "bio": "Software engineer with passion for machine learning and AI technologies"
}
```

**User 3: Carol White**
```
POST {{base_url}}/api/users
{
  "name": "Carol White",
  "email": "carol.white@example.com",
  "age": 30,
  "hobbies": ["cooking", "reading"],
  "bio": "Food blogger and cookbook author. Passionate about culinary arts"
}
```

**User 4: David Brown**
```
POST {{base_url}}/api/users
{
  "name": "David Brown",
  "email": "david.brown@example.com",
  "age": 45,
  "hobbies": ["gardening", "reading"],
  "bio": "Experienced project manager with 20 years in the industry"
}
```

**User 5: Eve Taylor**
```
POST {{base_url}}/api/users
{
  "name": "Eve Taylor",
  "email": "eve.taylor@example.com",
  "age": 22,
  "hobbies": ["dancing", "gaming", "music"],
  "bio": "Young creative with passion for digital art and design"
}
```

**Expected Response Pattern (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "age": 25,
    "hobbies": ["photography", "hiking"],
    "bio": "Photography enthusiast...",
    "userId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T10:30:00.000Z",
    "__v": 0
  }
}
```

✅ **Checkpoint:** All 5 users created successfully

---

### **Phase 2: CRUD Operations**

#### 2.1 Read All Users (with Pagination)
```
GET {{base_url}}/api/users?page=1&limit=10

Expected: 200 OK
Returns: Array of 5 users with pagination info
```

**Pagination Tests:**
- `?page=1&limit=5` - First 5 users
- `?page=1&limit=3` - First 3 users
- `?page=2&limit=3` - Next 3 users

#### 2.2 Get Specific User
```
GET {{base_url}}/api/users/{USER_ID}

Replace {USER_ID} with actual ID from creation response
Expected: 200 OK with user details
```

#### 2.3 Update User
```
PUT {{base_url}}/api/users/{USER_ID}

Body (partial update):
{
  "age": 26,
  "bio": "Updated bio - still photography enthusiast"
}

Expected: 200 OK with updated user
```

**Full Update:**
```json
{
  "name": "Alice Johnson",
  "email": "alice.newemail@example.com",
  "age": 26,
  "hobbies": ["photography", "hiking", "travel"],
  "bio": "Updated profile with travel hobby"
}
```

#### 2.4 Delete User
```
DELETE {{base_url}}/api/users/{USER_ID}

Expected: 200 OK with deleted user data
```

✅ **Checkpoint:** All CRUD operations working

---

### **Phase 3: Search & Filter Operations**

#### 3.1 Search by Name (Name Index)
```
GET {{base_url}}/api/users/search/name?name=alice&limit=10&page=1

Expected: 200 OK
Returns: Array of matching users (case-insensitive)
```

**Test Variations:**
- `?name=bob` - Search Bob
- `?name=ca` - Partial match (Carol)
- `?name=david&limit=5` - With limit
- `?name=eve&page=1&limit=3` - With pagination

#### 3.2 Filter by Age Range (Compound Index: email + age)
```
GET {{base_url}}/api/users/search/filter?minAge=20&maxAge=30&page=1&limit=10

Expected: 200 OK
Returns: Users within age range (Alice: 25, Eve: 22, Carol: 30)
```

**Filter Variations:**
- `?minAge=20&maxAge=30` - Ages 20-30
- `?minAge=30&maxAge=50` - Ages 30-50
- `?age=25` - Exact age match
- `?email=example.com&minAge=25&maxAge=40` - Combined filter

**Test Results Expected:**
- Age 20-30: Alice (25), Eve (22), Carol (30)
- Age 30-50: Carol (30), David (45), Bob (35)

#### 3.3 Find by Hobbies (Multikey Index)
```
GET {{base_url}}/api/users/search/hobbies?hobby=coding&limit=10&page=1

Expected: 200 OK
Returns: Users with specified hobby
```

**Hobby Test Cases:**
- `?hobby=coding` → Bob, Alice
- `?hobby=reading` → Carol, David
- `?hobby=gaming` → Bob, Eve
- `?hobby=music` → Bob, Eve
- `?hobby=photography` → Alice

#### 3.4 Text Search on Bio & Name (Text Index)
```
GET {{base_url}}/api/users/search/text?query=developer&limit=10&page=1

Expected: 200 OK
Returns: Array with relevance scores (sorted by relevance)
```

**Text Search Examples:**
- `?query=developer` → Bob, Alice
- `?query=passionate` → Bob
- `?query=photography` → Alice
- `?query=cooking` → Carol
- `?query=machine learning` → Bob

📊 **Response includes relevance scores:**
```json
{
  "_id": "...",
  "name": "Bob Smith",
  "email": "bob.smith@example.com",
  "age": 35,
  "hobbies": ["coding", "gaming", "music"],
  "bio": "Software engineer with passion for machine learning",
  "score": 25.5
}
```

✅ **Checkpoint:** All search operations working

---

### **Phase 4: Analytics**

#### 4.1 Get User Statistics
```
GET {{base_url}}/api/users/stats

Expected: 200 OK

Response:
{
  "success": true,
  "message": "User statistics",
  "data": {
    "totalUsers": 5,
    "averageAge": 31.4,
    "minAge": 22,
    "maxAge": 45
  }
}
```

After deleting a user, re-test to see updated stats.

---

### **Phase 5: Index Analysis & Performance**

#### 5.1 View All Indexes
```
GET {{base_url}}/api/index-analysis/indexes

Expected: 200 OK

Response shows all indexes:
- _id_ (default)
- name_1 (single field index)
- email_1_age_1 (compound index)
- hobbies_1 (multikey index)
- bio_text_name_text (text index)
- userId_hashed (hashed index)
- createdAt_1 (TTL index)
```

#### 5.2 Index Usage Statistics
```
GET {{base_url}}/api/index-analysis/stats

Expected: 200 OK showing index statistics and usage patterns
```

#### 5.3 Analyze Individual Indexes

**Analyze Name Index:**
```
GET {{base_url}}/api/index-analysis/analyze/name?name=alice

Expected: Execution statistics showing:
- keysExamined: Low number (efficient)
- documentsExamined: Number of docs scanned
- documentsReturned: Actual results found
- executionStages: Should show IXSCAN (index scan) not COLLSCAN
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Name index analysis",
  "query": { "name": { "$regex": "alice", "$options": "i" } },
  "executionStats": {
    "executionStages": "IXSCAN",
    "keysExamined": 1,
    "documentsExamined": 1,
    "documentsReturned": 1,
    "executionTimeMS": "INDEX USED"
  }
}
```

**Analyze Compound Index (Email + Age):**
```
GET {{base_url}}/api/index-analysis/analyze/email-age?email=example.com&minAge=20&maxAge=40

Expected: Shows compound index usage for combined filters
- Should show efficient index usage
- keysExamined ≈ documentsExamined
```

**Analyze Multikey Index (Hobbies):**
```
GET {{base_url}}/api/index-analysis/analyze/hobbies?hobby=coding

Expected: Multikey index analysis
- Shows efficient array field indexing
- Finds all documents with hobby in array
```

**Analyze Text Index:**
```
GET {{base_url}}/api/index-analysis/analyze/text?query=developer

Expected: Text index statistics
- Score calculation shown
- Relevance ranking visible
```

**Analyze Hashed Index (UserId):**
```
GET {{base_url}}/api/index-analysis/analyze/userid?userId={HASH_FROM_USER}

Expected: Hashed index analysis for unique identifier lookup
```

#### 5.4 Performance Comparison

**Before Optimization (without index - COLLSCAN):**
- keysExamined: 0
- documentsExamined: 5 (all documents)
- executionTimeMS: Higher

**After Optimization (with index - IXSCAN):**
- keysExamined: 1 (approximately)
- documentsExamined: 1-2
- executionTimeMS: Lower

---

### **Phase 6: Error Handling & Edge Cases**

#### 6.1 Validation Errors

**Missing Required Field:**
```
POST {{base_url}}/api/users
{
  "email": "test@example.com",
  "age": 25
}

Expected: 400 or 500 error
Message: "Name is required"
```

**Invalid Email Format:**
```
POST {{base_url}}/api/users
{
  "name": "Test User",
  "email": "not-an-email",
  "age": 25
}

Expected: 500 error
Message: "Please provide a valid email"
```

**Age Out of Range:**
```
POST {{base_url}}/api/users
{
  "name": "Test User",
  "email": "test@example.com",
  "age": 150
}

Expected: 500 error
Message: "Age cannot exceed 120"
```

**Name Too Short:**
```
POST {{base_url}}/api/users
{
  "name": "AB",
  "email": "test@example.com",
  "age": 25
}

Expected: 500 error
Message: "Name must be at least 3 characters"
```

#### 6.2 Duplicate Constraints

**Duplicate Email:**
```
POST {{base_url}}/api/users
{
  "name": "Duplicate User",
  "email": "alice.johnson@example.com",
  "age": 25
}

Expected: 409 Conflict
Message: "User with this email already exists"
```

#### 6.3 Not Found Errors

**Invalid User ID:**
```
GET {{base_url}}/api/users/invalid_id

Expected: 500 error
Message: Cast error or similar
```

**Non-existent User:**
```
GET {{base_url}}/api/users/507f1f77bcf86cd799439011

Expected: 404 Not Found
Message: "User not found"
```

#### 6.4 Missing Parameters

**Search without term:**
```
GET {{base_url}}/api/users/search/name

Expected: 400 Bad Request
Message: "Search term is required"
```

**Hobby search without hobby:**
```
GET {{base_url}}/api/users/search/hobbies

Expected: 400 Bad Request
Message: "Hobby parameter is required"
```

---

## 📊 Testing Checklist

### CRUD Operations
- ✅ Create User (valid)
- ✅ Create User (validation errors)
- ✅ Read All Users (pagination)
- ✅ Read Specific User
- ✅ Update User (full & partial)
- ✅ Delete User

### Search & Filter
- ✅ Search by Name (case-insensitive)
- ✅ Filter by Age Range
- ✅ Filter by Email
- ✅ Find by Hobbies
- ✅ Text Search (relevance scoring)

### Validation
- ✅ Required fields
- ✅ Email format
- ✅ Age range (0-120)
- ✅ Name length (min 3)
- ✅ Unique email constraint
- ✅ Bio max length (500)

### Indexes
- ✅ Name index analysis
- ✅ Compound index (email + age)
- ✅ Multikey index (hobbies)
- ✅ Text index
- ✅ Hashed index (userId)
- ✅ TTL index (createdAt)

### Analytics
- ✅ User statistics
- ✅ Aggregation pipeline

### Error Scenarios
- ✅ Missing fields
- ✅ Invalid data types
- ✅ Constraint violations
- ✅ 404 Not Found
- ✅ Invalid ID format

---

## 🎯 Key Testing Insights

### Index Performance
1. **Name Index (Single Field)**
   - Efficient for prefix searches
   - Regex with anchors works best
   - Reduces scan from 5 docs to 1-2

2. **Compound Index (Email + Age)**
   - Excellent for combined filters
   - Filters both fields efficiently
   - Better than separate indexes

3. **Multikey Index (Hobbies)**
   - Perfect for array fields
   - $in operator uses index
   - Each array element indexed

4. **Text Index**
   - Full-text search capabilities
   - Relevance scoring ($meta)
   - Supports partial word matching

5. **Hashed Index (UserId)**
   - For exact matches only
   - Good for shard key
   - Not useful for range queries

6. **TTL Index (createdAt)**
   - Auto-deletes documents
   - Runs every 60 seconds
   - Useful for session data

---

## 💡 Pro Tips

1. **Use Postman Collections:**
   - Organized by functionality
   - Pre-built request templates
   - Variable substitution

2. **Test Pagination:**
   - Always test limit and page parameters
   - Verify totalPages calculation
   - Check boundary conditions

3. **Monitor Response Time:**
   - Index queries should be <100ms
   - Full scans >500ms
   - Use explain() for large datasets

4. **Validation Testing:**
   - Test boundary values
   - Test edge cases
   - Test with null/undefined

5. **Save Responses:**
   - Use Tests tab for assertions
   - Create test scripts
   - Verify response structure

---

## 🔄 Complete Testing Flow (Quick Reference)

```
1. Health Check
   ↓
2. Create 5 Users
   ↓
3. Get All Users
   ↓
4. Search by Name
   ↓
5. Filter by Age
   ↓
6. Find by Hobbies
   ↓
7. Text Search
   ↓
8. Get Statistics
   ↓
9. Index Analysis
   ↓
10. Update User
   ↓
11. Delete User
   ↓
12. Error Scenarios
```

---

## 📝 Notes

- All timestamps use ISO 8601 format
- Pagination defaults: page=1, limit=10
- Search is case-insensitive
- Empty arrays default to []
- Deleted documents cannot be recovered
- Index creation is automatic via Mongoose schema


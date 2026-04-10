# User Management System

A modern web application for managing users with MongoDB and Node.js. Features include CRUD operations, advanced filtering, text search, and comprehensive index analysis.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete users
- **Advanced Filtering**: Search by name, age range, hobbies, and text search
- **Index Performance Analysis**: Detailed query performance metrics using `.explain("executionStats")`
- **Modern UI**: White and green theme with responsive design
- **Real-time Statistics**: User count, average age, min/max age
- **Pagination**: Efficient data loading with page controls

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Validation**: Mongoose schema validation + validator.js

## Database Schema

### User Collection

```javascript
{
  name: String (required, min 3 chars),
  email: String (required, unique, valid email),
  age: Number (min 0, max 120),
  hobbies: [String],
  bio: String (max 500 chars, text search enabled),
  userId: String (unique, hashed index),
  createdAt: Date (default: now, TTL index),
  updatedAt: Date (auto)
}
```

### Indexes

1. **Single Field**: `name` - Fast name searches
2. **Compound**: `{email, age}` - Combined queries
3. **Multikey**: `hobbies` - Array field searches
4. **Text**: `{bio, name}` - Full-text search
5. **Hashed**: `userId` - Distributed queries
6. **TTL**: `createdAt` - Auto-delete after 365 days

## Installation & Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (Atlas or local)
- npm or yarn

### Steps

1. **Clone and Install Dependencies**
   ```bash
   cd User_Mgm_Sys
   npm install
   ```

2. **Configure Environment**
   ```bash
   # .env is already configured with MongoDB connection
   # You can edit .env.example and rename to .env if needed
   ```

3. **Start the Server**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

4. **Access the Application**
   - Open: `http://localhost:5000`
   - API Base: `http://localhost:5000/api/users`

## API Endpoints

### CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create new user |
| GET | `/api/users` | Get all users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Search & Filter

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search/name?name=John` | Search by name |
| GET | `/api/users/search/filter?minAge=20&maxAge=30` | Filter by age |
| GET | `/api/users/search/hobbies?hobby=Gaming` | Find by hobby |
| GET | `/api/users/search/text?query=developer` | Full-text search |
| GET | `/api/users/stats` | Get statistics |

## Testing with Postman

### Create User
```
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 28,
  "hobbies": ["Gaming", "Reading"],
  "bio": "Software developer"
}
```

### Get All Users
```
GET http://localhost:5000/api/users?page=1&limit=10
```

### Update User
```
PUT http://localhost:5000/api/users/{userId}
Content-Type: application/json

{
  "name": "Jane Doe",
  "age": 29
}
```

### Delete User
```
DELETE http://localhost:5000/api/users/{userId}
```

### Search Operations
```
GET http://localhost:5000/api/users/search/name?name=John
GET http://localhost:5000/api/users/search/filter?minAge=25&maxAge=35
GET http://localhost:5000/api/users/search/hobbies?hobby=Gaming
GET http://localhost:5000/api/users/search/text?query=developer
```

## Index Performance Testing

Run the index testing script to analyze query performance:

```bash
npm run test:indexes
```

This will:
1. Insert 10 sample users
2. Execute 7 different queries
3. Display execution statistics:
   - Documents examined
   - Documents returned
   - Execution time (ms)
   - Index used

### Sample Output
```
🔍 QUERY PERFORMANCE ANALYSIS

1️⃣  Single Field Index on NAME
--------------------------------------------------
   Query: Find users with name = "John Doe"
   ✓ Documents Examined: 1
   ✓ Documents Returned: 1
   ✓ Execution Time: 0.5ms
   ✓ Index Used: COLLSCAN
```

## Project Structure

```
User_Mgm_Sys/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   └── User.js               # Mongoose schema with indexes
├── controllers/
│   └── userController.js     # Business logic
├── routes/
│   └── users.js              # API routes
├── middleware/
│   └── errorHandler.js       # Error handling
├── scripts/
│   └── index-test.js         # Index performance testing
├── public/
│   ├── index.html            # Frontend
│   ├── css/
│   │   └── style.css         # Styling
│   └── js/
│       └── app.js            # Client-side logic
├── .env                      # Environment variables
├── .env.example              # Environment template
├── server.js                 # Express server
├── package.json              # Dependencies
└── README.md                 # This file
```

## UI Features

### Users Tab
- Create new users with validation
- View all users as responsive cards
- Edit existing users
- Delete users with confirmation
- Pagination controls

### Search Tab
- Search users by name
- Filter by age range
- Find users by hobby
- Full-text search on bio/name

### Statistics Tab
- Total user count
- Average age calculation
- Youngest and oldest users

## Color Scheme

- **Primary Green**: #10b981
- **Dark Green**: #059669
- **Light Green**: #d1fae5
- **White**: #ffffff
- **Light Gray**: #f3f4f6

## Performance Optimizations

1. **Indexes**: Optimized for common queries
2. **Pagination**: Limit result sets
3. **Text Indexing**: Fast bio search
4. **TTL Index**: Auto-cleanup old records
5. **Hashed Index**: Distributed query handling

## Error Handling

All endpoints return standardized JSON responses:

```javascript
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}

// Error
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Security Considerations

- Email validation using validator.js
- Unique email constraint in database
- Input sanitization via Mongoose
- CORS enabled for secure cross-origin requests
- Environment variables for sensitive data
- Hashed userId generation

## Troubleshooting

### MongoDB Connection Issues
- Verify MONGODB_URI in .env
- Ensure whitelist IP in MongoDB Atlas
- Check network connectivity

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### Missing Dependencies
```bash
npm install
```

### Clear Everything
```bash
# Remove all users from database
npm run test:indexes  # This will clear and repopulate
```

## API Response Examples

### Success Response
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "hobbies": ["Gaming", "Reading"],
    "bio": "Software developer",
    "userId": "a1b2c3d4e5f6g7h8",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 42,
    "usersPerPage": 10
  }
}
```

## Future Enhancements

- User authentication and authorization
- Role-based access control
- Bulk import/export
- Advanced filtering UI
- Dashboard analytics
- Email notifications
- API rate limiting
- Query optimization suggestions

## License

MIT

## Support

For issues or questions, please refer to the API documentation or test the endpoints using Postman.

---

**Created**: April 2024
**Version**: 1.0.0

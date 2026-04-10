const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    age: 28,
    hobbies: ['Reading', 'Gaming', 'Coding'],
    bio: 'Software engineer passionate about web development and open source',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 32,
    hobbies: ['Yoga', 'Photography', 'Reading'],
    bio: 'Designer with interests in UI/UX and creative projects',
  },
  {
    name: 'Michael Johnson',
    email: 'michael@example.com',
    age: 25,
    hobbies: ['Gaming', 'Sports', 'Coding'],
    bio: 'Full-stack developer interested in mobile applications',
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    age: 29,
    hobbies: ['Reading', 'Writing', 'Yoga'],
    bio: 'Content writer and blogger sharing tech insights',
  },
  {
    name: 'David Brown',
    email: 'david@example.com',
    age: 35,
    hobbies: ['Photography', 'Traveling', 'Cooking'],
    bio: 'Data scientist exploring machine learning applications',
  },
  {
    name: 'Emma Davis',
    email: 'emma@example.com',
    age: 27,
    hobbies: ['Coding', 'Gaming', 'Reading'],
    bio: 'Junior developer learning new technologies and frameworks',
  },
  {
    name: 'Chris Wilson',
    email: 'chris@example.com',
    age: 31,
    hobbies: ['Sports', 'Photography', 'Traveling'],
    bio: 'DevOps engineer managing cloud infrastructure',
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    age: 26,
    hobbies: ['Reading', 'Yoga', 'Cooking'],
    bio: 'QA engineer ensuring quality in software development',
  },
  {
    name: 'Robert Martinez',
    email: 'robert@example.com',
    age: 33,
    hobbies: ['Gaming', 'Coding', 'Traveling'],
    bio: 'Backend developer with expertise in microservices',
  },
  {
    name: 'Amanda Taylor',
    email: 'amanda@example.com',
    age: 28,
    hobbies: ['Photography', 'Reading', 'Writing'],
    bio: 'Tech writer and developer advocate promoting best practices',
  },
];

const runIndexTests = async () => {
  try {
    console.log('\n📊 Index Performance Testing Script\n');
    console.log('='.repeat(60));

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});

    // Insert sample data
    console.log('📝 Inserting sample users...');
    await User.insertMany(sampleUsers);
    console.log(`✓ Inserted ${sampleUsers.length} sample users`);

    // Give indexes time to build
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n' + '='.repeat(60));
    console.log('🔍 QUERY PERFORMANCE ANALYSIS\n');

    // 1. Single field index on name
    console.log('1️⃣  Single Field Index on NAME');
    console.log('-'.repeat(60));
    const nameQuery = await User.find({ name: 'John Doe' }).explain('executionStats');
    console.log(`   Query: Find users with name = "John Doe"`);
    console.log(`   ✓ Documents Examined: ${nameQuery.executionStats.totalDocsExamined}`);
    console.log(`   ✓ Documents Returned: ${nameQuery.executionStats.nReturned}`);
    console.log(`   ✓ Execution Time: ${nameQuery.executionStats.executionTimeMillis}ms`);
    console.log(`   ✓ Index Used: ${nameQuery.executionStats.executionStages.stage}`);

    // 2. Compound index on email and age
    console.log('\n2️⃣  Compound Index on EMAIL and AGE');
    console.log('-'.repeat(60));
    const compoundQuery = await User.find({ email: 'john@example.com', age: 28 }).explain(
      'executionStats'
    );
    console.log(`   Query: Find users with email = "john@example.com" and age = 28`);
    console.log(`   ✓ Documents Examined: ${compoundQuery.executionStats.totalDocsExamined}`);
    console.log(`   ✓ Documents Returned: ${compoundQuery.executionStats.nReturned}`);
    console.log(`   ✓ Execution Time: ${compoundQuery.executionStats.executionTimeMillis}ms`);
    console.log(`   ✓ Index Used: ${compoundQuery.executionStats.executionStages.stage}`);

    // 3. Multikey index on hobbies
    console.log('\n3️⃣  Multikey Index on HOBBIES');
    console.log('-'.repeat(60));
    const hobbiesQuery = await User.find({ hobbies: 'Coding' }).explain('executionStats');
    console.log(`   Query: Find users with hobby = "Coding"`);
    console.log(`   ✓ Documents Examined: ${hobbiesQuery.executionStats.totalDocsExamined}`);
    console.log(`   ✓ Documents Returned: ${hobbiesQuery.executionStats.nReturned}`);
    console.log(`   ✓ Execution Time: ${hobbiesQuery.executionStats.executionTimeMillis}ms`);
    console.log(`   ✓ Index Used: ${hobbiesQuery.executionStats.executionStages.stage}`);

    // 4. Text index on bio
    console.log('\n4️⃣  Text Index on BIO');
    console.log('-'.repeat(60));
    const bioQuery = await User.find(
      { $text: { $search: 'developer' } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .explain('executionStats');
    console.log(`   Query: Text search for "developer"`);
    console.log(`   ✓ Documents Examined: ${bioQuery.executionStats.totalDocsExamined}`);
    console.log(`   ✓ Documents Returned: ${bioQuery.executionStats.nReturned}`);
    console.log(`   ✓ Execution Time: ${bioQuery.executionStats.executionTimeMillis}ms`);
    console.log(`   ✓ Index Used: ${bioQuery.executionStats.executionStages.stage}`);

    // 5. Hashed index on userId
    console.log('\n5️⃣  Hashed Index on USERID');
    console.log('-'.repeat(60));
    const firstUser = await User.findOne();
    const hashedQuery = await User.find({ userId: firstUser.userId }).explain('executionStats');
    console.log(`   Query: Find user by userId (hashed)`);
    console.log(`   ✓ Documents Examined: ${hashedQuery.executionStats.totalDocsExamined}`);
    console.log(`   ✓ Documents Returned: ${hashedQuery.executionStats.nReturned}`);
    console.log(`   ✓ Execution Time: ${hashedQuery.executionStats.executionTimeMillis}ms`);
    console.log(`   ✓ Index Used: ${hashedQuery.executionStats.executionStages.stage}`);

    // 6. Filter by age range
    console.log('\n6️⃣  Range Query on AGE');
    console.log('-'.repeat(60));
    const rangeQuery = await User.find({ age: { $gte: 25, $lte: 30 } }).explain('executionStats');
    console.log(`   Query: Find users with age between 25 and 30`);
    console.log(`   ✓ Documents Examined: ${rangeQuery.executionStats.totalDocsExamined}`);
    console.log(`   ✓ Documents Returned: ${rangeQuery.executionStats.nReturned}`);
    console.log(`   ✓ Execution Time: ${rangeQuery.executionStats.executionTimeMillis}ms`);
    console.log(`   ✓ Index Used: ${rangeQuery.executionStats.executionStages.stage}`);

    // 7. Complex query with OR
    console.log('\n7️⃣  Complex Query with OR');
    console.log('-'.repeat(60));
    const orQuery = await User.find({
      $or: [{ name: { $regex: 'John' } }, { hobbies: 'Coding' }],
    }).explain('executionStats');
    console.log(`   Query: Find users with name containing "John" OR hobby "Coding"`);
    console.log(`   ✓ Documents Examined: ${orQuery.executionStats.totalDocsExamined}`);
    console.log(`   ✓ Documents Returned: ${orQuery.executionStats.nReturned}`);
    console.log(`   ✓ Execution Time: ${orQuery.executionStats.executionTimeMillis}ms`);
    console.log(`   ✓ Index Used: ${orQuery.executionStats.executionStages.stage}`);

    // Get index information
    console.log('\n' + '='.repeat(60));
    console.log('📑 COLLECTION INDEXES\n');
    const indexes = await User.collection.getIndexes();
    Object.entries(indexes).forEach(([indexName, indexSpec], idx) => {
      console.log(`${idx}. Index: ${indexName}`);
      console.log(`   Spec: ${JSON.stringify(indexSpec)}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✓ Index testing completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error during testing:', error);
    process.exit(1);
  }
};

// Run tests
connectDB().then(runIndexTests);

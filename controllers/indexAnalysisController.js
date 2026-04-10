const User = require('../models/User');

// Test Index Performance - Single field index on name
exports.testNameIndex = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name parameter is required',
      });
    }

    const explanation = await User.find({
      name: { $regex: name, $options: 'i' },
    }).explain('executionStats');

    res.status(200).json({
      success: true,
      message: 'Name index analysis',
      query: { name: { $regex: name, $options: 'i' } },
      executionStats: {
        executionStages: explanation.executionStats.executionStages,
        keysExamined: explanation.executionStats.totalKeysExamined,
        documentsExamined: explanation.executionStats.totalDocsExamined,
        documentsReturned: explanation.executionStats.nReturned,
        executionTimeMS: explanation.executionStats.executionStages.stage === 'COLLSCAN' 
          ? 'FULL COLLECTION SCAN' 
          : 'INDEX USED',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing index',
      error: error.message,
    });
  }
};

// Test Compound Index - email and age
exports.testEmailAgeIndex = async (req, res) => {
  try {
    const { email, minAge, maxAge } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required',
      });
    }

    const filter = {
      email: { $regex: email, $options: 'i' },
    };

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    const explanation = await User.find(filter).explain('executionStats');

    res.status(200).json({
      success: true,
      message: 'Email & Age compound index analysis',
      query: filter,
      executionStats: {
        executionStages: explanation.executionStats.executionStages,
        keysExamined: explanation.executionStats.totalKeysExamined,
        documentsExamined: explanation.executionStats.totalDocsExamined,
        documentsReturned: explanation.executionStats.nReturned,
        indexUsed: explanation.executionStats.executionStages.stage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing compound index',
      error: error.message,
    });
  }
};

// Test Multikey Index - hobbies
exports.testHobbiesIndex = async (req, res) => {
  try {
    const { hobby } = req.query;

    if (!hobby) {
      return res.status(400).json({
        success: false,
        message: 'Hobby parameter is required',
      });
    }

    const filter = { hobbies: { $in: [hobby] } };
    const explanation = await User.find(filter).explain('executionStats');

    res.status(200).json({
      success: true,
      message: 'Hobbies multikey index analysis',
      query: filter,
      executionStats: {
        executionStages: explanation.executionStats.executionStages,
        keysExamined: explanation.executionStats.totalKeysExamined,
        documentsExamined: explanation.executionStats.totalDocsExamined,
        documentsReturned: explanation.executionStats.nReturned,
        indexUsed: explanation.executionStats.executionStages.stage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing multikey index',
      error: error.message,
    });
  }
};

// Test Text Index - bio and name
exports.testTextIndex = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required',
      });
    }

    const filter = { $text: { $search: query } };
    const explanation = await User.find(filter).explain('executionStats');

    res.status(200).json({
      success: true,
      message: 'Text index analysis',
      query: filter,
      executionStats: {
        executionStages: explanation.executionStats.executionStages,
        keysExamined: explanation.executionStats.totalKeysExamined,
        documentsExamined: explanation.executionStats.totalDocsExamined,
        documentsReturned: explanation.executionStats.nReturned,
        indexUsed: explanation.executionStats.executionStages.stage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing text index',
      error: error.message,
    });
  }
};

// Test Hashed Index - userId
exports.testHashedIndex = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId parameter is required',
      });
    }

    const filter = { userId };
    const explanation = await User.find(filter).explain('executionStats');

    res.status(200).json({
      success: true,
      message: 'Hashed index analysis',
      query: filter,
      executionStats: {
        executionStages: explanation.executionStats.executionStages,
        keysExamined: explanation.executionStats.totalKeysExamined,
        documentsExamined: explanation.executionStats.totalDocsExamined,
        documentsReturned: explanation.executionStats.nReturned,
        indexUsed: explanation.executionStats.executionStages.stage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing hashed index',
      error: error.message,
    });
  }
};

// Get all collection indexes
exports.getIndexes = async (req, res) => {
  try {
    const indexes = await User.collection.getIndexes();

    res.status(200).json({
      success: true,
      message: 'Collection indexes',
      indexes,
      indexCount: Object.keys(indexes).length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving indexes',
      error: error.message,
    });
  }
};

// Get Index Statistics
exports.getIndexStats = async (req, res) => {
  try {
    const stats = await User.collection.aggregate([
      { $indexStats: {} }
    ]).toArray();

    res.status(200).json({
      success: true,
      message: 'Index statistics',
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving index statistics',
      error: error.message,
    });
  }
};

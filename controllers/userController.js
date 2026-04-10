const User = require('../models/User');

// CREATE - Add a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, age, hobbies, bio } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const newUser = new User({
      name,
      email,
      age,
      hobbies: hobbies || [],
      bio,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
};

// READ - Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        usersPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

// READ - Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message,
    });
  }
};

// UPDATE - Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const { name, email, age, hobbies, bio } = req.body;

    // Check if user exists
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if email is being changed and if it's unique
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (age !== undefined) user.age = age;
    if (hobbies) user.hobbies = hobbies;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// DELETE - Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// SEARCH - Search users by name
exports.searchByName = async (req, res) => {
  try {
    const { name, limit = 10, page = 1 } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
    }

    const users = await User.find({ name: { $regex: name, $options: 'i' } })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await User.countDocuments({
      name: { $regex: name, $options: 'i' },
    });

    res.status(200).json({
      success: true,
      message: 'Users found',
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message,
    });
  }
};

// FILTER - Filter users by email and age
exports.filterUsers = async (req, res) => {
  try {
    const { email, age, minAge, maxAge, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    if (age) {
      filter.age = parseInt(age);
    } else if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    const users = await User.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Filtered users retrieved',
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error filtering users',
      error: error.message,
    });
  }
};

// FIND - Find users by hobbies
exports.findByHobbies = async (req, res) => {
  try {
    const { hobby, page = 1, limit = 10 } = req.query;

    if (!hobby) {
      return res.status(400).json({
        success: false,
        message: 'Hobby parameter is required',
      });
    }

    const users = await User.find({ hobbies: { $in: [hobby] } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      hobbies: { $in: [hobby] },
    });

    res.status(200).json({
      success: true,
      message: 'Users with hobby found',
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching by hobby',
      error: error.message,
    });
  }
};

// TEXT SEARCH - Search in bio and name
exports.textSearch = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const users = await User.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      $text: { $search: query },
    });

    res.status(200).json({
      success: true,
      message: 'Text search results',
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing text search',
      error: error.message,
    });
  }
};

// ANALYTICS - Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          averageAge: { $avg: '$age' },
          minAge: { $min: '$age' },
          maxAge: { $max: '$age' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'User statistics',
      data: stats[0] || {
        totalUsers: 0,
        averageAge: 0,
        minAge: 0,
        maxAge: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message,
    });
  }
};

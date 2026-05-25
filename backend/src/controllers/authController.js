const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockDb = require('../models/mockDb');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ai_interview_token';

exports.register = async (req, res) => {
  try {
    const { name, email, password, collegeName, branch, graduationYear } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Check if user already exists
    const existingUser = mockDb.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = mockDb.users.create({
      name,
      email,
      password: hashedPassword,
      collegeName: collegeName || "",
      branch: branch || "",
      graduationYear: graduationYear || "",
      xp: 100, // starting XP
      streak: 1,
      lastActive: new Date().toISOString(),
      badges: ["Novice Prep"]
    });

    // Create JWT Token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = mockDb.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Calculate daily streak
    const now = new Date();
    const lastActive = new Date(user.lastActive);
    const diffTime = Math.abs(now - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let currentStreak = user.streak || 1;
    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1; // streak reset
    }

    // Update streak and active date
    const updatedUser = mockDb.users.updateOne(
      { id: user.id },
      { 
        lastActive: now.toISOString(),
        streak: currentStreak
      }
    );

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = mockDb.users.findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (err) {
    console.error("Profile Retrieval Error:", err);
    return res.status(500).json({ message: "Server error retrieving profile" });
  }
};

exports.updateXpAndStreak = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { xpAmount, badgeToEarn } = req.body;

    const user = mockDb.users.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updatedXP = (user.xp || 0) + (xpAmount || 0);
    let badges = [...(user.badges || [])];

    if (badgeToEarn && !badges.includes(badgeToEarn)) {
      badges.push(badgeToEarn);
    }

    // Award badges based on total XP milestones
    if (updatedXP >= 500 && !badges.includes("Interview Scholar")) {
      badges.push("Interview Scholar");
    }
    if (updatedXP >= 1500 && !badges.includes("Coding Master")) {
      badges.push("Coding Master");
    }
    if (updatedXP >= 3000 && !badges.includes("Placement Ready")) {
      badges.push("Placement Ready");
    }

    const updatedUser = mockDb.users.updateOne(
      { id: userId },
      { xp: updatedXP, badges }
    );

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({
      message: "Progress updated successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Progress Update Error:", err);
    return res.status(500).json({ message: "Server error updating progress" });
  }
};

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
      badges: ["Novice Prep"],
      plan: "free"
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

exports.chatAssistant = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (apiKey) {
      try {
        const contents = [];
        
        const systemPrefix = "You are Aura, the premium AI Prep Assistant for the AI Mock Interview Platform. Provide direct, highly professional, encouraging, and actionable answers to candidates. Assist them with general placement queries, technical concepts, mock interview guidelines, resume edits, and coding problems. Keep responses concise, structured, and beautifully formatted in markdown.\\n\\n";

        if (chatHistory && chatHistory.length > 0) {
          chatHistory.forEach(turn => {
            contents.push({
              role: turn.role === 'user' ? 'user' : 'model',
              parts: [{ text: turn.text }]
            });
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: contents.length === 0 ? `${systemPrefix}${message}` : message }]
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (e) {
        console.warn("Gemini chatbot API call failed, using offline chatbot response:", e.message);
      }
    }

    let reply = "Hello! I am Aura, your AI interview preparation assistant. How can I help you optimize your tech prep today?";
    const msg = message.toLowerCase();
    if (msg.includes("interview")) {
      reply = "To prepare for your upcoming interview, you can configure targeted HR, Technical, or Behavioral rounds inside the **Interview Room** via the navigation sidebar. Make sure to complete the pre-interview coach checklists for eye tracking and voice setup!";
    } else if (msg.includes("resume") || msg.includes("ats")) {
      reply = "Our **Resume Hub** features a step-by-step PDF editor and live ATS compliance grader. It matches your credentials against jobs at Google, Stripe, and Netflix, and offers direct matched metrics and suggestions!";
    } else if (msg.includes("code") || msg.includes("coding") || msg.includes("sandbox")) {
      reply = "Try the **Coding Sandbox** page! It offers split panels with fully functional compilers checking multiple edge-cases in JavaScript, Python, C++, Java, and SQL.";
    } else if (msg.includes("whiteboard") || msg.includes("design")) {
      reply = "Use our new **Collaborative Board** in the sidebar to map system architectures and draw sketches with your peers. Sockets sync designs in real-time!";
    } else if (msg.includes("group") || msg.includes("debate") || msg.includes("gd")) {
      reply = "Explore the **Group Discussion** roundtable room. You can host and share P2P codes with friends to debate live topics, or practice solo alongside 4 speaking AI avatars!";
    } else if (msg.includes("roadmap") || msg.includes("career")) {
      reply = "Under the **Career Roadmap** page, check out interactive visual paths mapping concepts, milestones, and practice targets for Frontend, Backend, DevOps, or ML Engineer tracks.";
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat Assistant Error:", err);
    return res.status(500).json({ message: "Failed to fetch response from AI assistant" });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { plan } = req.body;

    const validPlans = ['free', 'pro', 'teams'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const user = mockDb.users.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = mockDb.users.updateOne(
      { id: userId },
      { plan }
    );

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({
      message: "Plan updated successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Update Plan Error:", err);
    return res.status(500).json({ message: "Server error updating plan" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, currentRole, location, bio, collegeName, branch, graduationYear } = req.body;

    const user = mockDb.users.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (currentRole !== undefined) updateFields.currentRole = currentRole;
    if (location !== undefined) updateFields.location = location;
    if (bio !== undefined) updateFields.bio = bio;
    if (collegeName !== undefined) updateFields.collegeName = collegeName;
    if (branch !== undefined) updateFields.branch = branch;
    if (graduationYear !== undefined) updateFields.graduationYear = graduationYear;

    const updatedUser = mockDb.users.updateOne({ id: userId }, updateFields);
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: "Profile updated successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = mockDb.users.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    mockDb.users.updateOne({ id: userId }, { password: hashedNewPassword });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    return res.status(500).json({ message: "Server error changing password" });
  }
};


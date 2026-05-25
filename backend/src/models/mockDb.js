const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/mock_db.json');

// Ensure data folder exists
const ensureDbDir = () => {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getDefaultQuestions = () => [
  // HR Questions
  {
    id: "q_hr_1",
    type: "HR",
    role: "All",
    company: "Common",
    difficulty: "Easy",
    question: "Tell me about yourself and walk me through your resume."
  },
  {
    id: "q_hr_2",
    type: "HR",
    role: "All",
    company: "Amazon",
    difficulty: "Medium",
    question: "Why do you want to work at Amazon, and how do you resonate with our Customer Obsession leadership principle?"
  },
  {
    id: "q_hr_3",
    type: "HR",
    role: "All",
    company: "Google",
    difficulty: "Hard",
    question: "Tell me about a time when you had a severe conflict with a manager or teammate. How did you handle it and what did you learn?"
  },
  {
    id: "q_hr_4",
    type: "HR",
    role: "All",
    company: "TCS",
    difficulty: "Easy",
    question: "Why should we hire you, and are you comfortable relocating to different project sites if required?"
  },
  {
    id: "q_hr_5",
    type: "HR",
    role: "All",
    company: "Infosys",
    difficulty: "Easy",
    question: "How do you handle working under tight deadlines and managing high-pressure situations?"
  },
  
  // Technical Questions
  {
    id: "q_tech_1",
    type: "Technical",
    role: "Software Engineer",
    company: "Common",
    difficulty: "Easy",
    question: "Explain the four main pillars of Object-Oriented Programming (OOP) with real-world examples."
  },
  {
    id: "q_tech_2",
    type: "Technical",
    role: "Web Developer",
    company: "Common",
    difficulty: "Medium",
    question: "What is the difference between Virtual DOM and Shadow DOM? How does React optimize rendering using the Virtual DOM?"
  },
  {
    id: "q_tech_3",
    type: "Technical",
    role: "Software Engineer",
    company: "Google",
    difficulty: "Hard",
    question: "How do indexes work internally in databases? Explain the differences between B-Trees and Hash indexes and when to use each."
  },
  {
    id: "q_tech_4",
    type: "Technical",
    role: "Data Analyst",
    company: "Amazon",
    difficulty: "Medium",
    question: "What are the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN in SQL? Give a practical scenario."
  },
  {
    id: "q_tech_5",
    type: "Technical",
    role: "AI/ML Engineer",
    company: "Google",
    difficulty: "Hard",
    question: "What is overfitting in Deep Learning? How do you detect it, and what regularization techniques can prevent it?"
  },

  // Behavioral Questions
  {
    id: "q_beh_1",
    type: "Behavioral",
    role: "All",
    company: "Google",
    difficulty: "Medium",
    question: "Describe a project that failed despite your best efforts. What went wrong, and how did you communicate the failure to stakeholders?"
  },
  {
    id: "q_beh_2",
    type: "Behavioral",
    role: "All",
    company: "Amazon",
    difficulty: "Hard",
    question: "Give me an example of a time when you had to make a critical decision with extremely limited data or time constraints. What was the outcome?"
  },

  // Coding Challenges (DSA)
  {
    id: "q_code_1",
    type: "Coding",
    role: "Software Engineer",
    company: "TCS",
    difficulty: "Easy",
    title: "Reverse a String",
    description: "Write a function `reverseString(s)` that takes a string and returns its reversed version.",
    testCases: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "a", expected: "a" }
    ],
    templates: {
      javascript: "function reverseString(s) {\n  // Write your code here\n  return s.split('').reverse().join('');\n}",
      python: "def reverse_string(s):\n    # Write your code here\n    return s[::-1]",
      cpp: "#include <string>\nusing namespace std;\nstring reverseString(string s) {\n    // Write your code here\n}",
      java: "public class Solution {\n    public static String reverseString(String s) {\n        // Write your code here\n        return \"\";\n    }\n}"
    }
  },
  {
    id: "q_code_2",
    type: "Coding",
    role: "Software Engineer",
    company: "Google",
    difficulty: "Medium",
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.",
    testCases: [
      { input: "[2, 7, 11, 15], 9", expected: "[0, 1]" },
      { input: "[3, 2, 4], 6", expected: "[1, 2]" },
      { input: "[3, 3], 6", expected: "[0, 1]" }
    ],
    templates: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (diff in map) {\n      return [map[diff], i];\n    }\n    map[nums[i]] = i;\n  }\n}",
      python: "def two_sum(nums, target):\n    # Write your code here\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i",
      cpp: "#include <vector>\n#include <unordered_map>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}",
      java: "import java.util.HashMap;\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}"
    }
  },
  {
    id: "q_code_3",
    type: "Coding",
    role: "Software Engineer",
    company: "Infosys",
    difficulty: "Easy",
    title: "Palindrome Number",
    description: "Determine whether an integer `x` is a palindrome. Return `true` if it is, and `false` otherwise.",
    testCases: [
      { input: "121", expected: "true" },
      { input: "-121", expected: "false" },
      { input: "10", expected: "false" }
    ],
    templates: {
      javascript: "function isPalindrome(x) {\n  // Write your code here\n  if (x < 0) return false;\n  const str = x.toString();\n  return str === str.split('').reverse().join('');\n}",
      python: "def is_palindrome(x):\n    # Write your code here\n    if x < 0: return False\n    return str(x) == str(x)[::-1]",
      cpp: "using namespace std;\nbool isPalindrome(int x) {\n    // Write your code here\n}",
      java: "public class Solution {\n    public static boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n}"
    }
  }
];

const readDb = () => {
  ensureDbDir();
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      users: [],
      interviews: [],
      resumes: [],
      questions: getDefaultQuestions(),
      leaderboard: [],
      challenges: [
        { id: "ch_1", title: "Array Master", description: "Solve 2 array problems in a day", xp: 100 },
        { id: "ch_2", title: "Speech Perfect", description: "Complete a mock HR interview with >90% fluency", xp: 150 },
        { id: "ch_3", title: "Daily Grind", description: "Attend your daily mock check-in challenge", xp: 50 }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error("Error reading Mock DB, resetting file:", err);
    const defaultData = {
      users: [],
      interviews: [],
      resumes: [],
      questions: getDefaultQuestions(),
      leaderboard: [],
      challenges: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
};

const writeDb = (data) => {
  ensureDbDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const mockDbManager = {
  // Common Read/Write
  getData: () => readDb(),
  saveData: (data) => writeDb(data),

  // Users
  users: {
    find: () => readDb().users,
    findOne: (query) => {
      const db = readDb();
      return db.users.find(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: (userData) => {
      const db = readDb();
      const newUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        xp: 100,
        streak: 1,
        lastActive: new Date().toISOString(),
        badges: ["Novice Interviewee"],
        ...userData,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeDb(db);
      return newUser;
    },
    updateOne: (query, updateData) => {
      const db = readDb();
      const index = db.users.findIndex(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      });
      if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updateData };
        writeDb(db);
        return db.users[index];
      }
      return null;
    }
  },

  // Interviews
  interviews: {
    find: (query = {}) => {
      const db = readDb();
      return db.interviews.filter(i => {
        for (let key in query) {
          if (i[key] !== query[key]) return false;
        }
        return true;
      });
    },
    findOne: (query) => {
      const db = readDb();
      return db.interviews.find(i => {
        for (let key in query) {
          if (i[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: (interviewData) => {
      const db = readDb();
      const newInterview = {
        id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        status: "ongoing",
        transcript: [],
        startedAt: new Date().toISOString(),
        ...interviewData
      };
      db.interviews.push(newInterview);
      writeDb(db);
      return newInterview;
    },
    updateOne: (query, updateData) => {
      const db = readDb();
      const index = db.interviews.findIndex(i => {
        for (let key in query) {
          if (i[key] !== query[key]) return false;
        }
        return true;
      });
      if (index !== -1) {
        db.interviews[index] = { ...db.interviews[index], ...updateData };
        writeDb(db);
        return db.interviews[index];
      }
      return null;
    }
  },

  // Resumes
  resumes: {
    find: (query = {}) => {
      const db = readDb();
      return db.resumes.filter(r => {
        for (let key in query) {
          if (r[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: (resumeData) => {
      const db = readDb();
      const newResume = {
        id: `res_${Date.now()}`,
        uploadedAt: new Date().toISOString(),
        ...resumeData
      };
      db.resumes.push(newResume);
      writeDb(db);
      return newResume;
    }
  },

  // Questions Database
  questions: {
    find: (query = {}) => {
      const db = readDb();
      return db.questions.filter(q => {
        for (let key in query) {
          if (query[key] === "All" || query[key] === "Common") continue;
          if (q[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: (questionData) => {
      const db = readDb();
      const newQuestion = {
        id: `q_${Date.now()}`,
        ...questionData
      };
      db.questions.push(newQuestion);
      writeDb(db);
      return newQuestion;
    }
  }
};

module.exports = mockDbManager;

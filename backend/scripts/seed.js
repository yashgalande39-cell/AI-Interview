/**
 * TRESK AI — Database Seed Script
 * =====================================================================
 * Seeds the questions bank and default data into PostgreSQL.
 * Run once after first startup:
 *   node scripts/seed.js
 *
 * Requirements: DATABASE_URL or PG_* env vars must be set in .env
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false }
    : {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT || '5432'),
        database: process.env.PG_DATABASE || 'tresk_ai',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || '',
      }
);

const questions = [
  // ── HR ─────────────────────────────────────────────────────────────────────
  { type: 'HR', role: 'All', company: 'Common',  difficulty: 'Easy',   question: 'Tell me about yourself and walk me through your resume.', tags: ['intro'] },
  { type: 'HR', role: 'All', company: 'Amazon',  difficulty: 'Medium', question: 'Why do you want to work at Amazon, and how do you resonate with our Customer Obsession leadership principle?', tags: ['amazon-lp'] },
  { type: 'HR', role: 'All', company: 'Google',  difficulty: 'Hard',   question: 'Tell me about a time when you had a severe conflict with a manager or teammate. How did you handle it?', tags: ['conflict'] },
  { type: 'HR', role: 'All', company: 'TCS',     difficulty: 'Easy',   question: 'Why should we hire you, and are you comfortable relocating to different project sites if required?', tags: ['relocation'] },
  { type: 'HR', role: 'All', company: 'Infosys', difficulty: 'Easy',   question: 'How do you handle working under tight deadlines and managing high-pressure situations?', tags: ['pressure'] },
  { type: 'HR', role: 'All', company: 'Microsoft', difficulty: 'Medium', question: 'Describe a time you disagreed with a technical decision and how you handled it.', tags: ['growth-mindset'] },
  { type: 'HR', role: 'All', company: 'Flipkart', difficulty: 'Medium', question: 'Tell me about a project you are most proud of and what impact it created.', tags: ['impact'] },

  // ── Technical ──────────────────────────────────────────────────────────────
  { type: 'Technical', role: 'Software Engineer', company: 'Common',  difficulty: 'Easy',   question: 'Explain the four main pillars of Object-Oriented Programming with real-world examples.', tags: ['oop'] },
  { type: 'Technical', role: 'Web Developer',     company: 'Common',  difficulty: 'Medium', question: 'What is the difference between Virtual DOM and Shadow DOM? How does React optimize rendering?', tags: ['react', 'dom'] },
  { type: 'Technical', role: 'Software Engineer', company: 'Google',  difficulty: 'Hard',   question: 'How do indexes work internally in databases? Explain B-Trees vs Hash indexes.', tags: ['databases', 'indexing'] },
  { type: 'Technical', role: 'Software Engineer', company: 'Amazon',  difficulty: 'Medium', question: 'Explain the CAP theorem and how you would design a distributed system that prioritizes availability.', tags: ['distributed', 'cap-theorem'] },
  { type: 'Technical', role: 'AI/ML Engineer',    company: 'Google',  difficulty: 'Hard',   question: 'What is overfitting in Deep Learning? How do you detect and prevent it?', tags: ['ml', 'regularization'] },
  { type: 'Technical', role: 'Software Engineer', company: 'Microsoft', difficulty: 'Hard', question: 'Explain the difference between process and thread. How does the OS schedule them?', tags: ['os', 'concurrency'] },
  { type: 'Technical', role: 'Software Engineer', company: 'Flipkart', difficulty: 'Medium', question: 'How would you design a URL shortening service like Bit.ly?', tags: ['system-design', 'hashing'] },

  // ── Behavioral ─────────────────────────────────────────────────────────────
  { type: 'Behavioral', role: 'All', company: 'Google',  difficulty: 'Medium', question: 'Describe a project that failed despite your best efforts. What went wrong, and how did you communicate it?', tags: ['failure', 'communication'] },
  { type: 'Behavioral', role: 'All', company: 'Amazon',  difficulty: 'Hard',   question: 'Give an example of when you had to make a critical decision with limited data or time constraints.', tags: ['decision-making'] },
  { type: 'Behavioral', role: 'All', company: 'Microsoft', difficulty: 'Medium', question: 'Tell me about a time you mentored someone junior and what you learned from the experience.', tags: ['leadership', 'mentoring'] },

  // ── Coding (DSA) ───────────────────────────────────────────────────────────
  {
    type: 'Coding', role: 'Software Engineer', company: 'TCS', difficulty: 'Easy',
    title: 'Reverse a String',
    description: 'Write a function `reverseString(s)` that returns the reversed string.',
    test_cases: JSON.stringify([
      { input: 'hello', expected: 'olleh' },
      { input: 'world', expected: 'dlrow' },
      { input: 'a', expected: 'a' }
    ]),
    templates: JSON.stringify({
      javascript: "function reverseString(s) {\n  return s.split('').reverse().join('');\n}",
      python: "def reverse_string(s):\n    return s[::-1]",
      cpp: "#include <string>\nusing namespace std;\nstring reverseString(string s) {\n    // Write your code here\n}",
      java: "public class Solution {\n    public static String reverseString(String s) {\n        return new StringBuilder(s).reverse().toString();\n    }\n}"
    }),
    tags: ['strings', 'easy']
  },
  {
    type: 'Coding', role: 'Software Engineer', company: 'Google', difficulty: 'Medium',
    title: 'Two Sum',
    description: 'Given an array `nums` and integer `target`, return indices of two numbers that add up to target.',
    test_cases: JSON.stringify([
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6', expected: '[1,2]' },
      { input: '[3,3], 6', expected: '[0,1]' }
    ]),
    templates: JSON.stringify({
      javascript: "function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (diff in map) return [map[diff], i];\n    map[nums[i]] = i;\n  }\n}",
      python: "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen: return [seen[diff], i]\n        seen[num] = i",
      cpp: "#include <vector>\n#include <unordered_map>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}",
      java: "import java.util.HashMap;\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}"
    }),
    tags: ['arrays', 'hash-map', 'medium']
  },
  {
    type: 'Coding', role: 'Software Engineer', company: 'Amazon', difficulty: 'Hard',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    test_cases: JSON.stringify([
      { input: 'abcabcbb', expected: '3' },
      { input: 'bbbbb', expected: '1' },
      { input: 'pwwkew', expected: '3' }
    ]),
    templates: JSON.stringify({
      javascript: "function lengthOfLongestSubstring(s) {\n  let map = {}; let left = 0; let max = 0;\n  for (let right = 0; right < s.length; right++) {\n    if (map[s[right]] >= left) left = map[s[right]] + 1;\n    map[s[right]] = right;\n    max = Math.max(max, right - left + 1);\n  }\n  return max;\n}",
      python: "def length_of_longest_substring(s):\n    seen = {}\n    left = 0; max_len = 0\n    for right, ch in enumerate(s):\n        if ch in seen and seen[ch] >= left:\n            left = seen[ch] + 1\n        seen[ch] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len",
      cpp: "#include <string>\n#include <unordered_map>\nusing namespace std;\nint lengthOfLongestSubstring(string s) {\n    // Sliding window approach\n}",
      java: "import java.util.HashMap;\npublic class Solution {\n    public static int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}"
    }),
    tags: ['sliding-window', 'strings', 'hard']
  },
  {
    type: 'Coding', role: 'Software Engineer', company: 'Microsoft', difficulty: 'Medium',
    title: 'Valid Parentheses',
    description: 'Given a string containing `(`, `)`, `{`, `}`, `[`, `]`, determine if the string is valid.',
    test_cases: JSON.stringify([
      { input: '()', expected: 'true' },
      { input: '()[]{}\r', expected: 'true' },
      { input: '(]', expected: 'false' }
    ]),
    templates: JSON.stringify({
      javascript: "function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', ']': '[', '}': '{' };\n  for (const ch of s) {\n    if (!map[ch]) { stack.push(ch); }\n    else if (stack.pop() !== map[ch]) return false;\n  }\n  return stack.length === 0;\n}",
      python: "def is_valid(s):\n    stack = []\n    mapping = {')': '(', ']': '[', '}': '{'}\n    for ch in s:\n        if ch not in mapping: stack.append(ch)\n        elif not stack or stack.pop() != mapping[ch]: return False\n    return not stack",
      cpp: "#include <string>\n#include <stack>\nusing namespace std;\nbool isValid(string s) {\n    // Stack approach\n}",
      java: "import java.util.Stack;\npublic class Solution {\n    public static boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}"
    }),
    tags: ['stack', 'strings', 'medium']
  }
];

async function seed() {
  console.log('🌱 Starting database seed...');

  for (const q of questions) {
    await pool.query(`
      INSERT INTO questions (type, role, company, difficulty, question, title, description, test_cases, templates, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT DO NOTHING
    `, [
      q.type, q.role, q.company, q.difficulty,
      q.question || null, q.title || null, q.description || null,
      q.test_cases || null, q.templates || null,
      q.tags
    ]);
  }

  console.log(`✅ Seeded ${questions.length} questions into the questions bank.`);
  await pool.end();
  console.log('🐘 Seed complete. Database connection closed.');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

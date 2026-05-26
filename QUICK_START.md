# 🚀 Quick Start Guide - AI Mock Interview Platform

## Get Running in 5 Minutes!

### Step 1: Install Dependencies (2 minutes)

Open **Command Prompt** or **PowerShell** and run:

```bash
# Navigate to project
cd "c:\Users\ASUS\Downloads\Ai Interview platform"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..\frontend
npm install --legacy-peer-deps
```

### Step 2: Configure Backend (30 seconds)

```bash
# Go to backend folder
cd ..\backend
```

Create a file named `.env` with this content:

```env
PORT=5000
JWT_SECRET=super_secret_key_change_this_later
MONGODB_URI=
GEMINI_API_KEY=
```

**Note**: Empty values = Mock mode (no setup needed!)

### Step 3: Start Backend (30 seconds)

```bash
# From backend folder
npm start
```

✅ You should see: `🚀 AI Mock Interview Backend running on http://localhost:5000`

### Step 4: Start Frontend (30 seconds)

Open a **NEW terminal** window:

```bash
# Navigate to frontend
cd "c:\Users\ASUS\Downloads\Ai Interview platform\frontend"

# Start development server
npm run dev
```

✅ You should see: `Local: http://localhost:5173/`

### Step 5: Open in Browser (10 seconds)

Open your browser and go to:

```
http://localhost:5173
```

## 🎉 You're Done!

### Test the Platform

1. **Register** a new account (or use demo mode)
2. **Start an Interview** from the lobby
3. **Try Voice Input** (click microphone icon)
4. **Test Coding Sandbox** (solve a challenge)
5. **Check Dashboard** (view analytics)

---

## 📱 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/status

---

## 🔧 Common Issues

### Port Already in Use?

**Backend (Port 5000)**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend (Port 5173)**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Module Not Found?

```bash
# Delete and reinstall
cd backend
rmdir /s node_modules
del package-lock.json
npm install

cd ..\frontend
rmdir /s node_modules
del package-lock.json
npm install --legacy-peer-deps
```

### Can't Hear AI Voice?

- Use **Chrome** or **Edge** browser
- Check browser permissions for microphone
- Ensure speakers/headphones are connected

---

## 🎯 Key Features to Try

### 1. Voice Interview
- Click **"Start Live Mock"** on dashboard
- Choose interview type (HR, Technical, Behavioral)
- Click microphone icon to speak
- AI responds with voice

### 2. Coding Challenges
- Navigate to **Coding Editor**
- Select a problem from sidebar
- Write code in editor
- Click **"Run Code"** to test
- Click **"Submit"** to validate

### 3. Resume Analysis
- Go to **Resume Analyzer**
- Upload your PDF resume
- Get ATS score and feedback
- Resume-based questions generated

### 4. Analytics Dashboard
- View performance trends
- Check skill radar chart
- See readiness score
- Track XP and badges

---

## 📚 Full Documentation

For detailed setup, configuration, and troubleshooting:

👉 **See [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🆘 Need Help?

1. Check **SETUP_GUIDE.md** for detailed instructions
2. Review browser console for errors (F12)
3. Verify both servers are running
4. Ensure Node.js v18+ is installed

---

## 🎓 Demo Credentials (Mock Mode)

- **Email**: demo@example.com
- **Password**: password123

---

## ⚡ Pro Tips

1. **Keep both terminals open** while using the app
2. **Use Chrome/Edge** for best compatibility
3. **Grant microphone/camera permissions** when prompted
4. **Check console logs** if something doesn't work
5. **Restart servers** if you make code changes

---

## 🚀 Next Steps

Once you're comfortable with the platform:

1. ✅ Add your own interview questions
2. ✅ Customize branding and colors
3. ✅ Set up MongoDB for persistence
4. ✅ Get Gemini API key for better AI
5. ✅ Deploy to cloud (Vercel, Netlify, etc.)

---

**Happy Interviewing! 🎯**

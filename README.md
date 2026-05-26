AI Assessment Creator 📚🤖

An AI-powered assessment generation platform built using Next.js, Node.js, MongoDB, Redis, and BullMQ.
Teachers can create assignments, upload study material, generate structured question papers using AI, and export professionally formatted assessments.

✨ Features
🎯 Assignment Creation

Teachers can:

Upload PDF / text files (optional)
Set due dates
Select question types
Configure:
Number of questions
Marks distribution
Add additional instructions
✅ Validation Included
Required field validation
No negative values
Proper form error handling
🤖 AI Question Generation

The platform converts user input into a structured AI prompt and generates:

Multiple sections (Section A, B, etc.)
Questions
Difficulty levels
Easy
Moderate
Hard
Marks allocation
⚡ Important

The application does not render raw LLM output.
Responses are parsed into a clean structured schema before rendering.

⚙️ Backend Architecture
Tech Stack
Node.js
Express.js
TypeScript
MongoDB
Redis
BullMQ
WebSocket (Socket.IO)
🔄 Generation Flow
Frontend Request
      ↓
REST API Call
      ↓
BullMQ Queue
      ↓
Worker Processes AI Generation
      ↓
MongoDB Stores Results
      ↓
WebSocket Sends Real-Time Update
      ↓
Frontend Updates UI
🖥️ Frontend

Built with:

Next.js 15
TypeScript
Zustand / Redux
Tailwind CSS
Socket.IO Client
Key Features
Responsive UI
Real-time generation updates
Form validation
Clean exam-paper layout
Difficulty badges
Loading states & skeletons
📦 Backend

Built with:

Express.js
TypeScript
MongoDB + Mongoose
Redis
BullMQ
Socket.IO
Backend Responsibilities
Assignment APIs
AI orchestration
Queue management
Background workers
PDF generation
WebSocket updates
🧠 AI Integration

Supports:

OpenAI GPT
Claude
Open-source LLMs
AI Pipeline
User input collection
Prompt structuring
AI generation
JSON parsing
Schema validation
Structured rendering
📄 Output Page

The generated assessment includes:

👨‍🎓 Student Information Section
Name
Roll Number
Section
📝 Structured Question Sections

Each section contains:

Title
Instructions
Questions list

Each question displays:

Question text
Difficulty tag
Marks
🎨 UI/UX Highlights
Clean exam-paper inspired layout
Mobile responsive
Proper hierarchy and spacing
Interactive difficulty badges
Real-time status indicators
🚀 Bonus Features

✅ PDF Export
✅ Regenerate Questions
✅ Redis Caching
✅ Queue-based processing
✅ Real-time WebSocket updates
✅ Structured AI parsing

🏗️ Project Structure
root
│
├── frontend
│   ├── app
│   ├── components
│   ├── store
│   ├── hooks
│   └── services
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── routes
│   │   ├── workers
│   │   ├── queues
│   │   ├── services
│   │   ├── sockets
│   │   └── models
│
└── README.md
🛠️ Installation
1️⃣ Clone Repository
git clone https://github.com/your-username/ai-assessment-creator.git
2️⃣ Install Dependencies
Frontend
cd frontend
npm install
Backend
cd backend
npm install
🔐 Environment Variables
Backend .env
PORT=5000

MONGO_URI=

REDIS_HOST=
REDIS_PORT=

OPENAI_API_KEY=

CLIENT_URL=http://localhost:3000
▶️ Running the Project
Start Backend
npm run dev
Start Worker
npm run worker
Start Frontend
npm run dev
🔌 WebSocket Events
Client → Server
join-assignment-room
generate-assignment
Server → Client
generation-started
generation-progress
generation-completed
generation-failed
📚 API Endpoints
Assignment APIs
Create Assignment
POST /api/assignments
Get Assignment
GET /api/assignments/:id
Generate Questions
POST /api/generate
📄 PDF Export

The generated assessment can be downloaded as a professionally formatted PDF using background workers and queue processing.

🧪 Validation & Error Handling
Schema validation
Queue failure handling
Retry mechanisms
API error middleware
Socket reconnection handling
📈 Scalability Considerations
Queue-based AI processing
Redis caching
Background workers
Modular architecture
Reusable AI pipeline
🎯 Future Improvements
Multi-language support
Teacher dashboard analytics
AI-generated answer keys
Collaborative assessment editing
Role-based authentication
📷 Figma Reference

Figma Design:
AI Assessment Creator Figma

📬 Submission
GitHub Repository

Include:

Clean code structure
Proper commits
Setup instructions
README
Architecture overview
Technical approach
Setup guide

Submission Form:
Submit Here

👨‍💻 Author

Built with ❤️ using modern full-stack technologies and AI-powered workflows.

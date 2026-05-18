GoalTrack: Enterprise Goal Alignment & Tracking
AtomQuest Hackathon 1.0 Submission | Atomberg Technologies
GoalTrack is a structured, web-based Goal Setting & Tracking Portal designed to eliminate manual performance management pain points. It provides real-time visibility, automated goal alignment, and a seamless audit-ready environment for employees, managers, and HR.
🌐 Live Demo
👉 https://ai.studio/apps/79470a95-902b-4b88-8b26-3a8bbdc0d2c3
💡 Key Features
Role-Based Workflows: Distinct portals for Employee (goal submission), Manager (approval/dashboard), and Admin (cycle management).
Validation Engine: Real-time enforcement of business rules:
✅ Total weightage strictly 100%.
✅ Minimum weightage per goal (10%).
✅ Maximum goal limit (8 goals).
Approval & Lock Logic: Manager-led approval workflow; once approved, goals are system-locked to ensure audit integrity.
Analytics Module: Visual dashboards for tracking organizational performance and completion rates.
Audit Trail: Immutable logging of all changes made to goal sheets post-lock.
🛠 Tech Stack
Frontend: React.js (SPA)
Styling: Tailwind CSS
State Management: React Context API
Visualization: Recharts (for Analytics)
Icons: Lucide-React
🏗 System Architecture
![alt text](image.png)
🔑 Demo Credentials
Switch between roles using the role-switcher toggle in the top-right navigation.
Role	Username	Password
Employee	aisha.kumar	demo123
Manager	vikram.sharma	demo123
Admin	neha.joshi	demo123
🚀 How to Run Locally
Clone the repository:
code
Bash
git clone [your-repo-url]
cd goaltrack
Install dependencies:
code
Bash
npm install
Start the development server:
code
Bash
npm run dev
Access the app:
Open http://localhost:5173 in your browser.
🏆 Hackathon Compliance

Phase 1 (Goal Creation): Fully implemented with validation logic.

Phase 2 (Check-ins): Quarterly tracking and actuals logging included.

Bonus (Analytics): Dashboard implemented for evaluation credit.

Audit Ready: Change logs for locked goals included.
📝 Evaluation Notes
This solution was built with a focus on User Experience (UX) and Adherence to Business Rules. The validation engine is abstracted to allow for easy updates, and the UI is fully responsive for mobile and desktop usage

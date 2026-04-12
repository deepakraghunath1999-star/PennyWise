# 🪙 PennyWise

**PennyWise** is an intelligent financial planning and retirement simulation platform designed to turn complex financial data into actionable, life-changing strategies. Using advanced Monte Carlo simulations and AI-driven insights, PennyWise helps users architect their path to absolute financial independence.

![PennyWise Dashboard](https://picsum.photos/seed/finance/1200/600)

## 🚀 Key Features

### 📊 Monte Carlo Simulator
Run 5,000+ simulation paths to project your wealth at retirement. Adjust parameters like inflation, risk profile, and withdrawal strategies in real-time to see their impact on your success rate.

### 🧠 AI Advisor (PennyWise Intelligence)
A neural strategy engine that analyzes your specific simulation data to provide professional, actionable financial advice. Stress-test your plan against market volatility or ask for tax optimization strategies.

### ⚡ Nudge Engine
Transform your financial behavior through daily micro-habits. The Nudge Engine analyzes your transactions to provide "nudges" that help you save more and spend smarter.

### 📈 Income Growth Optimizer
Upload your resume for a deep AI analysis of your career trajectory. Unlock a personalized growth roadmap, identify skill gaps, and discover career-aligned side hustles to multiply your primary income.

### 🏦 Bank Link Integration
Securely link your accounts to auto-detect salary deposits, recurring bills, and daily spending. Keep your retirement plan 100% accurate with real-time data syncing.

### 🛡️ Expense Audit
An AI-powered negotiation assistant that identifies wasteful recurring subscriptions and inflated bills, helping you claw back thousands of dollars annually.

### 🎯 Milestones & Scenarios
*   **Milestones**: A personalized financial roadmap that tracks your progress toward key goals.
*   **Scenarios**: Save, compare, and iterate on different financial strategies to find your optimal path.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18+](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **AI Engine**: [Groq](https://groq.com/) with Llama 3.3 70B Versatile
- **File Parsing**: [PDF.js](https://mozilla.github.io/pdf.js/) & [Mammoth](https://github.com/mwilliamson/mammoth.js)

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project
- A Groq API Key (Llama 3.3 70B Versatile)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/pennywise.git
    cd pennywise
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root directory and add your keys (see `.env.example`):
    ```env
    GEMINI_API_KEY=your_gemini_api_key
    VITE_FIREBASE_API_KEY=your_firebase_key
    # ... other firebase config
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

---

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components
│   ├── ui/           # Base UI primitives
│   ├── WealthLab/    # Income, Expense, and Bank tools
│   └── AIAdvisor/    # Neural strategy engine
├── lib/              # Core logic & utilities
│   ├── monteCarlo.ts # Simulation engine
│   ├── firebase.ts   # Firebase configuration
│   └── utils.ts      # Helper functions
├── App.tsx           # Main application entry
└── index.css         # Global styles & Tailwind imports
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**PennyWise** — *Architecting your financial freedom, one nudge at a time.*

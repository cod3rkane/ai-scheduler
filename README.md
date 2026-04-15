# Scheduler-AI
🗓️ AI-Powered Staff Scheduler

An intelligent, automated scheduling platform that combines a Bipartite Matching algorithm with a Llama-powered AI
assistant to manage workforce assignments seamlessly.

For a quick start up in `development` mode, you can simply run:
```jsx
npm run init
```

✦ To run the AI Staff Scheduler, follow these steps:

1. Prerequisites 
- Ensure you have the following installed:
  * Node.js (v20 or higher)

2. Install Dependencies
In the project root, run:
   `npm install`

3. Initialize the Database
   This project uses a local SQLite database (scheduler.db). You need to populate it with initial workers and
   requirements:

`npm run db:populate`

   This will create the database file and seed it with 10 sample workers (Alice, Bob, etc.) and standard weekly staffing
   rules.

4. Start the Development Server
   Run the project in development mode:

 `npm run dev`

* Frontend: Usually available at http://localhost:8080
* BFF (API): Automatically handled by Modern.js.

5. Access the Chat
   Navigate to http://localhost:8080/chat to start interacting with the AI.

  ---

🛠️ Useful Commands
* npm run test:matching: Runs a simulation test to verify the scheduling algorithm is correctly assigning workers
  while respecting time-off.
* npm run build: Creates a production-ready build in the dist/ folder.
* npm run serve: Previews the production build locally.

💡 Troubleshooting
* AI not responding? Make sure Ollama is running (ollama serve) and you have pulled the llama3.2:3b model.
* Database errors? Delete scheduler.db and run npm run db:populate again to reset the state

✨ Key Features

* 🤖 AI-Driven Management: Chat with a built-in assistant to add workers, check availability, or generate complete
  schedules using natural language.
* 📅 Automated Smart Filling: Uses a specialized matching algorithm to assign the right workers to the right roles
  while strictly respecting time-off requests and daily staffing requirements.
* 📊 Interactive Visual Timeline: Dynamic, grid-based visualization of staff assignments, allowing you to see your
  entire week's coverage at a glance.
* 🔍 Advanced Filtering: Quickly find workers by name, role, or specific skill sets (e.g., "Find a Cook who knows
  Pastry").
* ⚡ Modern BFF Architecture: Built on Modern.js, leveraging a high-performance Backend-for-Frontend (BFF) pattern
  with typed Lambda functions.

🛠️ Tech Stack

* Frontend: React 19, TypeScript, Tailwind CSS
* Backend: Modern.js (BFF Framework), Node.js 20+
* Database: SQLite (node:sqlite for native performance)
* UI Components: assistant-ui for a polished chat experience and custom Radix primitives.

🚀 How it Works

1. Define Requirements: Set how many Managers, Cooks, and Servers you need for each day of the week.
2. Manage Availability: Record worker time-off requests directly through the AI chat.
3. Generate & Visualize: Ask the AI to "Fill the schedule for next week." The system solves the matching problem and
   displays the result in an interactive visual timeline.

  ---

💡 Example Prompts to try:
> "Show me a visual schedule for the next 3 days."
> "Who is working this Friday?"
> "Add a new Cook named Marcus with Grill skills."
> "Bob needs next Tuesday off, can you update that?"

  ---
# Notes and Considerations
This app was Roughly 60-70% built using A.I, well deserved credits to:
- Hermes CLI
- llama3.2:3b Model
- gemini-2.0-flash and gemini-2.5-flash Models
- Gemini CLI

## You can change the model at `api/lambda/chat/index.ts:37`
- If you run Llama models Locally there is a branch for you ❤️ `local-llama`

## Learn more
- [Made With Love ❤️ by @Cod3rkane](https://github.com/cod3rkane) - your feedback and contributions are welcome!

---

# Xender

Xender is a Chrome extension that allows users to tip their favorite creators on X using Stacks (STX). It works by injecting a button into tweets if the person's display name is a valid BNS (e.g., `atomic.btc`, `flames.stx`). Xender supports tipping with whitelisted tokens like MEME, VELAR, and more. Currently, it supports X, with Discord support and a leaderboard in development.

## Demo
https://github.com/user-attachments/assets/241cacba-f635-4f48-a3e1-f72efb31140a


## Features

- **BNS Support**: Injects a tip button if the user's display name is a valid BNS, including `.btc`, `.stx`, and `.id` namespaces.
- **Whitelisted Tokens**: Users can tip with specific tokens such as MEME and VELAR.
- **X Platform Integration**: Currently integrated with X (formerly Twitter).
- **Discord Support Coming Soon**: Tipping functionality will soon extend to Discord.
- **Leaderboard in Development**: A leaderboard system is being built to rank users based on tips.

## Tech Stack

- **Frontend**: 
  - Chrome Extension: `WXT` and `Vite` for bundling.
  - Landing Page: `Vite` and `React`.
  - Styling: `Tailwind CSS` and `ShadCN`.

- **Backend**: 
  - `Hono` for the backend framework.
  - `PostgreSQL` as the database.
  - `Drizzle` ORM for database interactions.

## Project Structure

The project is divided into three main folders:

1. **Extension**: The Chrome extension that injects the tip button into X posts.
2. **Landing Page**: The web page where users can learn more about Xender and interact with the platform.
3. **Backend**: The backend powering the extension.

```
/xender
  /xender-extension            # Extension code (Only chrome is supported for now)
  /xender-frontend       # Vite/React landing page code
  /xender-backend              # Backend code using Hono, PostgreSQL, and Drizzle
```

## Setup Instructions

### Prerequisites

- Node.js >= 18
- PostgreSQL (for backend)
- Bun
- Chrome or Chromium browser (to test the extension)

### Install Dependencies

1. **Clone the repository:**

   ```bash
   git clone https://github.com/iatomic1/xender
   cd xender
   ```

2. **Install dependencies for the backend, extension, and landing page:**

   ```bash
   # For the backend
   cd xender-backend
   bun install

   # For the extension
   cd ../xender-extension
   bun install

   # For the landing page
   cd ../xender-frontend
   bun install
   ```

### Running the Project

1. **Backend:**

   To start the backend server:

   ```bash
   cd xender-backend
   npm run dev
   ```

   This will run the Hono server on your local machine.

2. **Extension:**
   ```bash
   cd xender-extension
   bun run dev
   ```
   - Navigate to the `extension` folder and load the extension in Chrome:
     - Open `chrome://extensions/`
     - Enable "Developer mode"
     - Click "Load unpacked" and select the `extension` folder (its in the build folder)
     - The extension will now be active and injecting buttons into tweets.

3. **Landing Page:**

   To run the landing page locally:

   ```bash
   cd xender-frontend
   bun run dev
   ```

   This will start a local development server, usually on `http://localhost:3000`.

### Database Setup

1. Set up PostgreSQL and create a database for your project.
2. Update the connection details in the backend environment configuration (`.env` file).
3. Run the necessary migrations using `Drizzle` to set up the database schema.

## Contributing

We welcome contributions to improve Xender! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please make sure to follow the code style and write tests for any new features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## TODO

- **Discord Support**: Adding tipping functionality to Discord.
- **Leaderboard**: Development of a leaderboard to track the most generous users.

---

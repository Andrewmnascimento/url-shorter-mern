## URL Shorter
A simple URL shortener built with Node.js ,Express ,MongoDB and Redis in Backend and React in Frontend. This project allows users to create shortened URLs that redirect to the original long URLs.

### How to Run the Project
1. Install dependencies:
   ```bash
   cd backend
   pnpm install
   cd ../frontend
   pnpm install
2. Start the development server:
   ```bash
   npm run dev # on frontend
   node server.js # on backend
   ``` 
Or you can use docker-compose to run the project:
1. Run the following command in the root directory of the project:
   ```bash
   docker-compose up -d

3. Open your browser and navigate to `http://localhost:5173` or other link if you defines to access the frontend of the URL shortener.

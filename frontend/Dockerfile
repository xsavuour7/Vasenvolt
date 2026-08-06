# --- Frontend Dockerfile (Vite + React + TS) ---

    FROM node:22-alpine

    WORKDIR /vasenvolt
    
    COPY package*.json ./
    
    RUN npm install
    
    COPY . .
    
    EXPOSE 5173
    
    CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
    
    ENV APP_ENV=production

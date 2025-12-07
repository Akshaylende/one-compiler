# One Compiler #

# Frontend #

/client
├── /src
│   ├── App.js           # Main Component
│   ├── Compiler.js      # The Editor & Logic
│   └── style.css        # Basic styling
├── index.html           # Entry point for Parcel
├── package.json
└── Dockerfile           # For production build


Terminal -
cd client 

step 1 - 
npm init -y

step 2 - 
# Core dependencies
npm install react react-dom @monaco-editor/react axios

# Build tool (Parcel)
npm install -D parcel process

# Run the ReactApp
npm start 


# Server #

├── /server                  # Backend (Node API + Worker)
│   ├── /temp                # Shared folder for code files (Host <-> Docker)
│   ├── app.js               # Express Server (API)
│   ├── worker.js            # Background Worker (Handles Docker)
│   ├── package.json


Terminal -
cd client 

step 1 - 
npm init -y

step 2-
npm install express bullmq ioredis cors fs-extra



To run the server Execute in seperate terminal

Redis - docker run -p 6379:6379 redis

cd server
npm start   // start the app.js


cd server
node src/worker.js   // will fire up the worker





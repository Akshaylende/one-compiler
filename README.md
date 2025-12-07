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


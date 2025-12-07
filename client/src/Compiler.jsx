import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './style.css'; // Ensure CSS is imported

const Compiler = () => {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('python');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Default boilerplates
  const boilerplates = {
    python: 'print("Hello World")',
    cpp: '#include <bits/stdc++.h> \nusing namespace std;\n \nint main() {\n   cout << "Hello World";\n   return 0;\n}'
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCode(boilerplates[e.target.value] || '');
  };

  const runCode = async () => {
    setIsLoading(true);
    setStatus('Running...');
    setOutput('');

    try {
      const { data } = await axios.post('http://localhost:5000/run', { language, code, input });
      const jobId = data.jobId;

      const intervalId = setInterval(async () => {
        const { data: result } = await axios.get(`http://localhost:5000/status/${jobId}`);
        
        if (result.status === 'success') {
          setOutput(result.output);
          setStatus('Success');
          clearInterval(intervalId);
          setIsLoading(false);
        } else if (result.status === 'error') {
          setOutput(result.error);
          setStatus('Error');
          clearInterval(intervalId);
          setIsLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      setOutput('Error connecting to server');
      setStatus('Failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="ide-container">
      {/* 1. Header: Logo + Controls */}
      <header className="ide-header">
        <div className="logo">One Compiler ⚡</div>
        <div className="controls">
          <select 
            value={language} 
            onChange={handleLanguageChange} 
            className="lang-select"
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC)</option>
          </select>
          
          <button 
            onClick={runCode} 
            disabled={isLoading}
            className={`run-btn ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? 'Running...' : '▶ Run Code'}
          </button>
        </div>
      </header>

      {/* 2. Main Body: Split View */}
      <div className="ide-body">
        
        {/* Left: Editor (Full Height) */}
        <div className="editor-section">
          <Editor 
            height="100%" 
            theme="vs-dark" 
            language={language} 
            value={code} 
            onChange={setCode}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        {/* Right: I/O (Split Vertically) */}
        <div className="io-section">
          
          {/* Top Right: Input */}
          <div className="io-box input-box">
            <div className="io-label">Input (Stdin)</div>
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Enter input here..."
            />
          </div>

          {/* Bottom Right: Output */}
          <div className="io-box output-box">
            <div className="io-label">
              Output 
              {status && <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>}
            </div>
            <pre className="output-area">{output}</pre>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Compiler;
// 1. Initialize CodeMirror Editor
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    mode: "python", theme: "dracula", lineNumbers: true, indentUnit: 4
});
setTimeout(() => editor.refresh(), 100);

// 2. Custom Terminal DOM Elements
const termOutput = document.getElementById('term-output');
const termInputLine = document.getElementById('term-input-line');
const termPrompt = document.getElementById('term-prompt');
const termInput = document.getElementById('term-input');
const terminalContainer = document.getElementById('terminal-container');

// Helper to write text to the terminal
function writeTerminal(text, color = '#9ece6a') {
    const span = document.createElement('span');
    span.style.color = color;
    span.innerText = text + '\n';
    termOutput.appendChild(span);
    terminalContainer.scrollTop = terminalContainer.scrollHeight; // Auto-scroll to bottom
}

// Keep focus on the input box when clicking anywhere in the terminal
function focusTerminal() {
    if (termInputLine.style.display !== 'none') {
        termInput.focus();
    }
}

let isEngineReady = false;
let terminalInputResolver = null;

// 3. Handle Interactive Input Keystrokes (The "Enter" Key)
termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && terminalInputResolver) {
        const val = termInput.value;
        
        // Echo what the user typed onto the screen in white
        writeTerminal(termPrompt.innerText + val, '#ffffff'); 
        
        termInput.value = '';
        termInputLine.style.display = 'none';
        
        const resolve = terminalInputResolver;
        terminalInputResolver = null;
        resolve(val); // Send the text back to Python
    }
});

// Async function called by Pyodide to wait for user typing
async function js_input(prompt_text) {
    termPrompt.innerText = prompt_text;
    termInputLine.style.display = 'flex';
    termInput.focus();
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
    
    return new Promise(resolve => {
        terminalInputResolver = resolve;
    });
}

// 4. Load the WebAssembly Execution Engine
let pyodide;
async function initEngine() {
    try {
        writeTerminal('Initializing Pyodide WebAssembly Engine...', '#a9b1d6');
        
        pyodide = await loadPyodide({
            stdout: (text) => writeTerminal(text, '#9ece6a'), // Standard prints in Green
            stderr: (text) => writeTerminal(text, '#f7768e')  // Errors in Red
        });

        pyodide.globals.set("js_input", js_input);
        
        // Connect Python's input() to our HTML input box
        await pyodide.runPythonAsync(`
import builtins
async def async_input(prompt=""):
    return await js_input(prompt)
builtins.input = async_input
        `);

        writeTerminal('✅ Execution Engine Ready!\n', '#9ece6a');
        
        const runBtn = document.getElementById('runBtn');
        runBtn.innerText = "▶ Run Code";
        runBtn.style.backgroundColor = "#0d6efd";
        isEngineReady = true;

    } catch (err) {
        writeTerminal(`❌ Failed to load engine: ${err}`, '#f7768e');
    }
}

initEngine();

// 5. Compile and Execute User Code
async function runCode() {
    if (!isEngineReady) return;
    
    const code = editor.getValue();
    const lang = document.getElementById("langSelect") ? document.getElementById("langSelect").value : "tamil";
    
    writeTerminal('--- Compiling ---', '#e0af68');

    try {
        // ⚠️ REPLACE THIS WITH YOUR BACKEND COMPILER API URL 
        const apiUrl = "https://tamilpp-compiler.vercel.app/api/compile"; 
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, lang: lang })
        });

        const data = await response.json();

        if (!data.success) {
            writeTerminal(`Compiler Error: ${data.error}`, '#f7768e');
            return;
        }

        const compiled_python = data.python_code;
        writeTerminal('--- Running ---', '#e0af68');

        // Execute natively in Pyodide
        await pyodide.runPythonAsync(compiled_python);

    } catch (err) {
        writeTerminal(`${err}`, '#f7768e');
    }
    
    writeTerminal('--- Finished ---\n', '#e0af68');
}

function clearTerminal() {
    termOutput.innerHTML = '';
    termInputLine.style.display = 'none';
}

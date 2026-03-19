// 1. Initialize CodeMirror Editor
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    mode: "python", theme: "dracula", lineNumbers: true, indentUnit: 4
});
setTimeout(() => editor.refresh(), 100);

// 2. Initialize XTerm.js Terminal
const term = new Terminal({
    theme: { background: '#000000', foreground: '#9ece6a', cursor: '#ffffff' },
    fontFamily: '"Consolas", monospace', fontSize: 15, cursorBlink: true
});
term.open(document.getElementById('terminal-container'));
term.writeln('Initializing Pyodide WebAssembly Engine...');

let pyodide;
let isEngineReady = false;
let terminalInputResolver = null;

// 3. Handle Terminal Keystrokes for Input
term.onData(e => {
    if (terminalInputResolver !== null) {
        if (e === '\r') { 
            term.write('\r\n');
            const inputStr = terminalInputResolver.buffer;
            const resolveFunc = terminalInputResolver.resolve;
            terminalInputResolver = null; 
            resolveFunc(inputStr); 
        } else if (e === '\u007F') { 
            if (terminalInputResolver.buffer.length > 0) {
                terminalInputResolver.buffer = terminalInputResolver.buffer.slice(0, -1);
                term.write('\b \b');
            }
        } else { 
            terminalInputResolver.buffer += e;
            term.write(e);
        }
    }
});

async function js_input(prompt_text) {
    term.write(prompt_text);
    return new Promise(resolve => {
        terminalInputResolver = { resolve: resolve, buffer: "" };
    });
}

// 4. Load the Execution Engine (NO COMPILER LOGIC HERE ANYMORE!)
async function initEngine() {
    try {
        pyodide = await loadPyodide({
            stdout: (text) => term.writeln(text),
            stderr: (text) => term.writeln(`\x1b[31m${text}\x1b[0m`)
        });

        pyodide.globals.set("js_input", js_input);
        
        await pyodide.runPythonAsync(`
import builtins
async def async_input(prompt=""):
    return await js_input(prompt)
builtins.input = async_input
        `);

        term.writeln('\x1b[32m✅ Execution Engine Ready!\x1b[0m\r\n');
        
        const runBtn = document.getElementById('runBtn');
        runBtn.innerText = "▶ Run Code";
        runBtn.style.backgroundColor = "#0d6efd";
        isEngineReady = true;

    } catch (err) {
        term.writeln(`\x1b[31m❌ Failed to load engine: ${err}\x1b[0m`);
    }
}

initEngine();

// 5. Execute User Code (Fetch from API, Run in Pyodide)
async function runCode() {
    if (!isEngineReady) return;
    
    const code = editor.getValue();
    const lang = document.getElementById("langSelect") ? document.getElementById("langSelect").value : "tamil";
    
    term.writeln('\x1b[33m--- Compiling --- \x1b[0m');

    try {
        // STEP 1: Ask App 1 (The API) to translate the code
        // ⚠️ REPLACE THIS URL WITH YOUR ACTUAL API VERCEL URL
        const apiUrl = "https://tamilpp-compiler.vercel.app/api/compile"; 
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, lang: lang })
        });

        const data = await response.json();

        if (!data.success) {
            term.writeln(`\x1b[31mCompiler Error: ${data.error}\x1b[0m`);
            return;
        }

        const compiled_python = data.python_code;
        console.log("==== Translated Python ====\n" + compiled_python);

        term.writeln('\x1b[33m--- Running ---\x1b[0m');

        // STEP 2: Give the translated pure Python to App 2 (Pyodide)
        await pyodide.runPythonAsync(compiled_python);

    } catch (err) {
        term.writeln(`\x1b[31m${err}\x1b[0m`);
    }
    
    term.writeln('\x1b[33m--- Finished ---\x1b[0m\r\n');
}

function clearTerminal() {
    term.clear();
}

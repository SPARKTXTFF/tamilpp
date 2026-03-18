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
        if (e === '\r') { // Enter key
            term.write('\r\n');
            const inputStr = terminalInputResolver.buffer;
            const resolveFunc = terminalInputResolver.resolve;
            terminalInputResolver = null; // Clear the lock
            resolveFunc(inputStr); // Send data back to Python
        } else if (e === '\u007F') { // Backspace
            if (terminalInputResolver.buffer.length > 0) {
                terminalInputResolver.buffer = terminalInputResolver.buffer.slice(0, -1);
                term.write('\b \b');
            }
        } else { // Normal typing
            terminalInputResolver.buffer += e;
            term.write(e);
        }
    }
});

// Async function called by Python to wait for user typing
async function js_input(prompt_text) {
    term.write(prompt_text);
    return new Promise(resolve => {
        terminalInputResolver = { resolve: resolve, buffer: "" };
    });
}

// 4. Load the Engine
async function initEngine() {
    try {
        // Load Python
        pyodide = await loadPyodide({
            stdout: (text) => term.writeln(text),
            stderr: (text) => term.writeln(`\x1b[31m${text}\x1b[0m`) // Red text for errors
        });

        // Inject our async input function into Python's builtins
        pyodide.globals.set("js_input", js_input);
        await pyodide.runPythonAsync(`
            import builtins
            import pyodide
            
            async def async_input(prompt=""):
                return await js_input(prompt)
            
            # Override standard input with our terminal input
            builtins.input = async_input
        `);

        // Fetch your core files and put them in Pyodide's virtual file system
        const compilerCode = await (await fetch('/compiler.py')).text();
        const tamilDic = await (await fetch('/dictionaries/tamil_dic.py')).text();
        
        pyodide.FS.writeFile('/compiler.py', compilerCode);
        pyodide.FS.mkdir('/dictionaries');
        pyodide.FS.writeFile('/dictionaries/__init__.py', '');
        pyodide.FS.writeFile('/dictionaries/tamil_dic.py', tamilDic);

        term.writeln('\x1b[32m✅ Engine Ready! You can now run code.\x1b[0m\r\n');
        
        const runBtn = document.getElementById('runBtn');
        runBtn.innerText = "▶ Run Code";
        runBtn.style.backgroundColor = "#0d6efd";
        isEngineReady = true;

    } catch (err) {
        term.writeln(`\x1b[31m❌ Failed to load engine: ${err}\x1b[0m`);
    }
}

// Start loading immediately
initEngine();

// 5. Execute User Code
async function runCode() {
    if (!isEngineReady) return;
    
    const code = editor.getValue();
    const lang = document.getElementById("langSelect").value;
    
    term.writeln('\x1b[33m--- Running ---\x1b[0m');
    
    // Pass the user code and language to Python
    pyodide.globals.set("user_code", code);
    pyodide.globals.set("selected_lang", lang);

    try {
        // Run the compiler logic inside the browser
        await pyodide.runPythonAsync(`
            from compiler import PolyglotCompiler
            import traceback

            try:
                comp = PolyglotCompiler(selected_lang)
                # Translate to python
                python_code = comp.translate(user_code)
                
                # Execute the translated code safely
                # (We use await to ensure input() works correctly)
                exec_globals = {"__builtins__": __builtins__}
                exec(f"async def __async_exec():\\n" + "\\n".join(f"    {line}" for line in python_code.split("\\n")), exec_globals)
                await exec_globals["__async_exec"]()
                
            except Exception as e:
                print(f"\\033[31mRuntime Error: {e}\\033[0m")
        `);
    } catch (err) {
        term.writeln(`\x1b[31m${err}\x1b[0m`);
    }
    
    term.writeln('\x1b[33m--- Finished ---\x1b[0m\r\n');
}

function clearTerminal() {
    term.clear();
}

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

// =========================================================
// 🧠 THE NATIVE PYTHON COMPILER (Embedded to fix Vercel UTF-8 bugs)
// =========================================================
const compilerPythonCode = `
import tokenize
from io import BytesIO
import re
import unicodedata

class TamilCompiler:
    def __init__(self):
        raw_dict = {
            'எனில்': 'if', 'if': 'if',
            'ஆனால்': 'elif', 'elif': 'elif',
            'இல்லை': 'else', 'else': 'else',
            'சுற்று': 'for', 'for': 'for',
            'வரை': 'while', 'while': 'while',
            'இல்': 'in', 'in': 'in',
            'நிறுத்து': 'break', 'stop': 'break',
            'தொடர்': 'continue', 'thodar': 'continue', 'continue' : 'continue',
            'மற்றும்': 'and', 'matrum': 'and', 'and': 'and',
            'அல்லது': 'or', 'allathu': 'or', 'or': 'or',
            'இல்லாத': 'not', 'illatha': 'not', 'not': 'not',
            'உண்மை': 'True', 'true': 'True',
            'பொய்': 'False', 'false': 'False',
            'ஏதுமில்லை': 'None', 'none': 'None',
            'செயல்': 'def', 'seyal': 'def', 'function': 'def', 'def': 'def',
            'திருப்பு': 'return', 'thiruppu': 'return', 'return': 'return',
            'பதி': 'print', 'padi': 'print', 'print': 'print',
            'காட்டு': 'print', 'kaattu': 'print',
            'சொல்லு': 'print', 'sollu': 'print',
            'உள்ளிடு': 'input', 'ullidu': 'input', 'input': 'input',
            'நீளம்': 'len', 'len': 'len',
            'முழுஎண்': 'int', 'int': 'int',
            'சரம்': 'str', 'str': 'str',
            'பட்டியல்': 'list', 'list': 'list'
        }
        # Forces perfect Unicode matching
        self.translation_map = {unicodedata.normalize('NFC', k): v for k, v in raw_dict.items()}

    def translate(self, code):
        code = unicodedata.normalize('NFC', code)
        tokens = list(tokenize.tokenize(BytesIO(code.encode('utf-8')).readline))
        new_tokens = []
        for token in tokens:
            if token.string in ('அமை', 'amai', 'set'):
                continue
            if token.type == tokenize.NAME:
                translated = self.translation_map.get(token.string, self.translation_map.get(token.string.lower(), token.string))
            else:
                translated = token.string
            new_tokens.append(tokenize.TokenInfo(token.type, translated, token.start, token.end, token.line))

        python_code = tokenize.untokenize(new_tokens).decode('utf-8')
        
        # Injects 'await' so the terminal can pause for input
        python_code = re.sub(r'\\binput\\s*\\(', 'await input(', python_code)
        return python_code
`;

// 4. Load the Engine
async function initEngine() {
    try {
        pyodide = await loadPyodide({
            stdout: (text) => term.writeln(text),
            stderr: (text) => term.writeln(`\x1b[31m${text}\x1b[0m`)
        });

        pyodide.globals.set("js_input", js_input);
        
        // Load the input handler and our embedded compiler
        await pyodide.runPythonAsync(`
import builtins
async def async_input(prompt=""):
    return await js_input(prompt)
builtins.input = async_input

${compilerPythonCode}
        `);

        term.writeln('\x1b[32m✅ Engine Ready! You can now run code.\x1b[0m\r\n');
        
        const runBtn = document.getElementById('runBtn');
        runBtn.innerText = "▶ Run Code";
        runBtn.style.backgroundColor = "#0d6efd";
        isEngineReady = true;

    } catch (err) {
        term.writeln(`\x1b[31m❌ Failed to load engine: ${err}\x1b[0m`);
    }
}

initEngine();

// 5. Execute User Code
async function runCode() {
    if (!isEngineReady) return;
    
    const code = editor.getValue();
    term.writeln('\x1b[33m--- Running ---\x1b[0m');
    
    pyodide.globals.set("user_code", code);

    try {
        await pyodide.runPythonAsync(`
try:
    comp = TamilCompiler()
    python_code = comp.translate(user_code)
    
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

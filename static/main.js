var editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    mode: "python", 
    theme: "dracula", 
    lineNumbers: true, 
    indentUnit: 4
});

setTimeout(() => editor.refresh(), 100);

async function runCode() {
    const code = editor.getValue();
    const lang = document.getElementById("langSelect").value;
    const userInputs = document.getElementById("customInput").value; // Grab inputs
    const outputElement = document.getElementById('output');
    
    outputElement.innerText = "Running...";
    outputElement.style.color = "#a9b1d6"; 
    
    try {
        const response = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, lang: lang, inputs: userInputs })
        });
        
        // Catch server crashes (like 500 errors) before they break the JSON parser
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();
        outputElement.innerText = data.output;
        
        if(data.output.includes("❌ Runtime Error")) {
            outputElement.style.color = "#f7768e"; 
        } else {
            outputElement.style.color = "#9ece6a"; 
        }
    } catch (error) {
        console.error(error);
        outputElement.innerText = `❌ Error: ${error.message}\nCheck if your vercel.json is correct or if the server crashed.`;
        outputElement.style.color = "#f7768e";
    }
}

async function downloadCode() {
    const code = editor.getValue();
    const lang = document.getElementById("langSelect").value;
    
    const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, lang: lang })
    });
    const data = await response.json();
    
    const blob = new Blob([data.python_code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compiled_${lang}.py`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function clearOutput() {
    document.getElementById('output').innerText = "";
}

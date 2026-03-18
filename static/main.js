var editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    mode: "python", 
    theme: "dracula", 
    lineNumbers: true, 
    indentUnit: 4
});

// Ensures the editor fills the flexbox container correctly
setTimeout(() => editor.refresh(), 100);

async function runCode() {
    const code = editor.getValue();
    const lang = document.getElementById("langSelect").value;
    const outputElement = document.getElementById('output');
    
    outputElement.innerText = "Running...";
    outputElement.style.color = "#a9b1d6"; // Neutral color while loading
    
    try {
        const response = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, lang: lang })
        });
        const data = await response.json();
        
        outputElement.innerText = data.output;
        
        // Make errors red, normal output green
        if(data.output.includes("❌ Runtime Error")) {
            outputElement.style.color = "#f7768e"; // Red error
        } else {
            outputElement.style.color = "#9ece6a"; // Green success
        }
    } catch (error) {
        outputElement.innerText = "❌ Network Error: Could not connect to server.";
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

// New function for the clear button
function clearOutput() {
    document.getElementById('output').innerText = "";
}
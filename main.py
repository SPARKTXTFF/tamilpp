from flask import Flask, request, jsonify, render_template
from compiler import tamilppCompiler

app = Flask(__name__)

# =========================================================
# 🌐 WEB ROUTES
# =========================================================

@app.route('/')
def home():
    # Serves the index.html from the templates/ folder
    return render_template('index.html')

@app.route('/docs')
def docs():
    return render_template('docs.html')

@app.route('/api/run', methods=['POST'])
def api_run():
    # Receives code from the web editor and runs it
    code = request.json.get('code', '')
    lang = request.json.get('lang', 'tamil')
    
    compiler = tamilppCompiler(lang)
    output = compiler.run(code)
    
    return jsonify({'output': output})

@app.route('/api/compile', methods=['POST'])
def api_compile():
    # Translates the code and sends it back to the browser for download
    code = request.json.get('code', '')
    lang = request.json.get('lang', 'tamil')
    
    compiler = tamilppCompiler(lang)
    python_code = compiler.translate(code)
    
    return jsonify({'python_code': python_code})

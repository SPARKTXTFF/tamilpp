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


# =========================================================
# 🚀 SERVER LAUNCHER
# =========================================================

if __name__ == "__main__":
    print("🌐 Starting Polyglot Web IDE...")
    print("👉 Open http://127.0.0.1:5000 in your browser.")
    
    # Runs the Flask web server
    app.run(debug=True, host='127.0.0.1', port=5000)
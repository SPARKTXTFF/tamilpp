from flask import Flask, request, jsonify, render_template
from compiler import tamilppCompiler

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/docs')
def docs():
    return render_template('docs.html')

@app.route('/api/run', methods=['POST'])
def api_run():
    code = request.json.get('code', '')
    lang = request.json.get('lang', 'tamil')
    user_inputs = request.json.get('inputs', '') # Grab inputs from web
    
    compiler = PolyglotCompiler(lang)
    output = compiler.run(code, user_inputs)
    
    return jsonify({'output': output})

@app.route('/api/compile', methods=['POST'])
def api_compile():
    code = request.json.get('code', '')
    lang = request.json.get('lang', 'tamil')
    
    compiler = tamilppCompiler(lang)
    python_code = compiler.translate(code)
    
    return jsonify({'python_code': python_code})

from flask import Flask, request, jsonify, render_template
from compiler import PolyglotCompiler
import traceback

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/docs')
def docs():
    return render_template('docs.html')

@app.route('/api/run', methods=['POST'])
def api_run():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'output': "❌ Error: No data received from editor."})
            
        code = data.get('code', '')
        lang = data.get('lang', 'tamil')
        user_inputs = data.get('inputs', '')
        
        compiler = PolyglotCompiler(lang)
        output = compiler.run(code, user_inputs)
        
        return jsonify({'output': output})
    except Exception as e:
        # Traps 500 errors and sends them to the frontend terminal
        error_details = traceback.format_exc()
        return jsonify({'output': f"❌ Severe Backend Server Error:\n{error_details}"})

@app.route('/api/compile', methods=['POST'])
def api_compile():
    try:
        data = request.get_json()
        code = data.get('code', '')
        lang = data.get('lang', 'tamil')
        
        compiler = PolyglotCompiler(lang)
        python_code = compiler.translate(code)
        
        return jsonify({'python_code': python_code})
    except Exception as e:
        return jsonify({'python_code': f"# Compiler Error: {e}"})


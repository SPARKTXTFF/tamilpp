import sys
import tokenize
import importlib
import re
import unicodedata
from io import BytesIO

if '.' not in sys.path:
    sys.path.append('.')

class tamilppCompiler:
    def __init__(self, lang="tamil"):
        self.lang = lang
        try:
            module = importlib.import_module(f"dictionaries.{self.lang}_dic")
            raw_dict = module.dictionary
            
            # === THE UNICODE FIX ===
            # Force every key in the dictionary into standard NFC format
            self.translation_map = {
                unicodedata.normalize('NFC', k.strip()): v 
                for k, v in raw_dict.items()
            }
        except Exception as e:
            print(f"\033[31m⚠️ Dictionary Load Error for '{lang}': {e}\033[0m")
            self.translation_map = {}

    def translate(self, code):
        # Force the incoming code from the web editor into standard NFC format
        normalized_code = unicodedata.normalize('NFC', code)
        
        tokens = list(tokenize.tokenize(BytesIO(normalized_code.encode('utf-8')).readline))
        new_tokens = []

        for token in tokens:
            if token.string in ('அமை', 'amai', 'set'):
                continue
                
            if token.type == tokenize.NAME:
                # Check exact match first (for Tamil), then lowercase (for Tanglish)
                exact_str = token.string
                lower_str = token.string.lower()
                
                if exact_str in self.translation_map:
                    translated = self.translation_map[exact_str]
                elif lower_str in self.translation_map:
                    translated = self.translation_map[lower_str]
                else:
                    translated = exact_str
            else:
                translated = token.string

            new_tokens.append(tokenize.TokenInfo(token.type, translated, token.start, token.end, token.line))

        # Rebuild the python code
        python_code = tokenize.untokenize(new_tokens).decode('utf-8')
        
        # Inject 'await' for the interactive terminal input
        python_code = re.sub(r'\binput\s*\(', 'await input(', python_code)
        
        return python_code

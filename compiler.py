import sys
import tokenize
import importlib
import re
from io import BytesIO

if '.' not in sys.path:
    sys.path.append('.')

class tamilppCompiler:
    def __init__(self, lang="tamil"):
        self.lang = lang
        try:
            module = importlib.import_module(f"dictionaries.{self.lang}_dic")
            self.translation_map = module.dictionary
        except Exception as e:
            print(f"\033[31m⚠️ Dictionary Load Error for '{lang}': {e}\033[0m")
            self.translation_map = {}

    def translate(self, code):
        tokens = list(tokenize.tokenize(BytesIO(code.encode('utf-8')).readline))
        new_tokens = []

        for token in tokens:
            if token.string in ('அமை', 'amai', 'set'):
                continue
            if token.type == tokenize.NAME:
                translated = self.translation_map.get(token.string.lower(), token.string)
            else:
                translated = token.string

            new_tokens.append(tokenize.TokenInfo(token.type, translated, token.start, token.end, token.line))

        # Rebuild the python code
        python_code = tokenize.untokenize(new_tokens).decode('utf-8')

        # === THE ASYNC FIX ===
        # Finds 'input(' (even if there are spaces like 'input  (') and safely injects 'await '
        python_code = re.sub(r'\binput\s*\(', 'await input(', python_code)
        # =====================

        return python_code

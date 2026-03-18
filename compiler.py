import tokenize
from io import BytesIO
import importlib

class tamilppCompiler:
    def __init__(self, lang="tamil"):
        self.lang = lang
        try:
            module = importlib.import_module(f"dictionaries.{self.lang}_dic")
            self.translation_map = module.dictionary
        except Exception:
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

        return tokenize.untokenize(new_tokens).decode('utf-8')
#!/usr/bin/env python3
"""Checagem automática de comentários de legislação (etapa 2 de docs/PIPELINE_COMENTARIOS.md).

Entrada (JSON): lista de itens
  {"id": "lep-1", "numero": 1, "fonte": "texto do caput e dos filhos", "campos": {"aplicacao_pratica": "...", "contexto": "..."}}
Saída (stdout, JSON): lista de {"id", "campo", "motivos": [...]} só com os reprovados. Código de saída 1 se houver reprovado.
Uso: python3 checagem.py entrada.json
"""
import json
import re
import sys
import unicodedata

PROIBIDOS = [r'\bSTF\b', r'\bSTJ\b', r'\bTST\b', r'\bTNU\b', r's[úu]mula', r'jurisprud', r'doutrin', r'precedente', r'repetitivo',
             r'repercuss[ãa]o geral', r'\bTema\s+\d', r'\bsegundo\s+[A-ZÁÉÍÓÚ][a-zá-ú]+\s+[A-ZÁÉÍÓÚ]']
FRASES_PROIBIDAS = ['no banco', 'nos termos do parágrafo', 'resto do', 'a definir', 'TODO']
ROMANOS = r'[IVXLC]+(?:-[a-z])?'
EMOJI = re.compile('[\U0001F300-\U0001FAFF☀-➿⭐⭕]')


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def palavras(s):
    return re.findall(r'[a-z0-9]+', norm(s))


def numeros(s):
    out = set()
    for m in re.finditer(r'\d[\d.,]*\d|\d', s):
        out.add(re.sub(r'[.,]', '', m.group(0)))
    return out


def checar_campo(numero, fonte, texto, campo):
    motivos = []
    if not texto or not texto.strip():
        return ['vazio']
    if re.search('[—–]', texto):
        motivos.append('travessão')
    if EMOJI.search(texto):
        motivos.append('emoji')
    for f in FRASES_PROIBIDAS:
        if re.search(r'(?<![\wÀ-ÿ])' + re.escape(f) + r'(?![\wÀ-ÿ])', texto, 0 if f == 'TODO' else re.I):
            motivos.append(f'expressão proibida: {f}')
    fonte_n = norm(fonte)
    for p in PROIBIDOS:
        m = re.search(p, texto, re.I if p.startswith('s[') or p in (r'jurisprud', r'doutrin', r'precedente', r'repetitivo') else 0)
        if m and norm(m.group(0)) not in fonte_n:
            motivos.append(f'termo fora do texto (jurisprudência/doutrina): {m.group(0)}')
    permitidos = numeros(fonte) | {str(numero)}
    for n in sorted(numeros(texto) - permitidos):
        motivos.append(f'número fora do texto: {n}')
    for m in re.finditer(r'\bincisos?\s+(' + ROMANOS + r')((?:\s*(?:,|e|a|ou)\s*' + ROMANOS + r')*)', texto):
        for r in re.findall(ROMANOS, m.group(0).split(None, 1)[1]):
            base = r.split('-')[0]
            if not re.search(r'(?<![A-Za-z])' + base + r'(?![A-Za-z])', fonte):
                motivos.append(f'inciso fora do texto: {r}')
    if len(texto) < (160 if campo == 'aplicacao_pratica' else 90):
        motivos.append('curto demais')
    if len(texto) > 2200:
        motivos.append('longo demais')
    # repetição do texto do artigo (genericidade): proporção de 4-gramas do comentário que existem na fonte
    pc = palavras(texto)
    pf = palavras(fonte)
    if len(pc) >= 8 and campo == 'aplicacao_pratica':
        gf = {tuple(pf[i:i + 4]) for i in range(len(pf) - 3)}
        gc = [tuple(pc[i:i + 4]) for i in range(len(pc) - 3)]
        taxa = sum(g in gf for g in gc) / max(len(gc), 1)
        if taxa > 0.45:
            motivos.append(f'repete o texto do artigo ({taxa:.0%} dos trechos de 4 palavras)')
    return motivos


def checar(itens):
    falhas = []
    for it in itens:
        for campo, texto in it['campos'].items():
            m = checar_campo(it['numero'], it['fonte'], texto, campo)
            if m:
                falhas.append({'id': it['id'], 'campo': campo, 'motivos': m})
    return falhas


if __name__ == '__main__':
    itens = json.load(open(sys.argv[1], encoding='utf-8'))
    falhas = checar(itens)
    json.dump(falhas, sys.stdout, ensure_ascii=False, indent=1)
    print()
    sys.exit(1 if falhas else 0)

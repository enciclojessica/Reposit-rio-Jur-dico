#!/usr/bin/env python3
"""Sorteia a amostra da auditoria cega (etapa 6 de docs/PIPELINE_COMENTARIOS.md).

Uso: python3 amostra.py ids.json [semente]
Entrada: lista JSON de ids gravados. Saída: lista JSON com 10% (mínimo 12, ou todos se houver menos), sem repetição, ordenada.
A semente padrão é o número de ids, o que torna o sorteio reproduzível para a mesma lista.
"""
import json
import math
import random
import sys


def amostra(ids, semente=None):
    ids = list(ids)
    n = min(len(ids), max(12, math.ceil(len(ids) * 0.10)))
    rnd = random.Random(len(ids) if semente is None else semente)
    return sorted(rnd.sample(ids, n), key=str)


if __name__ == '__main__':
    ids = json.load(open(sys.argv[1], encoding='utf-8'))
    json.dump(amostra(ids, sys.argv[2] if len(sys.argv) > 2 else None), sys.stdout, ensure_ascii=False)
    print()

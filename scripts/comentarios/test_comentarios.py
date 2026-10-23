import unittest
from checagem import checar, checar_campo
from amostra import amostra

FONTE = ('Art. 5º A prova será feita em 10 dias. I - o requerente; II - o credor. '
         '§ 1º O prazo conta da citação. Art. 7º cita outra regra.')
BOM = ('Ao usar o artigo na peça, confira se o requerente cumpriu o prazo de 10 dias e junte o comprovante da citação, '
       'pois o parágrafo primeiro faz o prazo correr da citação e não do protocolo; distinga o requerente do credor ao apontar o inciso II.')


class T(unittest.TestCase):
    def test_bom(self):
        self.assertEqual(checar_campo(5, FONTE, BOM, 'aplicacao_pratica'), [])

    def test_numero_fora(self):
        m = checar_campo(5, FONTE, BOM + ' O prazo é de 15 dias.', 'aplicacao_pratica')
        self.assertTrue(any('15' in x for x in m))

    def test_travessao_e_banco(self):
        m = checar_campo(5, FONTE, BOM + ' — veja no banco.', 'aplicacao_pratica')
        self.assertIn('travessão', m)
        self.assertTrue(any('no banco' in x for x in m))

    def test_jurisprudencia(self):
        m = checar_campo(5, FONTE, BOM + ' Há súmula do STJ sobre o tema.', 'aplicacao_pratica')
        self.assertTrue(any('fora do texto' in x for x in m))

    def test_inciso_fora(self):
        m = checar_campo(5, FONTE, BOM + ' Veja o inciso IV.', 'aplicacao_pratica')
        self.assertTrue(any('inciso fora do texto: IV' in x for x in m))

    def test_repete_caput(self):
        m = checar_campo(5, FONTE, 'A prova será feita em 10 dias. I - o requerente; II - o credor. O prazo conta da citação. A prova será feita em 10 dias. ' * 2, 'aplicacao_pratica')
        self.assertTrue(any('repete' in x for x in m))

    def test_curto(self):
        self.assertIn('curto demais', checar_campo(5, FONTE, 'Confira o prazo.', 'aplicacao_pratica'))

    def test_checar_lista(self):
        r = checar([{'id': 'a', 'numero': 5, 'fonte': FONTE, 'campos': {'aplicacao_pratica': BOM}},
                    {'id': 'b', 'numero': 5, 'fonte': FONTE, 'campos': {'aplicacao_pratica': ''}}])
        self.assertEqual([x['id'] for x in r], ['b'])

    def test_amostra(self):
        ids = [f'x{i}' for i in range(216)]
        a = amostra(ids)
        self.assertEqual(len(a), 22)
        self.assertEqual(a, amostra(ids))
        self.assertEqual(len(amostra(['a', 'b'])), 2)


if __name__ == '__main__':
    unittest.main()

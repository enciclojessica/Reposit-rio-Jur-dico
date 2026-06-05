import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import {
  Play, Pause, RotateCcw, CheckCircle, Clock, TrendingUp,
  Trophy, Target, Calendar, Download, ChevronDown, ChevronUp,
  Star, Circle, Timer, Filter, BarChart2, RefreshCw
} from 'lucide-react'

// ── Paleta das disciplinas ─────────────────────────────────────────────────────
const DISC_COR = {
  "Ética Profissional":     "#7c3aed",
  "Direito Civil":          "#16a34a",
  "Processo Civil":         "#2563eb",
  "Direito Constitucional": "#0284c7",
  "Direito Penal":          "#e11d48",
  "Processo Penal":         "#a21caf",
  "Direito do Trabalho":    "#d97706",
  "Direito Tributário":     "#ea580c",
  "Direito Administrativo": "#be185d",
  "Direito Empresarial":    "#64748b",
  "Simulado Geral":         "#0d9488",
}

const METODO_COR = {
  "Questões FGV":    { bg:"#eff6ff", text:"#1d4ed8" },
  "Lei Seca":        { bg:"#fff7ed", text:"#c2410c" },
  "Súmulas STJ/STF": { bg:"#f0ebf8", text:"#5b21b6" },
  "Simulado":        { bg:"#f0fdfa", text:"#0f766e" },
  "Peça Processual": { bg:"#f0fdf4", text:"#15803d" },
  "Discursiva":      { bg:"#fffbeb", text:"#b45309" },
}

// ── Cronograma completo (48º Exame OAB — Jun/2026 a Fev/2027) ─────────────────
const RAW = [
  { date:"2026-06-07", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"Lei 8.906/94: deveres, incompatibilidades, impedimentos, infrações e sanções disciplinares", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-06-13", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"CED (Resolução OAB 02/2015): relações com cliente, sigilo, publicidade, honorários", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-06-14", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 1–78: pessoas naturais, personalidade, capacidade; arts. 79–103: bens", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-06-20", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"Revisão: Lei 8.906/94 + CED — questões FGV de exames anteriores. Foco: honorários e sigilo", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-06-21", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 104–232: negócio jurídico, defeitos, invalidade; arts. 189–206-A: prescrição e decadência", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-06-27", fase:"1ª Fase", disciplina:"Processo Civil", topico:"CPC/15 arts. 1–13 (normas fundamentais), arts. 42–66 (competência) + Súmulas STJ sobre competência", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-06-28", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 233–420: obrigações — modalidades, efeitos, extinção", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-04", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"CF/88 arts. 5–17: direitos individuais, coletivos, sociais, nacionalidade, direitos políticos + Súmulas STF", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-07-05", fase:"1ª Fase", disciplina:"Processo Civil", topico:"CPC/15 arts. 319–351: petição inicial, citação, contestação, reconvenção", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-07", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"CF/88 arts. 18–43 (organização político-administrativa), arts. 44–135 (Poderes da União)", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-09", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 481–853: contratos em espécie — compra e venda, doação, locação (Lei 8.245/91)", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-11", fase:"1ª Fase", disciplina:"Direito Penal", topico:"CP arts. 1–28: princípios, aplicação da lei penal, teoria do crime (tipicidade, ilicitude, culpabilidade)", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-12", fase:"1ª Fase", disciplina:"Processo Penal", topico:"CPP arts. 4–28: inquérito policial; arts. 29–62: ação penal; arts. 69–91: competência", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-14", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"CF/88 arts. 102–103 + Lei 9.868/99 e 9.882/99: ADI, ADC, ADPF, ADO + Súmulas vinculantes STF", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-07-16", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 927–954 + CDC arts. 12–17: responsabilidade civil objetiva e subjetiva", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-07-18", fase:"1ª Fase", disciplina:"Processo Civil", topico:"CPC/15 arts. 369–484: provas — ônus, depoimento, documentos, testemunhas, perícia", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-07-19", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado FGV-padrão: 30 questões — Ética + Civil + Processo Civil", metodos:["Simulado","Questões FGV"] },
  { date:"2026-07-21", fase:"1ª Fase", disciplina:"Direito Penal", topico:"CP arts. 29–120: concurso de agentes, penas, medidas de segurança, extinção da punibilidade", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-23", fase:"1ª Fase", disciplina:"Processo Penal", topico:"CPP arts. 155–250 (provas), arts. 283–350 (prisão cautelar, flagrante, preventiva, temporária)", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-07-25", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"CF/88 art. 5º, LXVIII–LXXIII: HC, HD, MS individual e coletivo, MI, AP. Lei 12.016/09", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-07-26", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 1.511–1.783: família — casamento, união estável, alimentos, guarda, tutela", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-07-28", fase:"1ª Fase", disciplina:"Processo Penal", topico:"CPP arts. 394–405 (procedimentos), arts. 581–667 (RESE, apelação, embargos)", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-08-01", fase:"1ª Fase", disciplina:"Direito Penal", topico:"CP arts. 121–183: crimes contra a pessoa e patrimônio — homicídio, lesão, furto, roubo, estelionato", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-08-02", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado FGV-padrão: 30 questões — Constitucional + Penal + Processo Penal", metodos:["Simulado","Questões FGV"] },
  { date:"2026-08-08", fase:"1ª Fase", disciplina:"Processo Civil", topico:"CPC/15 arts. 994–1044: recursos — apelação, agravo, embargos de declaração, REsp, RE", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-08-09", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 1.784–1.990: sucessões — herança, sucessão legítima e testamentária, inventário", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-08-15", fase:"1ª Fase", disciplina:"Processo Civil", topico:"CPC/15 arts. 294–311 (tutelas provisórias), arts. 513–538 (cumprimento de sentença)", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-08-16", fase:"1ª Fase", disciplina:"Direito Civil", topico:"CC/02 arts. 1.196–1.510: posse, propriedade, usucapião, servidão, usufruto", metodos:["Questões FGV","Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-08-22", fase:"1ª Fase", disciplina:"Direito do Trabalho", topico:"CLT arts. 2–19: empregado/empregador; arts. 477–501: rescisão; Lei 8.036/90: FGTS", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-08-23", fase:"1ª Fase", disciplina:"Direito do Trabalho", topico:"CLT arts. 763–910: processo do trabalho — reclamação, audiência, provas, recursos", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-08-29", fase:"1ª Fase", disciplina:"Direito Tributário", topico:"CTN arts. 1–95: tributo, espécies, fato gerador, obrigação, crédito tributário", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-08-30", fase:"1ª Fase", disciplina:"Direito Tributário", topico:"CF/88 arts. 145–162: competência tributária, limitações ao poder de tributar", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-09-05", fase:"1ª Fase", disciplina:"Direito Empresarial", topico:"CC/02 arts. 966–1.195: empresário, sociedades simples e limitada; Lei 6.404/76: S/A básico", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-09-06", fase:"1ª Fase", disciplina:"Direito Empresarial", topico:"Títulos de crédito: cheque (Lei 7.357/85), duplicata, nota promissória, letra de câmbio", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-09-12", fase:"1ª Fase", disciplina:"Direito Administrativo", topico:"Lei 14.133/21 (Nova Lei de Licitações); Lei 9.784/99 (processo administrativo federal)", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-09-13", fase:"1ª Fase", disciplina:"Direito Administrativo", topico:"Atos administrativos, poderes, agentes públicos, responsabilidade civil do Estado", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-09-19", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"Revisão intensiva: questões de Ética dos exames 40–47 FGV. Infrações, honorários, sigilo", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-09-20", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado FGV-padrão: 40 questões — revisão geral 1ª Fase (todas as disciplinas)", metodos:["Simulado","Questões FGV"] },
  { date:"2026-09-26", fase:"1ª Fase", disciplina:"Direito Civil", topico:"Revisão Civil: questões FGV por tema — obrigações, responsabilidade civil, contratos, família", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-09-27", fase:"1ª Fase", disciplina:"Processo Civil", topico:"Revisão Proc. Civil: questões FGV — competência, provas, recursos, tutelas provisórias", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-10-03", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"Revisão Constitucional: questões FGV — controle de constitucionalidade, remédios", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-10-04", fase:"1ª Fase", disciplina:"Direito Penal", topico:"Revisão Penal: questões FGV — teoria do crime, punibilidade, crimes em espécie", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-10-10", fase:"1ª Fase", disciplina:"Processo Penal", topico:"Revisão Proc. Penal: questões FGV — prisão, provas, procedimentos, recursos", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-10-11", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado completo: 80 questões — simulação real da 1ª Fase com cronômetro", metodos:["Simulado","Questões FGV"] },
  { date:"2026-10-17", fase:"1ª Fase", disciplina:"Direito do Trabalho", topico:"Revisão Trabalhista: questões FGV — contrato, rescisão, FGTS, processo do trabalho", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-10-18", fase:"1ª Fase", disciplina:"Direito Tributário", topico:"Revisão Tributário: questões FGV — CTN, espécies tributárias, competência, limitações", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-10-24", fase:"1ª Fase", disciplina:"Direito Empresarial", topico:"Revisão Empresarial: questões FGV — sociedades, títulos de crédito, recuperação judicial", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-10-25", fase:"1ª Fase", disciplina:"Direito Administrativo", topico:"Revisão Administrativo: questões FGV — licitação, atos, agentes, responsabilidade civil", metodos:["Questões FGV","Lei Seca"] },
  { date:"2026-10-31", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado completo: 80 questões — foco nas disciplinas com menor % de acertos", metodos:["Simulado","Questões FGV"] },
  { date:"2026-11-01", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"Intensivo Ética: resolução de todas as questões FGV disponíveis (exames 1–47)", metodos:["Questões FGV"] },
  { date:"2026-11-07", fase:"1ª Fase", disciplina:"Direito Civil", topico:"Intensivo Civil: questões FGV — obrigações e responsabilidade civil (maior incidência FGV)", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-11-08", fase:"1ª Fase", disciplina:"Processo Civil", topico:"Intensivo Proc. Civil: questões FGV — recursos e tutelas provisórias", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-11-14", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"Intensivo Constitucional: questões FGV — direitos fundamentais e controle de constitucionalidade", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-11-15", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado completo: 80 questões — 3ª bateria", metodos:["Simulado","Questões FGV"] },
  { date:"2026-11-21", fase:"1ª Fase", disciplina:"Direito Penal", topico:"Intensivo Penal: questões FGV — teoria do crime e crimes em espécie (maior incidência)", metodos:["Questões FGV"] },
  { date:"2026-11-22", fase:"1ª Fase", disciplina:"Processo Penal", topico:"Intensivo Proc. Penal: questões FGV — prisão cautelar e provas (maior incidência)", metodos:["Questões FGV"] },
  { date:"2026-11-28", fase:"1ª Fase", disciplina:"Direito Civil", topico:"Intensivo Civil: questões FGV — família e sucessões", metodos:["Questões FGV","Súmulas STJ/STF"] },
  { date:"2026-11-29", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado completo: 80 questões — 4ª bateria. Análise de desempenho por disciplina", metodos:["Simulado","Questões FGV"] },
  { date:"2026-12-05", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"Revisão Final Ética: lei seca completa (Lei 8.906/94 + CED) + questões FGV", metodos:["Lei Seca","Questões FGV"] },
  { date:"2026-12-06", fase:"1ª Fase", disciplina:"Direito Civil", topico:"Revisão Final Civil: lei seca CC/02 (artigos mais cobrados) + Súmulas STJ relevantes", metodos:["Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-12-07", fase:"1ª Fase", disciplina:"Processo Civil", topico:"Revisão Final Proc. Civil: lei seca CPC/15 (artigos mais cobrados) + Súmulas STJ", metodos:["Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-12-12", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado completo: 80 questões — 5ª bateria com cronômetro real", metodos:["Simulado","Questões FGV"] },
  { date:"2026-12-13", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"Revisão Final Constitucional: lei seca CF/88 + Súmulas vinculantes STF", metodos:["Lei Seca","Súmulas STJ/STF"] },
  { date:"2026-12-19", fase:"1ª Fase", disciplina:"Direito Penal", topico:"Revisão Final Penal: lei seca CP + questões FGV de maior incidência (último dia JEC)", metodos:["Lei Seca","Questões FGV"] },
  { date:"2026-12-21", fase:"1ª Fase", disciplina:"Processo Penal", topico:"Revisão Final Proc. Penal: lei seca CPP + questões FGV de maior incidência", metodos:["Lei Seca","Questões FGV"] },
  { date:"2026-12-23", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado completo: 80 questões — 6ª bateria. Última simulação antes do recesso", metodos:["Simulado","Questões FGV"] },
  { date:"2026-12-26", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"Manutenção: revisão rápida de pontos fracos identificados nos simulados", metodos:["Questões FGV"] },
  { date:"2026-12-28", fase:"1ª Fase", disciplina:"Direito Civil", topico:"Manutenção: Súmulas STJ essenciais de Civil + questões de alta incidência", metodos:["Súmulas STJ/STF","Questões FGV"] },
  { date:"2027-01-02", fase:"1ª Fase", disciplina:"Processo Civil", topico:"Manutenção: Súmulas STJ de Processo Civil + revisão de recursos", metodos:["Súmulas STJ/STF","Questões FGV"] },
  { date:"2027-01-04", fase:"1ª Fase", disciplina:"Direito Constitucional", topico:"Manutenção: Súmulas vinculantes STF + remédios constitucionais", metodos:["Súmulas STJ/STF","Questões FGV"] },
  { date:"2027-01-06", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Simulado completo: 80 questões — 7ª bateria. Condições reais de prova", metodos:["Simulado"] },
  { date:"2027-01-07", fase:"1ª Fase", disciplina:"Direito Penal", topico:"Manutenção: revisão rápida de teoria do crime e crimes de maior incidência FGV", metodos:["Questões FGV"] },
  { date:"2027-01-08", fase:"1ª Fase", disciplina:"Simulado Geral", topico:"Último simulado antes da prova — 80 questões, 5h, sem consulta, condições reais", metodos:["Simulado"] },
  { date:"2027-01-09", fase:"1ª Fase", disciplina:"Ética Profissional", topico:"Véspera da 1ª Fase: revisão exclusiva de Ética Profissional — pontos mais cobrados FGV", metodos:["Lei Seca","Questões FGV"] },
  { date:"2027-01-11", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"2ª Fase inicia — estrutura da peça constitucional: cabeçalho, qualificação, fatos, fundamentos, pedidos", metodos:["Peça Processual"] },
  { date:"2027-01-13", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Peça: Mandado de Segurança Individual (Lei 12.016/09 + CF art. 5º, LXIX)", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-01-14", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Peça: Mandado de Segurança Coletivo (Lei 12.016/09 art. 21) — legitimidade ativa e objeto", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-01-17", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Peça: Habeas Corpus (CPP arts. 647–667 + CF art. 5º, LXVIII) — HC liberatório e preventivo", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-01-18", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Peça: Habeas Data (Lei 9.507/97 + CF art. 5º, LXXII) — requisitos e hipóteses de cabimento", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-01-20", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Peça: Mandado de Injunção (Lei 13.300/16 + CF art. 5º, LXXI) — omissão inconstitucional", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-01-21", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Peça: Ação Popular (Lei 4.717/65 + CF art. 5º, LXXIII) — legitimidade, objeto, procedimento", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-01-24", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Simulado peça: MS Individual — questão FGV de exame anterior", metodos:["Peça Processual","Simulado"] },
  { date:"2027-01-25", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Simulado peça: HC preventivo — questão FGV de exame anterior", metodos:["Peça Processual","Simulado"] },
  { date:"2027-01-27", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Discursiva: controle difuso — cláusula de reserva de plenário (CF art. 97)", metodos:["Discursiva","Lei Seca"] },
  { date:"2027-01-28", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Discursiva: controle concentrado — ADI, ADC, ADPF: legitimados, objeto, efeitos", metodos:["Discursiva","Lei Seca"] },
  { date:"2027-01-31", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Simulado peça: MI — questão FGV. Análise das teses aceitas e rejeitadas pela banca", metodos:["Peça Processual","Simulado"] },
  { date:"2027-02-03", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Peça: Reclamação Constitucional (CF art. 102, I, l + Lei 11.417/06)", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-02-04", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Simulado peça: MS Coletivo — questão FGV. Foco em legitimidade ativa e pedido liminar", metodos:["Peça Processual","Simulado"] },
  { date:"2027-02-07", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Discursiva: direitos fundamentais — dimensões, eficácia horizontal, colisão e ponderação", metodos:["Discursiva","Lei Seca"] },
  { date:"2027-02-10", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Simulado completo 2ª Fase: peça + discursiva em condições reais (4h30)", metodos:["Peça Processual","Discursiva","Simulado"] },
  { date:"2027-02-11", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Correção do simulado. Identificação de erros recorrentes na peça e na discursiva", metodos:["Peça Processual","Discursiva"] },
  { date:"2027-02-14", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Revisão: estrutura formal de todas as peças — cabeçalho, qualificação, competência, pedido liminar", metodos:["Peça Processual","Lei Seca"] },
  { date:"2027-02-17", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Simulado completo 2ª Fase: nova questão FGV-padrão. Foco em tempo e fundamentação", metodos:["Peça Processual","Discursiva","Simulado"] },
  { date:"2027-02-18", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Discursiva: inconstitucionalidade por omissão — ADO e MI. Distinção e hipóteses", metodos:["Discursiva","Lei Seca"] },
  { date:"2027-02-21", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Revisão Final: leitura de todas as peças redigidas. Correção de vícios formais", metodos:["Peça Processual"] },
  { date:"2027-02-22", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Revisão Final: lei seca — Lei 12.016/09 (MS), Lei 13.300/16 (MI), Lei 4.717/65 (AP)", metodos:["Lei Seca"] },
  { date:"2027-02-24", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Simulado Final: condições reais da 2ª Fase — última prática antes de 28/02", metodos:["Peça Processual","Discursiva","Simulado"] },
  { date:"2027-02-25", fase:"2ª Fase", disciplina:"Direito Constitucional", topico:"Véspera: revisão dos remédios constitucionais e estrutura da peça mais provável", metodos:["Peça Processual","Lei Seca"] },
]

const SESSIONS = RAW.map((s, i) => ({ ...s, id: `s${i}` }))
const DISCIPLINAS = [...new Set(SESSIONS.map(s => s.disciplina))]
const MESES = [...new Set(SESSIONS.map(s => {
  const [y,m] = s.date.split('-')
  return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+m-1] + '/' + y.slice(2)
}))]

function fmt(ds) {
  const [y,m,d] = ds.split('-')
  return `${d}/${m}/${y.slice(2)}`
}
function getMes(ds) {
  const [y,m] = ds.split('-')
  return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+m-1] + '/' + y.slice(2)
}
function diasAte(ds) {
  return Math.ceil((new Date(ds+'T12:00:00') - new Date()) / 86400000)
}
function fmtTempo(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
}

// ── Cronômetro ─────────────────────────────────────────────────────────────────
function Cronometro({ sessionId, onSalvar, theme }) {
  const [seg, setSeg]       = useState(0)
  const [rodando, setRodando] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (rodando) {
      ref.current = setInterval(() => setSeg(s => s + 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [rodando])

  function resetar() {
    setRodando(false)
    setSeg(0)
  }

  function salvar() {
    if (seg < 10) return
    onSalvar(seg)
    resetar()
  }

  const cor = rodando ? '#10b981' : theme.gold

  return (
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Timer size={14} color={theme.gold} />
        <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>Cronômetro da sessão</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: 28, fontWeight: 700, color: cor,
          fontFamily: 'IBM Plex Mono, monospace', minWidth: 90,
          background: theme.cardBg, borderRadius: 8,
          padding: '6px 12px', border: `1px solid ${theme.border}`,
          transition: 'color .3s',
        }}>
          {fmtTempo(seg)}
        </div>
        <button onClick={() => setRodando(r => !r)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: rodando ? '#2a1800' : theme.gold, color: rodando ? '#f59e0b' : '#0b0f1a', border: `1px solid ${rodando ? '#f59e0b' : 'transparent'}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          {rodando ? <Pause size={14} /> : <Play size={14} />}
          {rodando ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={resetar}
          style={{ background: 'none', border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>
          <RotateCcw size={14} />
        </button>
        {seg >= 60 && (
          <button onClick={salvar}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f2b1a', border: '1px solid #10b981', color: '#10b981', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            <CheckCircle size={13} /> Salvar tempo
          </button>
        )}
      </div>
      {seg > 0 && (
        <div style={{ fontSize: 11, color: theme.muted, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
          {rodando ? 'Cronômetro em execução...' : `Pausado em ${fmtTempo(seg)}`}
        </div>
      )}
    </div>
  )
}

// ── Exportação Google Calendar (ICS) ──────────────────────────────────────────
function exportarICS(sessions, dados) {
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LexIA//OAB Dashboard//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lex.IA — Estudos OAB 48° Exame',
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ]

  sessions.forEach(s => {
    const [y,m,d] = s.date.split('-')
    const dtstart = `${y}${m}${d}`
    // Evento de dia inteiro
    const metodos = s.metodos.join(', ')
    const status = dados[s.id]?.status || 'A Fazer'
    const uid = `lexia-oab-${s.id}@lexiajur.com.br`

    linhas.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtstart}`,
      `SUMMARY:[OAB ${s.fase}] ${s.disciplina}`,
      `DESCRIPTION:Tópico: ${s.topico}\\nMétodos: ${metodos}\\nStatus: ${status}\\n\\nLex.IA — Inteligência Jurídica`,
      `CATEGORIES:OAB,${s.disciplina},${s.fase}`,
      `STATUS:${status === 'Concluído' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    )
  })

  linhas.push('END:VCALENDAR')

  const blob = new Blob([linhas.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'lexia_oab_cronograma.ics'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Card de sessão ─────────────────────────────────────────────────────────────
function SessaoCard({ s, dados, onAtualizar, theme }) {
  const [aberto, setAberto] = useState(false)
  const d = dados[s.id] || {}
  const status = d.status || 'A Fazer'
  const cor    = DISC_COR[s.disciplina] || '#6b7280'
  const dias   = diasAte(s.date)
  const hoje   = new Date().toISOString().split('T')[0]
  const ehHoje = s.date === hoje
  const passou = s.date < hoje

  const STATUS_CICLO = ['A Fazer', 'Em Andamento', 'Concluído']
  const STATUS_COR   = { 'A Fazer': '#6b7280', 'Em Andamento': '#f59e0b', 'Concluído': '#10b981' }
  const STATUS_ICON  = { 'A Fazer': Circle, 'Em Andamento': Clock, 'Concluído': CheckCircle }
  const Icon = STATUS_ICON[status]

  function avancarStatus() {
    const idx = STATUS_CICLO.indexOf(status)
    onAtualizar(s.id, { status: STATUS_CICLO[(idx+1) % STATUS_CICLO.length] })
  }

  function salvarTempo(seg) {
    const anterior = d.tempo_total || 0
    onAtualizar(s.id, { tempo_total: anterior + seg })
  }

  return (
    <div style={{
      background: theme.raised,
      border: `1px solid ${ehHoje ? cor : theme.border}`,
      borderLeft: `3px solid ${cor}`,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
      boxShadow: ehHoje ? `0 0 0 2px ${cor}22` : 'none',
    }}>
      {/* Header clicável */}
      <div onClick={() => setAberto(a => !a)}
        style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}>

        {/* Ícone de status */}
        <button onClick={e => { e.stopPropagation(); avancarStatus() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: STATUS_COR[status], flexShrink: 0, padding: 0, marginTop: 1 }}>
          <Icon size={18} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Data + badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
              {fmt(s.date)}
            </span>
            {ehHoje && (
              <span style={{ fontSize: 10, fontWeight: 700, color: cor, background: cor+'18', border: `1px solid ${cor}44`, borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
                HOJE
              </span>
            )}
            {passou && status !== 'Concluído' && (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#ef4444', background: '#ef444418', border: '1px solid #ef444433', borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
                ATRASADA
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 600, color: cor, background: cor+'18', border: `1px solid ${cor}33`, borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
              {s.disciplina}
            </span>
            <span style={{ fontSize: 10, color: STATUS_COR[status], background: STATUS_COR[status]+'18', border: `1px solid ${STATUS_COR[status]}33`, borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
              {status}
            </span>
          </div>

          <div style={{ fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
            {s.topico}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {s.metodos.map(m => {
              const mc = METODO_COR[m] || { bg: theme.border, text: theme.muted }
              return (
                <span key={m} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: mc.bg, color: mc.text, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500 }}>
                  {m}
                </span>
              )
            })}
            {d.tempo_total > 0 && (
              <span style={{ fontSize: 10, color: theme.gold, background: theme.gold+'18', borderRadius: 4, padding: '1px 7px', fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Timer size={9} /> {fmtTempo(d.tempo_total)}
              </span>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          {!passou && Math.abs(dias) <= 7 && (
            <span style={{ fontSize: 10, color: dias <= 0 ? '#ef4444' : theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
              {dias > 0 ? `${dias}d` : dias === 0 ? 'hoje' : `${Math.abs(dias)}d atrás`}
            </span>
          )}
          {aberto ? <ChevronUp size={15} color={theme.muted} /> : <ChevronDown size={15} color={theme.muted} />}
        </div>
      </div>

      {/* Detalhe expandido */}
      {aberto && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${theme.border}` }}>
          {/* Acertos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <span style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>Acertos (%):</span>
            <input
              type="number" min="0" max="100"
              value={d.acertos ?? ''}
              onChange={e => onAtualizar(s.id, { acertos: e.target.value === '' ? null : Math.min(100, Math.max(0, +e.target.value)) })}
              placeholder="—"
              style={{ width: 60, textAlign: 'center', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 13, padding: '4px 8px', fontFamily: 'Inter, sans-serif', outline: 'none' }}
            />
            {d.acertos !== null && d.acertos !== undefined && (
              <span style={{ fontSize: 13, fontWeight: 700, color: d.acertos >= 70 ? '#10b981' : d.acertos >= 50 ? '#f59e0b' : '#ef4444' }}>
                {d.acertos >= 70 ? 'Aproveitamento bom' : d.acertos >= 50 ? 'Reforçar' : 'Atenção necessária'}
              </span>
            )}
          </div>

          {/* Anotação */}
          <div style={{ marginTop: 10 }}>
            <textarea
              value={d.anotacao || ''}
              onChange={e => onAtualizar(s.id, { anotacao: e.target.value })}
              placeholder="Anotação sobre esta sessão..."
              rows={2}
              style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', color: theme.text, fontSize: 12, fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Cronômetro */}
          <Cronometro sessionId={s.id} onSalvar={salvarTempo} theme={theme} />
        </div>
      )}
    </div>
  )
}

// ── Dashboard principal ────────────────────────────────────────────────────────
export default function OabDashboard({ session }) {
  const { theme } = useTheme()
  const [dados, setDados]     = useState({})
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba]         = useState('cronograma')
  const [fFase, setFFase]     = useState('Todas')
  const [fDisc, setFDisc]     = useState('Todas')
  const [fStatus, setFStatus] = useState('Todos')
  const [fMes, setFMes]       = useState('Todos')
  const [exportando, setExportando] = useState(false)

  // Persistência no Supabase
  useEffect(() => { if (session) carregar() }, [session])

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase
      .from('oab_sessoes')
      .select('session_id, status, acertos, anotacao, tempo_total')
      .eq('user_id', session.user.id)
    if (data) {
      const map = {}
      data.forEach(r => { map[r.session_id] = r })
      setDados(map)
    }
    setCarregando(false)
  }

  const atualizar = useCallback(async (id, patch) => {
    const novo = { ...dados, [id]: { ...(dados[id] || {}), ...patch } }
    setDados(novo)
    await supabase.from('oab_sessoes').upsert({
      user_id:    session.user.id,
      session_id: id,
      status:     novo[id].status || 'A Fazer',
      acertos:    novo[id].acertos ?? null,
      anotacao:   novo[id].anotacao || '',
      tempo_total: novo[id].tempo_total || 0,
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'user_id,session_id' })
  }, [dados, session])

  const filtradas = useMemo(() => SESSIONS.filter(s => {
    if (fFase   !== 'Todas'  && s.fase       !== fFase)   return false
    if (fDisc   !== 'Todas'  && s.disciplina !== fDisc)   return false
    if (fStatus !== 'Todos'  && (dados[s.id]?.status || 'A Fazer') !== fStatus) return false
    if (fMes    !== 'Todos'  && getMes(s.date) !== fMes) return false
    return true
  }), [fFase, fDisc, fStatus, fMes, dados])

  // Estatísticas
  const stats = useMemo(() => {
    const total = SESSIONS.length
    const conc  = SESSIONS.filter(s => dados[s.id]?.status === 'Concluído').length
    const em    = SESSIONS.filter(s => dados[s.id]?.status === 'Em Andamento').length
    const comAcertos = SESSIONS.filter(s => dados[s.id]?.acertos !== null && dados[s.id]?.acertos !== undefined)
    const media = comAcertos.length ? (comAcertos.reduce((a,s) => a + dados[s.id].acertos, 0) / comAcertos.length).toFixed(1) : null
    const tempoTotal = SESSIONS.reduce((a,s) => a + (dados[s.id]?.tempo_total || 0), 0)
    const porDisc = {}
    DISCIPLINAS.forEach(d => {
      const ds = SESSIONS.filter(s => s.disciplina === d)
      const c  = ds.filter(s => dados[s.id]?.status === 'Concluído').length
      const av = ds.filter(s => dados[s.id]?.acertos !== null && dados[s.id]?.acertos !== undefined)
      porDisc[d] = {
        total: ds.length, conc: c,
        pct: ds.length ? Math.round(c/ds.length*100) : 0,
        media: av.length ? (av.reduce((a,s) => a + dados[s.id].acertos, 0) / av.length).toFixed(1) : null,
        cor: DISC_COR[d] || '#6b7280',
      }
    })
    return { total, conc, em, media, pct: Math.round(conc/total*100), tempoTotal, porDisc }
  }, [dados])

  const hoje    = new Date().toISOString().split('T')[0]
  const proximas = SESSIONS.filter(s => s.date >= hoje && dados[s.id]?.status !== 'Concluído').slice(0,3)

  if (carregando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: theme.gold, gap: 10 }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Carregando cronograma...</span>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 2 }}>
            Estudos OAB — 48º Exame
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
            1ª Fase: 10/01/2027 · 2ª Fase: 28/02/2027
          </div>
        </div>
        {/* Botão exportar Google Calendar */}
        <button
          onClick={() => { exportarICS(SESSIONS, dados); setExportando(true); setTimeout(() => setExportando(false), 2000) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: exportando ? '#0f2b1a' : theme.raised, border: `1px solid ${exportando ? '#10b981' : theme.border}`, color: exportando ? '#10b981' : theme.text, borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }}>
          {exportando ? <CheckCircle size={14} /> : <Calendar size={14} />}
          {exportando ? 'Exportado!' : 'Exportar para Google Calendar'}
        </button>
      </div>

      {/* Countdown 1ª Fase */}
      {diasAte('2027-01-10') > 0 && (
        <div style={{ background: theme.raised, border: `1px solid ${theme.gold}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Target size={18} color={theme.gold} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace' }}>
              {diasAte('2027-01-10')} dias
            </span>
            <span style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', marginLeft: 8 }}>
              para a 1ª Fase OAB (10/01/2027) · {stats.pct}% do cronograma concluído
            </span>
          </div>
        </div>
      )}

      {/* Próximas sessões */}
      {proximas.length > 0 && (
        <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Próximas sessões
          </div>
          {proximas.map(s => {
            const cor = DISC_COR[s.disciplina] || '#6b7280'
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: cor, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', width: 60, flexShrink: 0 }}>{fmt(s.date)}</span>
                <span style={{ fontSize: 12, color: theme.text, fontFamily: 'Inter, sans-serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.disciplina} — {s.topico}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Abas */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, marginBottom: 16, gap: 0 }}>
        {[
          { id: 'cronograma', label: 'Cronograma', icon: Calendar },
          { id: 'stats',      label: 'Estatísticas', icon: BarChart2 },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: aba === a.id ? 600 : 400, color: aba === a.id ? theme.gold : theme.muted, background: 'none', border: 'none', borderBottom: `2px solid ${aba === a.id ? theme.gold : 'transparent'}`, transition: 'all .15s' }}>
            <a.icon size={14} /> {a.label}
          </button>
        ))}
      </div>

      {/* ABA: Cronograma */}
      {aba === 'cronograma' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
            <Filter size={13} color={theme.muted} />
            {[
              { label: 'Fase', opts: ['Todas','1ª Fase','2ª Fase'], val: fFase, set: setFFase },
              { label: 'Mês',  opts: ['Todos', ...MESES],           val: fMes,  set: setFMes  },
              { label: 'Status', opts: ['Todos','A Fazer','Em Andamento','Concluído'], val: fStatus, set: setFStatus },
              { label: 'Disciplina', opts: ['Todas', ...DISCIPLINAS], val: fDisc, set: setFDisc },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 11, padding: '5px 10px', fontFamily: 'IBM Plex Mono, monospace', cursor: 'pointer', outline: 'none' }}>
                {f.opts.map(o => <option key={o} value={o}>{o === f.opts[0] ? `${f.label}: ${o}` : o}</option>)}
              </select>
            ))}
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', marginLeft: 'auto' }}>
              {filtradas.length} sessões
            </span>
          </div>

          {/* Lista de sessões */}
          {filtradas.map(s => (
            <SessaoCard key={s.id} s={s} dados={dados} onAtualizar={atualizar} theme={theme} />
          ))}
        </>
      )}

      {/* ABA: Estatísticas */}
      {aba === 'stats' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { l: 'Progresso geral',  v: `${stats.pct}%`,                      c: theme.gold     },
              { l: 'Sessões concluídas', v: `${stats.conc}/${stats.total}`,     c: '#10b981'      },
              { l: 'Em andamento',     v: stats.em,                             c: '#f59e0b'      },
              { l: 'Média de acertos', v: stats.media ? `${stats.media}%` : '—', c: '#3b82f6'    },
              { l: 'Tempo total estudo', v: fmtTempo(stats.tempoTotal),         c: '#8b5cf6'      },
            ].map(k => (
              <div key={k.l} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderTop: `3px solid ${k.c}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>{k.l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: k.c, fontFamily: 'IBM Plex Mono, monospace' }}>{k.v}</div>
              </div>
            ))}
          </div>

          {/* Progresso por disciplina */}
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace' }}>
            Por disciplina
          </div>
          {DISCIPLINAS.map(d => {
            const dp = stats.porDisc[d]
            return (
              <div key={d} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dp.cor }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{d}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{dp.conc}/{dp.total}</span>
                    {dp.media && <span style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'IBM Plex Mono, monospace' }}>{dp.media}% acertos</span>}
                    <span style={{ fontSize: 14, fontWeight: 700, color: dp.pct===100 ? '#10b981' : theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>{dp.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 5, background: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dp.pct}%`, background: dp.pct===100 ? '#10b981' : dp.cor, borderRadius: 3, transition: 'width .4s' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 24, borderTop: `1px solid ${theme.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
        <span>Lex.IA · Inteligência Jurídica · Farias Fusquiani</span>
        <span>48º Exame OAB · FGV · 1ª Fase 10/01/2027 · 2ª Fase 28/02/2027</span>
      </div>
    </div>
  )
}

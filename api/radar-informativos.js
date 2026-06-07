// api/radar-informativos.js
// Versão corrigida — Jessica / Lex.IA — 07/06/2026
//
// CORREÇÕES NESTA VERSÃO:
// 1. Tratamento explícito de erro antes de .json() (evita SyntaxError se a API retorna HTML/texto de erro)
// 2. Log do status HTTP e corpo bruto em caso de falha da Anthropic API (facilita diagnóstico)
// 3. Redução de chamadas à API de Anthropic: de até 4x para 1x (consulta STJ e STF em um único prompt)
//    → evita timeout de 10s no plano Hobby do Vercel
// 4. Verificação explícita de ANTHROPIC_API_KEY antes de qualquer chamada
// 5. Mantida a lógica de autenticação admin existente (via tabela membros + service_role key)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // DEVE ser a service_role key, NÃO a anon key
);

export default async function handler(req, res) {
  // ── 1. Apenas POST ──────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // ── 2. Verificar ANTHROPIC_API_KEY antes de qualquer coisa ─────────────────
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY || ANTHROPIC_KEY.trim() === '') {
    console.error('[radar] ANTHROPIC_API_KEY ausente ou vazia');
    return res.status(500).json({
      error: 'Configuração interna inválida: ANTHROPIC_API_KEY não definida no Vercel.',
      hint: 'Acesse Vercel → Settings → Environment Variables e adicione ANTHROPIC_API_KEY com sua chave válida do console.anthropic.com'
    });
  }

  // ── 3. Autenticação admin ────────────────────────────────────────────────────
  const userId = req.body?.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'user_id obrigatório no corpo da requisição' });
  }

  try {
    const { data: membro, error: membroError } = await supabase
      .from('membros')
      .select('role, user_id')
      .eq('user_id', userId)
      .single();

    if (membroError || !membro) {
      console.warn('[radar] Usuário não encontrado na tabela membros:', userId);
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (membro.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas admins podem executar o radar' });
    }
  } catch (authErr) {
    console.error('[radar] Erro na autenticação:', authErr);
    return res.status(500).json({ error: 'Erro interno na autenticação' });
  }

  // ── 4. Chamada à API da Anthropic (STJ + STF em UM único prompt) ────────────
  // Consolidamos STJ e STF em uma única chamada para evitar timeout no Vercel Hobby (10s limit)
  const prompt = `Você é um assistente jurídico. Pesquise e resuma os informativos jurídicos mais recentes 
do STJ (Superior Tribunal de Justiça) e do STF (Supremo Tribunal Federal) do Brasil.
Para cada tribunal, traga:
- As 3 decisões ou informativos mais recentes e relevantes
- Tema, ementa resumida e impacto prático

Responda em JSON no seguinte formato:
{
  "stj": [
    { "titulo": "...", "resumo": "...", "data": "..." }
  ],
  "stf": [
    { "titulo": "...", "resumo": "...", "data": "..." }
  ],
  "gerado_em": "data atual"
}
Responda SOMENTE com o JSON, sem texto adicional antes ou depois.`;

  let claudeData;
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929', // atualizado para versão estável
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    // ── PONTO CRÍTICO: verificar ok ANTES de chamar .json() ──────────────────
    if (!claudeRes.ok) {
      // Ler como texto primeiro para evitar SyntaxError se a resposta não for JSON
      const rawBody = await claudeRes.text();
      console.error(`[radar] Anthropic API retornou status ${claudeRes.status}:`, rawBody.slice(0, 500));
      return res.status(500).json({
        error: `Falha na API da Anthropic: HTTP ${claudeRes.status}`,
        detalhe: rawBody.slice(0, 200)  // primeiros 200 chars para diagnóstico
      });
    }

    claudeData = await claudeRes.json();
  } catch (fetchErr) {
    console.error('[radar] Erro de rede ao chamar Anthropic:', fetchErr);
    return res.status(500).json({
      error: 'Erro de rede ao contactar a API da Anthropic',
      detalhe: fetchErr.message
    });
  }

  // ── 5. Extrair texto da resposta da Anthropic ────────────────────────────────
  try {
    const textBlock = claudeData.content?.find(b => b.type === 'text');
    if (!textBlock?.text) {
      console.error('[radar] Resposta da Anthropic sem bloco de texto:', JSON.stringify(claudeData).slice(0, 300));
      return res.status(500).json({ error: 'Resposta inesperada da API da Anthropic (sem bloco de texto)' });
    }

    // Tentar parsear o JSON retornado pelo modelo
    let informativos;
    try {
      // Remover possíveis marcadores de bloco de código (```json ... ```)
      const cleanText = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      informativos = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error('[radar] Modelo não retornou JSON válido:', textBlock.text.slice(0, 300));
      return res.status(500).json({
        error: 'O modelo não retornou JSON válido',
        resposta_bruta: textBlock.text.slice(0, 300)
      });
    }

    // ── 6. Salvar no Supabase (tabela radar_resultados) ──────────────────────
    // Ajuste o nome da tabela/colunas conforme seu schema real
    const { error: insertError } = await supabase
      .from('radar_resultados')
      .insert({
        resultado: informativos,
        criado_por: userId,
        criado_em: new Date().toISOString()
      });

    if (insertError) {
      // Log mas não falha — o dado já foi obtido, apenas não persistiu
      console.warn('[radar] Aviso: não foi possível salvar no Supabase:', insertError.message);
    }

    return res.status(200).json({
      success: true,
      data: informativos
    });

  } catch (processErr) {
    console.error('[radar] Erro ao processar resposta da Anthropic:', processErr);
    return res.status(500).json({ error: 'Erro interno ao processar resposta' });
  }
}

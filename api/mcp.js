// Conector MCP do Themis Jur — expõe entradas (jurisprudência/doutrina/teses) e legislação
// como tools de leitura, via Streamable HTTP. Sem OAuth nesta versão (uso pessoal).
// Autenticação de dado: usa a mesma SUPABASE_SERVICE_KEY já configurada em api/busca.js.
// As duas RPCs chamadas (buscar_entradas_fts / buscar_legislacao_fts) são STABLE,
// SECURITY DEFINER e só fazem SELECT — não há caminho de escrita nesta rota.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

let supabaseSingleton;
function getSupabase() {
  if (!supabaseSingleton) {
    supabaseSingleton = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return supabaseSingleton;
}

function buildServer() {
  const server = new McpServer({ name: "themis-jur-repositorio", version: "1.0.0" });

  server.registerTool(
    "buscar_jurisprudencia_doutrina",
    {
      title: "Buscar jurisprudência e doutrina",
      description:
        "Busca full-text (português) no repositório de jurisprudência, doutrina, súmulas e teses do Themis Jur. " +
        "Retorna apenas entradas reais já cadastradas no banco (não gera conteúdo).",
      inputSchema: {
        query: z.string().describe("Problema jurídico ou termos de busca, em português"),
        area: z.string().optional().describe("Filtro por área (ex: Cível, Penal)"),
        tipo: z
          .enum(["jurisprudência", "doutrina", "súmula", "lei"])
          .optional()
          .describe("Filtro por tipo de entrada"),
        limit: z.number().int().min(1).max(30).optional().describe("Máx. de resultados (default 10)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, area, tipo, limit }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("buscar_entradas_fts", {
        p_query: query,
        p_area: area ?? null,
        p_tipo: tipo ?? null,
        p_limit: limit ?? 10,
      });

      if (error) {
        return {
          isError: true,
          content: [{ type: "text", text: `Erro ao buscar em "entradas": ${error.message}` }],
        };
      }
      if (!data || data.length === 0) {
        return { content: [{ type: "text", text: "Nenhuma entrada encontrada para essa busca." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "buscar_legislacao",
    {
      title: "Buscar legislação",
      description:
        "Busca full-text (português) na base de dispositivos legais do Themis Jur (ex: Código Civil, Lei 9.099/95). " +
        "Sempre sinaliza o campo 'vigente'; dispositivos não vigentes só aparecem se incluir_revogados=true.",
      inputSchema: {
        query: z.string().describe("Termo, artigo ou tema legislativo buscado"),
        codigo: z.string().optional().describe("Filtro por diploma (ex: cc, lei9099)"),
        incluir_revogados: z.boolean().optional().describe("Incluir dispositivos não vigentes (default false)"),
        limit: z.number().int().min(1).max(30).optional().describe("Máx. de resultados (default 10)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, codigo, incluir_revogados, limit }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("buscar_legislacao_fts", {
        p_query: query,
        p_codigo: codigo ?? null,
        p_incluir_revogados: incluir_revogados ?? false,
        p_limit: limit ?? 10,
      });

      if (error) {
        return {
          isError: true,
          content: [{ type: "text", text: `Erro ao buscar em "legislacao": ${error.message}` }],
        };
      }
      if (!data || data.length === 0) {
        return { content: [{ type: "text", text: "Nenhum dispositivo encontrado para essa busca." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  return server;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Método não permitido. Use POST (Streamable HTTP / JSON-RPC)." });
    return;
  }

  const server = buildServer();
  // sessionIdGenerator: undefined => modo stateless, adequado a funções serverless
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}

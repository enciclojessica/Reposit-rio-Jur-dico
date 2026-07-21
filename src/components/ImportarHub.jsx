import { useState } from 'react'
import { useTheme } from '../theme'
import { Lock, Upload, BookOpen, FileSearch, Newspaper } from 'lucide-react'
import ImportacaoLote from './ImportacaoLote'
import ImportarLegislacao from './ImportarLegislacao'
import ExtrairPeticao from './ExtrairPeticao'
import Informativos from './Informativos'

const ABAS = [
  { id: 'planilha',     label: 'Planilha',          icon: Upload },
  { id: 'legislacao',   label: 'Legislação',         icon: BookOpen },
  { id: 'peticao',      label: 'Extrair Petição',    icon: FileSearch },
  { id: 'informativos', label: 'Informativos',       icon: Newspaper },
]

function viewToAba(view) {
  if (view === 'legislacao')     return 'legislacao'
  if (view === 'extrair')        return 'peticao'
  if (view === 'informativos')   return 'informativos'
  return 'planilha'
}

export default function ImportarHub({ session, initialTab, onAbaChange, setView, theme: themeProp, onImportar, isEditor, todasEntradas, onAtualizar }) {
  const { theme } = useTheme()
  const t = theme || themeProp
  const [aba, setAba] = useState(() => viewToAba(initialTab))

  function trocarAba(novaAba) {
    setAba(novaAba)
    if (onAbaChange) onAbaChange(novaAba)
  }

  if (!session) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <Lock size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 16px' }} />
      <div style={{ fontSize: 16, color: t.text, fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>
        Acesso restrito
      </div>
      <div style={{ fontSize: 13, color: t.muted, fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
        Faça login para importar dados para o repositório.
      </div>
      <button
        onClick={() => setView && setView('login')}
        style={{ background: t.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
        Acessar
      </button>
    </div>
  )

  return (
    <div className="fade-up">
      {/* Título */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Importar
        </div>
        <div style={{ fontSize: 12, color: t.muted, fontFamily: 'Inter, sans-serif' }}>
          Escolha como deseja adicionar conteúdo ao repositório.
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${t.border}`, marginBottom: 24 }}>
        {ABAS.map(a => {
          const ativo = aba === a.id
          const Icon  = a.icon
          return (
            <button
              key={a.id}
              onClick={() => trocarAba(a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${ativo ? t.gold : 'transparent'}`,
                cursor: 'pointer',
                color: ativo ? t.gold : t.muted,
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                fontWeight: ativo ? 600 : 400,
                transition: 'all .15s',
                marginBottom: -1,
              }}
            >
              <Icon size={14} />
              {a.label}
            </button>
          )
        })}
      </div>

      {/* Conteúdo */}
      {aba === 'planilha'       && <ImportacaoLote session={session} />}
      {aba === 'legislacao'     && <ImportarLegislacao />}
      {aba === 'peticao'        && <ExtrairPeticao />}
      {aba === 'informativos'   && (
        <Informativos
          onImportar={entrada => { if (onImportar) onImportar(entrada) }}
          isEditor={isEditor}
          todasEntradas={todasEntradas || []}
          userId={session?.user?.id}
          onAtualizar={onAtualizar}
        />
      )}
    </div>
  )
}

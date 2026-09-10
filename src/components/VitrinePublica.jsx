import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { AREAS, corDaArea } from '../shared'
import SeletorTema from './SeletorTema'
import { ChevronRight, ArrowLeft } from 'lucide-react'

// Vitrine pública: lista as entradas marcadas como públicas, navegável sem
// login. A RLS (entradas_select_publicas, role anon) já restringe sozinha
// o que essa consulta pode trazer — não precisa filtrar nada aqui, uma
// tentativa de pedir mais que isso simplesmente não traz linha nenhuma.
export default function VitrinePublica({ onAbrirEntrada, onEntrar }) {
  const { theme } = useTheme()
  const [entradas, setEntradas] = useState(null)
  const [areaFiltro, setAreaFiltro] = useState('todas')

  useEffect(() => {
    supabase
      .from('entradas')
      .select('id, area, tipo, tema, fonte')
      .order('criado_em', { ascending: false })
      .then(({ data }) => setEntradas(data || []))
  }, [])

  const areasComConteudo = entradas
    ? [...new Set(entradas.map(e => e.area))].sort()
    : []

  const filtradas = entradas
    ? entradas.filter(e => areaFiltro === 'todas' || e.area === areaFiltro)
    : []

  return (
    <div style={{ minHeight: '100vh', background: '#fdfbf7', fontFamily: "Georgia, 'EB Garamond', serif" }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fdfbf7ee', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e4ddd0' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#736b62', fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Themis Jur
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SeletorTema compact />
          <button onClick={onEntrar} style={{ background: 'none', border: 'none', color: '#736b62', fontSize: 12, fontStyle: 'italic', cursor: 'pointer', fontFamily: 'inherit' }}>
            Já tenho acesso
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: '#2c241b', marginBottom: 8 }}>
          Amostra do acervo
        </div>
        <div style={{ fontSize: 14, color: '#736b62', fontStyle: 'italic', marginBottom: 28 }}>
          Uma seleção do que o Themis Jur reúne, curada pra quem ainda não tem conta. O acervo completo é maior, e é gratuito pra quem se cadastra.
        </div>

        {entradas && entradas.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            <button onClick={() => setAreaFiltro('todas')}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 14, border: `1px solid ${areaFiltro === 'todas' ? '#8f6d27' : '#e4ddd0'}`, background: areaFiltro === 'todas' ? '#8f6d2718' : 'transparent', color: areaFiltro === 'todas' ? '#8f6d27' : '#736b62', cursor: 'pointer', fontFamily: 'inherit' }}>
              Todas
            </button>
            {areasComConteudo.map(area => (
              <button key={area} onClick={() => setAreaFiltro(area)}
                style={{ fontSize: 12, padding: '5px 12px', borderRadius: 14, border: `1px solid ${areaFiltro === area ? corDaArea(area, theme) : '#e4ddd0'}`, background: areaFiltro === area ? corDaArea(area, theme) + '18' : 'transparent', color: areaFiltro === area ? corDaArea(area, theme) : '#736b62', cursor: 'pointer', fontFamily: 'inherit' }}>
                {area}
              </button>
            ))}
          </div>
        )}

        {!entradas && (
          <div style={{ fontSize: 13, color: '#736b62', fontStyle: 'italic' }}>Carregando…</div>
        )}

        {entradas && filtradas.length === 0 && (
          <div style={{ fontSize: 13, color: '#736b62', fontStyle: 'italic' }}>Nenhuma entrada pública nessa área ainda.</div>
        )}

        {filtradas.map(e => (
          <div key={e.id} onClick={() => onAbrirEntrada(e.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 0', borderBottom: '1px solid #e4ddd014', cursor: 'pointer' }}
            onMouseEnter={ev => ev.currentTarget.style.borderBottomColor = corDaArea(e.area, theme) + '55'}
            onMouseLeave={ev => ev.currentTarget.style.borderBottomColor = '#e4ddd014'}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11 }}>
                <span style={{ color: corDaArea(e.area, theme) }}>{e.area}</span>
                <span style={{ color: '#736b62' }}>· {e.tipo}</span>
              </div>
              <div style={{ fontSize: 15, color: '#2c241b' }}>{e.tema}</div>
              {e.fonte && <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', marginTop: 3 }}>{e.fonte}</div>}
            </div>
            <ChevronRight size={16} color="#736b62" style={{ flexShrink: 0 }} />
          </div>
        ))}

        {entradas && entradas.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 48, padding: '28px 24px', background: '#f6ede0', borderRadius: 10 }}>
            <div style={{ fontSize: 14, color: '#3a3128', marginBottom: 16 }}>
              Isso é só uma amostra. O acervo completo tem muito mais, e o cadastro é gratuito.
            </div>
            <button onClick={onEntrar} style={{ background: '#8f6d27', border: 'none', color: '#fff', fontSize: 14, fontWeight: 'bold', padding: '12px 32px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
              Criar conta gratuita
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { FreeBuilder, ModeSwitch } from './FreeBuilder'
import './App.css'

const MIN_WORKSPACE_WIDTH = 260
const RESIZE_HANDLE_WIDTH = 8

const palette = [
  { id: 'start', type: 'events', label: 'ao clicar em iniciar', icon: '▶' },
  { id: 'end', type: 'events', label: 'fim / return 0', icon: '■' },
  { id: 'declare-a', type: 'variables', label: 'declarar inteiro a', icon: '▣' },
  { id: 'declare-bool', type: 'variables', label: 'declarar booleano resultado', icon: '▣' },
  { id: 'read-n', type: 'sensing', label: 'ler número n', icon: '⌨' },
  { id: 'read-a-b-c', type: 'sensing', label: 'ler números a, b e c', icon: '⌨' },
  { id: 'read-a-b', type: 'sensing', label: 'ler números a e b', icon: '⌨' },
  { id: 'eq', type: 'operators', label: 'a == b', icon: '=' },
  { id: 'neq', type: 'operators', label: 'a != b', icon: '≠' },
  { id: 'lt', type: 'operators', label: 'a < b', icon: '<' },
  { id: 'lte', type: 'operators', label: 'a <= b', icon: '≤' },
  { id: 'gt', type: 'operators', label: 'a > b', icon: '>' },
  { id: 'gte', type: 'operators', label: 'a >= b', icon: '≥' },
  { id: 'and', type: 'operators', label: 'a && b', icon: '&&' },
  { id: 'or', type: 'operators', label: 'a || b', icon: '||' },
  { id: 'not', type: 'operators', label: '!a', icon: '!' },
  { id: 'if-n-pos', type: 'control', label: 'se n > 0, então', icon: '◆' },
  { id: 'else-if-neg', type: 'control', label: 'senão se n < 0, então', icon: '◆' },
  { id: 'else', type: 'control', label: 'senão', icon: '◆' },
  { id: 'if-a-bigger', type: 'control', label: 'se a ≥ b e a ≥ c', icon: '◆' },
  { id: 'else-if-bigger', type: 'control', label: 'senão se b ≥ a e b ≥ c', icon: '◆' },
  { id: 'if-a-bigger-b', type: 'control', label: 'se a > b, então', icon: '◆' },
  { id: 'switch', type: 'control', label: 'switch (n)', icon: '≡' },
  { id: 'case', type: 'control', label: 'caso n == valor', icon: '▸' },
  { id: 'break', type: 'control', label: 'break', icon: '■' },
  { id: 'default', type: 'control', label: 'caso padrão', icon: '◌' },
  { id: 'printf', type: 'looks', label: 'printf("texto")', icon: '“' },
  { id: 'scanf', type: 'looks', label: 'scanf("%d", &n)', icon: '⌨' },
  { id: 'print-positive', type: 'looks', label: 'imprimir positivo', icon: '◉' },
  { id: 'print-negative', type: 'looks', label: 'imprimir negativo', icon: '◉' },
  { id: 'print-zero', type: 'looks', label: 'imprimir zero', icon: '◉' },
  { id: 'print-a', type: 'looks', label: 'imprimir a', icon: '◉' },
  { id: 'print-b', type: 'looks', label: 'imprimir b', icon: '◉' },
  { id: 'print-c', type: 'looks', label: 'imprimir c', icon: '◉' },
]

const missions = [
  {
    id: 1,
    title: 'Positivo, negativo ou zero',
    subtitle: 'Classifique um número',
    xp: 100,
    hint: 'Use uma decisão para cada faixa e deixe o último caso para o zero.',
    target: ['start', 'read-n', 'if-n-pos', 'print-positive', 'else-if-neg', 'print-negative', 'else', 'print-zero', 'end'],
    tests: ['n = 7 → positivo', 'n = -4 → negativo', 'n = 0 → zero'],
    code: `#include <stdio.h>

int main(void)
{
    int n;

    scanf("%d", &n);

    if (n > 0) {
        printf("positivo\\n");
    } else if (n < 0) {
        printf("negativo\\n");
    } else {
        printf("zero\\n");
    }

    return 0;
}`,
  },
  {
    id: 2,
    title: 'Quem é o maior?',
    subtitle: 'Compare três valores',
    xp: 150,
    hint: 'Cubra os três vencedores possíveis com comparações encadeadas.',
    target: ['start', 'read-a-b-c', 'if-a-bigger', 'print-a', 'else-if-bigger', 'print-b', 'else', 'print-c', 'end'],
    tests: ['a=8, b=3, c=5 → 8', 'a=2, b=9, c=4 → 9', 'a=1, b=2, c=7 → 7'],
    code: `#include <stdio.h>

int main(void)
{
    int a, b, c;

    scanf("%d %d %d", &a, &b, &c);

    if (a >= b && a >= c)
        printf("%d\\n", a);
    else if (b >= a && b >= c)
        printf("%d\\n", b);
    else
        printf("%d\\n", c);

    return 0;
}`,
  },
  {
    id: 3,
    title: 'O maior entre dois',
    subtitle: 'Decisão com duas saídas',
    xp: 200,
    hint: 'Se a não vence, b vence — inclusive no empate, conforme a condição.',
    target: ['start', 'read-a-b', 'if-a-bigger-b', 'print-a', 'else', 'print-b', 'end'],
    tests: ['a=10, b=4 → 10', 'a=3, b=8 → 8', 'a=5, b=5 → 5'],
    code: `#include <stdio.h>

int main(void)
{
    int a, b;

    scanf("%d %d", &a, &b);

    if (a > b)
        printf("%d\\n", a);
    else
        printf("%d\\n", b);

    return 0;
}`,
  },
]

function Block({ block, onAdd, onRemove, inWorkspace = false, highlighted = false }) {
  return (
    <button
      type="button"
      draggable
      className={`block block-${block.type}${highlighted ? ' next-block' : ''}`}
      onDragStart={(event) => event.dataTransfer.setData('block-id', block.id)}
      onClick={() => (inWorkspace ? onRemove(block.instanceId) : onAdd(block.id))}
    >
      <span className="block-icon">{block.icon}</span>
      <span>{block.label}</span>
      {inWorkspace && <span className="remove-mark">×</span>}
    </button>
  )
}

function App() {
  const [workspaceWidth, setWorkspaceWidth] = useState(320)
  const resizeStartRef = useRef(null)
  const [viewMode, setViewMode] = useState('free')
  const [missionIndex, setMissionIndex] = useState(0)
  const [workspace, setWorkspace] = useState([])
  const [xp, setXp] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [showCode, setShowCode] = useState(false)
  const [terminalLines, setTerminalLines] = useState(['$ terminal pronto'])
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalCollapsed, setTerminalCollapsed] = useState(false)
  const mission = missions[missionIndex]
  const nextWorkspaceBlock = palette.find((block) => block.id === mission.target[workspace.length])
  const nextWorkspaceNumber = workspace.length + 1
  const nextBlockId = mission.target[workspace.length]

  const getMaxWorkspaceWidth = () => {
    const narrowLayout = window.innerWidth <= 1050
    const missionWidth = narrowLayout ? 220 : 265
    const minPaletteWidth = narrowLayout ? 300 : 320
    return Math.max(
      MIN_WORKSPACE_WIDTH,
      window.innerWidth - missionWidth - RESIZE_HANDLE_WIDTH - minPaletteWidth,
    )
  }

  const clampWorkspaceWidth = (width) => (
    Math.min(getMaxWorkspaceWidth(), Math.max(MIN_WORKSPACE_WIDTH, width))
  )

  useEffect(() => {
    const clampOnResize = () => {
      setWorkspaceWidth((width) => clampWorkspaceWidth(width))
    }

    window.addEventListener('resize', clampOnResize)
    return () => window.removeEventListener('resize', clampOnResize)
  }, [])

  const startResizing = (event) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeStartRef.current = { clientX: event.clientX, width: workspaceWidth }
  }

  const resizeWorkspace = (event) => {
    const start = resizeStartRef.current
    if (!start) return
    setWorkspaceWidth(clampWorkspaceWidth(start.width + event.clientX - start.clientX))
  }

  const stopResizing = () => {
    resizeStartRef.current = null
  }

  const resizeWithKeyboard = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    setWorkspaceWidth((width) => clampWorkspaceWidth(width + direction * 24))
  }

  const addBlock = (blockId) => {
    if (blockId === nextBlockId) {
      setFeedback({ type: 'success', text: `Correto: passo ${workspace.length + 1} concluído.` })
    } else {
      setFeedback({ type: 'error', text: `Dica: agora o próximo passo é “${nextWorkspaceBlock?.label}”.` })
    }
    setWorkspace((current) => [
      ...current,
      { ...palette.find((item) => item.id === blockId), instanceId: `${blockId}-${Date.now()}-${current.length}` },
    ])
  }

  const removeBlock = (instanceId) => {
    setWorkspace((current) => current.filter((block) => block.instanceId !== instanceId))
  }

  const clearWorkspace = () => {
    setWorkspace([])
    setFeedback(null)
    setActiveStep(-1)
    setShowCode(false)
    setTerminalLines(['$ terminal pronto'])
    setTerminalInput('')
    setTerminalCollapsed(false)
  }

  const runTerminal = () => {
    if (missionIndex === 0) {
      const number = Number(terminalInput)
      if (terminalInput.trim() === '' || !Number.isFinite(number)) {
        setTerminalLines((lines) => [...lines, '$ digite um número inteiro'])
        return
      }
      const output = number > 0 ? 'positivo' : number < 0 ? 'negativo' : 'zero'
      setTerminalLines((lines) => [...lines, `$ ./programa ${number}`, output])
    } else if (missionIndex === 1) {
      const values = terminalInput.trim().split(/\s+/).map(Number)
      if (values.length !== 3 || values.some((value) => !Number.isFinite(value))) {
        setTerminalLines((lines) => [...lines, '$ digite três números separados por espaço'])
        return
      }
      setTerminalLines((lines) => [...lines, `$ ./programa ${values.join(' ')}`, String(Math.max(...values))])
    } else {
      const values = terminalInput.trim().split(/\s+/).map(Number)
      if (values.length !== 2 || values.some((value) => !Number.isFinite(value))) {
        setTerminalLines((lines) => [...lines, '$ digite dois números separados por espaço'])
        return
      }
      setTerminalLines((lines) => [...lines, `$ ./programa ${values.join(' ')}`, String(values[0] > values[1] ? values[0] : values[1])])
    }
    setTerminalInput('')
  }

  const runProgram = () => {
    if (running) return
    setFeedback(null)
    if (workspace.length === 0) {
      setFeedback({ type: 'error', text: 'Comece adicionando o bloco “ao clicar em iniciar”.' })
      return
    }
    setRunning(true)
    setActiveStep(0)

    workspace.forEach((_, index) => {
      window.setTimeout(() => setActiveStep(index), index * 280)
    })

    window.setTimeout(() => {
      const answer = workspace.map((block) => block.id)
      const correct = answer.length === mission.target.length && answer.every((id, index) => id === mission.target[index])
      setRunning(false)
      setActiveStep(-1)
      if (correct) {
        setXp((value) => value + mission.xp)
        setFeedback({ type: 'success', text: `Missão concluída! +${mission.xp} XP` })
      } else {
        const mismatchIndex = answer.findIndex((id, index) => id !== mission.target[index])
        if (mismatchIndex >= 0) {
          const placed = workspace[mismatchIndex]
          const expected = palette.find((block) => block.id === mission.target[mismatchIndex])
          setFeedback({
            type: 'error',
            text: `Bloco ${mismatchIndex + 1}: você colocou “${placed?.label}”, mas aqui precisa ser “${expected?.label}”.`,
          })
        } else {
          const nextBlock = palette.find((block) => block.id === mission.target[answer.length])
          setFeedback({
            type: 'error',
            text: nextBlock
              ? `Faltou adicionar o bloco “${nextBlock.label}”.`
              : 'Há blocos sobrando. Confira a sequência completa.',
          })
        }
      }
    }, Math.max(workspace.length * 280 + 300, 700))
  }

  const goToMission = (index) => {
    setMissionIndex(index)
    clearWorkspace()
  }

  const nextMission = () => {
    if (missionIndex < missions.length - 1) goToMission(missionIndex + 1)
  }

  const onDrop = (event) => {
    event.preventDefault()
    addBlock(event.dataTransfer.getData('block-id'))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">LOGIC</div>
          <div>
            <strong>Lab 03</strong>
            <span>Lógica Booleana</span>
          </div>
        </div>
        <div className="progress-wrap">
          <span>{viewMode === 'guided' ? `Missão ${missionIndex + 1} de ${missions.length}` : 'Módulo 3 · Montagem livre'}</span>
          {viewMode === 'guided' && (
            <div className="progress-track"><div style={{ width: `${((missionIndex + 1) / missions.length) * 100}%` }} /></div>
          )}
        </div>
        <div className="xp-box"><span>XP</span><strong>{xp}</strong></div>
      </header>

      {viewMode === 'free' ? (
        <FreeBuilder
          onModeChange={setViewMode}
          workspaceWidth={workspaceWidth}
          maxWorkspaceWidth={getMaxWorkspaceWidth()}
          onResizeStart={startResizing}
          onResizeMove={resizeWorkspace}
          onResizeEnd={stopResizing}
          onResizeKeyDown={resizeWithKeyboard}
        />
      ) : (
      <section
        className="game-grid"
        style={{ '--workspace-width': `${workspaceWidth}px` }}
      >
        <aside className="mission-panel">
          <ModeSwitch mode={viewMode} onChange={setViewMode} />
          <div className="level-chip">NÍVEL 03</div>
          <h1>{mission.title}</h1>
          <p className="mission-subtitle">{mission.subtitle}</p>

          <div className="mission-card">
            <div className="card-heading">
              <span>Seu objetivo</span>
              <strong>+{mission.xp} XP</strong>
            </div>
            <p>{mission.hint}</p>
            <div className="sequence-tip">
              Próximo bloco: <strong>{workspace.length < mission.target.length ? `${nextWorkspaceNumber} · ${nextWorkspaceBlock?.label}` : 'clique em Executar'}</strong>
            </div>
          </div>

          <div className="test-card">
            <span>Casos de teste</span>
            {mission.tests.map((test) => <div key={test}><b>◆</b>{test}</div>)}
          </div>

          <div className="mission-nav">
            {missions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === missionIndex ? 'active' : ''}
                onClick={() => goToMission(index)}
                aria-label={`Ir para missão ${item.id}`}
              >
                {item.id}
              </button>
            ))}
          </div>
        </aside>

        <section className="workspace-panel">
          <div className="panel-header">
            <div>
              <span className="status-dot" />
              <strong>Área de montagem</strong>
            </div>
            <button type="button" className="clear-button" onClick={clearWorkspace}>Limpar</button>
          </div>

          <div className="workspace" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
            {workspace.length === 0 ? (
              <div className="empty-state">
                <div className="ghost-block">arraste um bloco aqui</div>
                <div className="first-step">1. Comece pelo bloco dourado destacado à direita</div>
              </div>
            ) : (
              workspace.map((block, index) => (
                <div className={activeStep === index ? 'workspace-row active-row' : 'workspace-row'} key={block.instanceId}>
                  <span className="line-number">{index + 1}</span>
                  <Block block={block} inWorkspace onRemove={removeBlock} />
                </div>
              ))
            )}
          </div>

          {feedback?.type === 'success' && (
            <section className="completion-panel">
              <div className="terminal-panel">
                <div className="terminal-header">
                  <span><i /> <i /> <i /></span>
                  <strong>Terminal</strong>
                  <button
                    type="button"
                    className="terminal-toggle"
                    aria-label={terminalCollapsed ? 'Expandir terminal' : 'Minimizar terminal'}
                    aria-expanded={!terminalCollapsed}
                    aria-controls="terminal-content"
                    onClick={() => setTerminalCollapsed((collapsed) => !collapsed)}
                  >
                    {terminalCollapsed ? 'Expandir' : 'Minimizar'}
                  </button>
                </div>
                <div id="terminal-content" hidden={terminalCollapsed}>
                  <div className="terminal-output" aria-live="polite">
                    {terminalLines.map((line, index) => (
                      <div key={`${line}-${index}`}>{line}</div>
                    ))}
                  </div>
                  <form
                    className="terminal-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      runTerminal()
                    }}
                  >
                    <span>$</span>
                    <input
                      value={terminalInput}
                      onChange={(event) => setTerminalInput(event.target.value)}
                      placeholder={missionIndex === 0 ? 'digite n' : missionIndex === 1 ? 'digite a b c' : 'digite a b'}
                      aria-label="Entrada do programa"
                    />
                    <button type="submit">Executar entrada</button>
                  </form>
                </div>
              </div>

              <div className="code-panel">
                <button type="button" className="reveal-button" onClick={() => setShowCode((visible) => !visible)}>
                  {showCode ? 'Ocultar código C' : 'Revelar código C'}
                </button>
                {showCode && (
                  <pre><code>{mission.code}</code></pre>
                )}
              </div>
            </section>
          )}

          <div className="runbar">
            {feedback && <div className={`feedback ${feedback.type}`}>{feedback.text}</div>}
            <button type="button" className="run-button" onClick={runProgram} disabled={running}>
              <span>{running ? 'Executando...' : 'Executar'}</span>
              <b>▶</b>
            </button>
            {feedback?.type === 'success' && missionIndex < missions.length - 1 && (
              <button type="button" className="next-button" onClick={nextMission}>Próxima missão →</button>
            )}
          </div>
        </section>

        <div
          className="layout-resizer"
          role="separator"
          aria-label="Redimensionar área de montagem e blocos"
          aria-orientation="vertical"
          aria-valuemin={MIN_WORKSPACE_WIDTH}
          aria-valuemax={getMaxWorkspaceWidth()}
          aria-valuenow={Math.min(workspaceWidth, getMaxWorkspaceWidth())}
          aria-valuetext={`${workspaceWidth} pixels para a área de montagem`}
          tabIndex={0}
          onPointerDown={startResizing}
          onPointerMove={resizeWorkspace}
          onPointerUp={stopResizing}
          onPointerCancel={stopResizing}
          onKeyDown={resizeWithKeyboard}
        >
          <span aria-hidden="true" />
        </div>

        <aside className="palette-panel">
          <div className="palette-title">
            <strong>Blocos</strong>
            <span>clique ou arraste</span>
          </div>

          {['events', 'variables', 'sensing', 'operators', 'control', 'looks'].map((category) => (
            <div className="palette-group" key={category}>
              <span className={`category-label label-${category}`}>
                {{
                  events: 'Eventos',
                  variables: 'Variáveis',
                  sensing: 'Entrada',
                  operators: 'Operadores',
                  control: 'Controle',
                  looks: 'Saída',
                }[category]}
              </span>
              {palette.filter((block) => block.type === category).map((block) => (
                <Block
                  key={block.id}
                  block={block}
                  onAdd={addBlock}
                  highlighted={block.id === nextBlockId}
                />
              ))}
            </div>
          ))}
        </aside>
      </section>
      )}
    </main>
  )
}

export default App

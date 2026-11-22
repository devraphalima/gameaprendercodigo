import { useMemo, useRef, useState } from 'react'
import {
  blockDefinitions,
  createBlock,
  expressionTokens,
  generateC,
  getBlockDepth,
  moduleThreeExercises,
  paletteTabs,
} from './freeBuilderModel'
import './FreeBuilder.css'

export function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-switch" role="tablist" aria-label="Modo de estudo">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'guided'}
        className={mode === 'guided' ? 'active' : ''}
        onClick={() => onChange('guided')}
      >
        Missões
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'free'}
        className={mode === 'free' ? 'active' : ''}
        onClick={() => onChange('free')}
      >
        Montagem livre
      </button>
    </div>
  )
}

function ExpressionField({
  block,
  field,
  label,
  placeholder,
  onChange,
  registerInput,
  trackSelection,
}) {
  return (
    <label className="free-field">
      <span>{label}</span>
      <input
        ref={(element) => registerInput(block.instanceId, field, element)}
        value={block[field] ?? ''}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(block.instanceId, field, event.target.value)
          trackSelection(block.instanceId, field, event.target)
        }}
        onFocus={(event) => trackSelection(block.instanceId, field, event.target)}
        onSelect={(event) => trackSelection(block.instanceId, field, event.target)}
      />
    </label>
  )
}

function TextField({ label, value, placeholder, onChange, type = 'text' }) {
  return (
    <label className="free-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function FreeStatementBlock({
  block,
  index,
  depth,
  selected,
  onSelect,
  onChange,
  onMove,
  onRemove,
  registerInput,
  trackSelection,
}) {
  const definition = blockDefinitions[block.type]
  const category = definition.category
  const expression = (field, label, placeholder) => (
    <ExpressionField
      block={block}
      field={field}
      label={label}
      placeholder={placeholder}
      onChange={onChange}
      registerInput={registerInput}
      trackSelection={trackSelection}
    />
  )

  return (
    <article
      className={`free-block free-block-${category}${selected ? ' selected' : ''}`}
      style={{ marginLeft: `${Math.min(depth, 4) * 18}px` }}
      onClick={() => onSelect(block.instanceId)}
    >
      <header className="free-block-header">
        <div className="free-block-title">
          <span className="free-block-icon">{definition.icon}</span>
          <strong>{definition.label}</strong>
          <span className="free-block-number">{index + 1}</span>
        </div>
        <div className="free-block-actions">
          <button type="button" aria-label={`Mover bloco ${index + 1} para cima`} onClick={(event) => { event.stopPropagation(); onMove(index, -1) }}>↑</button>
          <button type="button" aria-label={`Mover bloco ${index + 1} para baixo`} onClick={(event) => { event.stopPropagation(); onMove(index, 1) }}>↓</button>
          <button type="button" aria-label={`Remover bloco ${index + 1}`} onClick={(event) => { event.stopPropagation(); onRemove(block.instanceId) }}>×</button>
        </div>
      </header>

      <div className="free-block-fields">
        {block.type === 'declare' && (
          <>
            <label className="free-field">
              <span>Tipo</span>
              <select value={block.variableType} onChange={(event) => onChange(block.instanceId, 'variableType', event.target.value)}>
                <option value="int">int · inteiro</option>
                <option value="float">float · real</option>
                <option value="double">double · real preciso</option>
                <option value="char">char · caractere</option>
                <option value="bool">bool · verdadeiro/falso</option>
                <option value="string">texto · char[100]</option>
              </select>
            </label>
            <TextField label="Nome" value={block.variable} placeholder="ex.: idade" onChange={(value) => onChange(block.instanceId, 'variable', value)} />
          </>
        )}

        {block.type === 'read' && (
          <TextField label="Variáveis (separe por espaço ou vírgula)" value={block.variables} placeholder="ex.: idade altura" onChange={(value) => onChange(block.instanceId, 'variables', value)} />
        )}

        {block.type === 'assign' && (
          <>
            <TextField label="Variável" value={block.variable} placeholder="ex.: resultado" onChange={(value) => onChange(block.instanceId, 'variable', value)} />
            {expression('expression', 'Recebe a expressão', 'ex.: salario * 5')}
          </>
        )}

        {(block.type === 'if' || block.type === 'else-if') && (
          expression('condition', 'Condição', 'ex.: idade < 18 && altura >= 1.80')
        )}

        {block.type === 'switch' && expression('expression', 'Valor para escolher', 'ex.: mes')}

        {block.type === 'case' && (
          <TextField label="Valor inteiro do caso" value={block.value} placeholder="ex.: 1" onChange={(value) => onChange(block.instanceId, 'value', value)} />
        )}

        {block.type === 'print-expression' && (
          expression('expression', 'Valor a imprimir', 'ex.: maior')
        )}

        {block.type === 'print-text' && (
          <TextField label="Texto (sem aspas)" value={block.text} placeholder="ex.: Aprovado" onChange={(value) => onChange(block.instanceId, 'text', value)} />
        )}

        {['else', 'end-if', 'default', 'break', 'end-switch'].includes(block.type) && (
          <span className="free-block-instruction">
            {block.type === 'end-if' || block.type === 'end-switch'
              ? 'Fecha o bloco de decisão correspondente.'
              : block.type === 'break'
                ? 'Encerra o caso atual de um bloco escolher.'
                : block.type === 'default'
                  ? 'Ramo usado quando nenhum caso corresponde.'
                  : 'Ramo alternativo para o bloco se mais próximo.'}
          </span>
        )}
      </div>
    </article>
  )
}

export function FreeBuilder({
  onModeChange,
  workspaceWidth,
  maxWorkspaceWidth,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onResizeKeyDown,
}) {
  const [exerciseId, setExerciseId] = useState(moduleThreeExercises[0].id)
  const [blocks, setBlocks] = useState([])
  const [paletteTab, setPaletteTab] = useState('data')
  const [rightTab, setRightTab] = useState('blocks')
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [editorMessage, setEditorMessage] = useState('')
  const expressionSelection = useRef(null)
  const expressionInputs = useRef({})
  const generated = useMemo(() => generateC(blocks), [blocks])
  const exercise = moduleThreeExercises.find((item) => item.id === exerciseId)

  const updateBlock = (instanceId, field, value) => {
    setBlocks((current) => current.map((block) => (
      block.instanceId === instanceId ? { ...block, [field]: value } : block
    )))
    setEditorMessage('')
  }

  const registerInput = (instanceId, field, element) => {
    const key = `${instanceId}:${field}`
    if (element) expressionInputs.current[key] = element
    else delete expressionInputs.current[key]
  }

  const trackSelection = (instanceId, field, input) => {
    expressionSelection.current = {
      instanceId,
      field,
      start: input.selectionStart ?? input.value.length,
      end: input.selectionEnd ?? input.value.length,
    }
  }

  const addBlock = (type) => {
    const block = createBlock(type)
    setBlocks((current) => [...current, block])
    setSelectedBlockId(block.instanceId)
    setEditorMessage('')
  }

  const removeBlock = (instanceId) => {
    setBlocks((current) => current.filter((block) => block.instanceId !== instanceId))
    setSelectedBlockId((current) => current === instanceId ? null : current)
  }

  const moveBlock = (index, direction) => {
    const destination = index + direction
    if (destination < 0 || destination >= blocks.length) return
    setBlocks((current) => {
      const reordered = [...current]
      const source = reordered[index]
      reordered[index] = reordered[destination]
      reordered[destination] = source
      return reordered
    })
  }

  const clearBlocks = () => {
    setBlocks([])
    setSelectedBlockId(null)
    setEditorMessage('')
    expressionSelection.current = null
  }

  const insertToken = (token) => {
    const selection = expressionSelection.current
    if (!selection) {
      setEditorMessage('Clique em um campo de expressão ou condição e escolha onde inserir o operador.')
      return
    }
    const block = blocks.find((item) => item.instanceId === selection.instanceId)
    if (!block) {
      setEditorMessage('O bloco da expressão não está mais na área de montagem.')
      return
    }
    const value = block[selection.field] ?? ''
    const updated = `${value.slice(0, selection.start)}${token}${value.slice(selection.end)}`
    const cursor = selection.start + token.length
    updateBlock(selection.instanceId, selection.field, updated)
    expressionSelection.current = { ...selection, start: cursor, end: cursor }
    window.requestAnimationFrame(() => {
      const input = expressionInputs.current[`${selection.instanceId}:${selection.field}`]
      if (!input) return
      input.focus()
      input.setSelectionRange(cursor, cursor)
    })
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('block-type')
    if (blockDefinitions[type]) addBlock(type)
  }

  const selectCodeBlock = (blockId) => {
    if (!blockId) return
    setSelectedBlockId(blockId)
  }

  const selectedTab = paletteTabs.find((tab) => tab.id === paletteTab)

  return (
    <section
      className="game-grid free-game-grid"
      style={{ '--workspace-width': `${workspaceWidth}px` }}
    >
      <aside className="mission-panel free-mission-panel">
        <ModeSwitch mode="free" onChange={onModeChange} />
        <div className="level-chip">MÓDULO 3 · LÓGICA</div>
        <h1>Montagem livre</h1>
        <p className="mission-subtitle">Escolha um exercício e construa o programa bloco por bloco.</p>

        <div className="exercise-card">
          <label className="free-field">
            <span>Exercício</span>
            <select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
              {moduleThreeExercises.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
            </select>
          </label>
          <p>{exercise.description}</p>
        </div>

        <div className="exercise-list" aria-label="Exercícios do módulo 3">
          {moduleThreeExercises.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === exerciseId ? 'active' : ''}
              onClick={() => setExerciseId(item.id)}
              aria-label={`Selecionar exercício ${item.id}: ${item.title}`}
            >
              {item.id}
            </button>
          ))}
        </div>
        <p className="paper-tip">Tente desenhar a sequência no papel antes de montar. O código C acompanha cada bloco.</p>
      </aside>

      <section className="workspace-panel free-workspace-panel">
        <div className="panel-header">
          <div>
            <span className="status-dot" />
            <strong>Programa em blocos</strong>
          </div>
          <button type="button" className="clear-button" onClick={clearBlocks}>Limpar</button>
        </div>

        <div
          className="workspace free-workspace"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="program-frame">int main(void) {'{'} ... return 0; {'}'}</div>
          {blocks.length === 0 ? (
            <div className="free-empty-state">
              <strong>Seu programa começa aqui</strong>
              <span>Escolha uma aba de blocos à direita e clique ou arraste uma peça.</span>
            </div>
          ) : (
            <div className="free-block-stack">
              {blocks.map((block, index) => (
                <FreeStatementBlock
                  key={block.instanceId}
                  block={block}
                  index={index}
                  depth={getBlockDepth(blocks, index)}
                  selected={block.instanceId === selectedBlockId}
                  onSelect={setSelectedBlockId}
                  onChange={updateBlock}
                  onMove={moveBlock}
                  onRemove={removeBlock}
                  registerInput={registerInput}
                  trackSelection={trackSelection}
                />
              ))}
            </div>
          )}
          {editorMessage && <div className="editor-message" role="status">{editorMessage}</div>}
        </div>
        <div className="free-editor-footer">
          <span>Expressões: selecione um campo e use a aba Operadores para montar a condição.</span>
          <button type="button" className="code-shortcut" onClick={() => setRightTab('code')}>Ver código C</button>
        </div>
      </section>

      <div
        className="layout-resizer"
        role="separator"
        aria-label="Redimensionar área de montagem e blocos"
        aria-orientation="vertical"
        aria-valuemin={260}
        aria-valuemax={maxWorkspaceWidth}
        aria-valuenow={Math.min(workspaceWidth, maxWorkspaceWidth)}
        aria-valuetext={`${workspaceWidth} pixels para a área de montagem`}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
        onKeyDown={onResizeKeyDown}
      >
        <span aria-hidden="true" />
      </div>

      <aside className="palette-panel free-palette-panel">
        <div className="free-right-tabs" role="tablist" aria-label="Painel lateral">
          <button type="button" role="tab" aria-selected={rightTab === 'blocks'} className={rightTab === 'blocks' ? 'active' : ''} onClick={() => setRightTab('blocks')}>Blocos</button>
          <button type="button" role="tab" aria-selected={rightTab === 'code'} className={rightTab === 'code' ? 'active' : ''} onClick={() => setRightTab('code')}>Código C</button>
        </div>

        {rightTab === 'blocks' ? (
          <>
            <div className="palette-title">
              <strong>{paletteTab === 'operators' ? 'Operadores' : 'Peças do programa'}</strong>
              <span>clique ou arraste</span>
            </div>
            <div className="free-palette-tabs" role="tablist" aria-label="Categorias de blocos">
              {paletteTabs.map((tab) => (
                <button type="button" role="tab" aria-selected={paletteTab === tab.id} className={paletteTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setPaletteTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {paletteTab === 'operators' ? (
              <div className="operator-library">
                {['Aritmética', 'Comparação', 'Lógica', 'Agrupamento'].map((group) => (
                  <section key={group}>
                    <h2>{group}</h2>
                    <div className="operator-grid">
                      {expressionTokens.filter((item) => item.group === group).map((item) => (
                        <button
                          type="button"
                          key={item.label}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => insertToken(item.token)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
                <p>Clique em um campo de expressão e posicione o cursor antes de escolher uma peça.</p>
              </div>
            ) : (
              <div className="free-palette-blocks">
                {selectedTab.blocks.map((type) => {
                  const definition = blockDefinitions[type]
                  return (
                    <button
                      type="button"
                      draggable
                      key={type}
                      className={`block block-${definition.category}`}
                      onDragStart={(event) => event.dataTransfer.setData('block-type', type)}
                      onClick={() => addBlock(type)}
                    >
                      <span className="block-icon">{definition.icon}</span>
                      <span>{definition.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="code-panel-content">
            <div className={`code-status ${generated.isValid ? 'valid' : 'invalid'}`}>
              {generated.isValid ? 'Código estruturado' : `${generated.diagnostics.length} ajuste(s) necessário(s)`}
            </div>
            {generated.diagnostics.length > 0 && (
              <div className="code-diagnostics" role="status">
                {generated.diagnostics.map((diagnostic, index) => (
                  <button type="button" key={`${diagnostic.blockId}-${index}`} onClick={() => selectCodeBlock(diagnostic.blockId)}>
                    Bloco {blocks.findIndex((block) => block.instanceId === diagnostic.blockId) + 1}: {diagnostic.message}
                  </button>
                ))}
              </div>
            )}
            <div className="generated-code" aria-label="Código C gerado">
              {generated.lines.map((line, index) => (
                <button
                  type="button"
                  className={`generated-line${line.blockId === selectedBlockId ? ' selected' : ''}`}
                  key={`${line.blockId ?? 'program'}-${index}`}
                  disabled={!line.blockId}
                  onClick={() => selectCodeBlock(line.blockId)}
                >
                  <span>{index + 1}</span>
                  <code>{line.text || ' '}</code>
                </button>
              ))}
            </div>
            <p className="code-note">Clique em uma linha para localizar o bloco correspondente. As expressões são geradas como C e precisam ser conferidas antes de compilar.</p>
          </div>
        )}
      </aside>
    </section>
  )
}

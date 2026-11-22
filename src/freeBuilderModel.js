export const moduleThreeExercises = [
  { id: '2.1', title: 'Maior e menor', description: 'Leia três valores e mostre o maior e o menor.' },
  { id: '2.2', title: 'Divisibilidade', description: 'Teste se um inteiro é divisível por 3 ou por 7, com e sem operadores lógicos.' },
  { id: '2.3', title: 'Financiamento', description: 'Conceda o financiamento se o pedido não ultrapassar cinco vezes o salário.' },
  { id: '2.4', title: 'Seleção de atleta', description: 'Selecione por altura mínima e idade máxima.' },
  { id: '2.5', title: 'Ano bissexto', description: 'Classifique o ano pelas regras de divisibilidade por 4, 100 e 400.' },
  { id: '2.6', title: 'Nome do mês', description: 'Converta um número de 1 a 12 em mês e trate entradas inválidas.' },
  { id: '2.7', title: 'Data válida', description: 'Valide dia, mês e ano, incluindo fevereiro em ano bissexto.' },
  { id: '2.8', title: 'Dia do ano', description: 'Calcule a posição de uma data no ano.' },
  { id: '2.9', title: 'Situação do aluno', description: 'Calcule média ponderada e classifique aprovação, prova final ou reprovação.' },
  { id: '2.10', title: 'Faixa de IMC', description: 'Calcule o IMC e informe sua faixa de risco.' },
  { id: '2.11', title: 'Triângulo possível', description: 'Verifique se três comprimentos podem formar um triângulo.' },
  { id: '2.12', title: 'Tipo de triângulo', description: 'Classifique os lados e verifique se o triângulo é retângulo.' },
  { id: '2.13', title: 'Intervalo entre horários', description: 'Ordene dois horários e calcule o intervalo entre eles.' },
]

export const paletteTabs = [
  { id: 'data', label: 'Dados', blocks: ['declare', 'assign'] },
  { id: 'input', label: 'Entrada', blocks: ['read'] },
  { id: 'operators', label: 'Operadores', blocks: [] },
  { id: 'control', label: 'Decisão', blocks: ['if', 'else-if', 'else', 'end-if', 'switch', 'case', 'default', 'break', 'end-switch'] },
  { id: 'output', label: 'Saída', blocks: ['print-expression', 'print-text'] },
]

export const blockDefinitions = {
  declare: { label: 'declarar variável', icon: '▣', category: 'data', defaults: { variableType: 'int', variable: 'n' } },
  assign: { label: 'atribuir valor', icon: '=', category: 'data', defaults: { variable: 'resultado', expression: '0' } },
  read: { label: 'ler entrada', icon: '⌨', category: 'input', defaults: { variables: 'n' } },
  if: { label: 'se condição', icon: '◆', category: 'control', defaults: { condition: 'n > 0' } },
  'else-if': { label: 'senão se condição', icon: '◆', category: 'control', defaults: { condition: 'n < 0' } },
  else: { label: 'senão', icon: '◆', category: 'control', defaults: {} },
  'end-if': { label: 'fim se', icon: '◇', category: 'control', defaults: {} },
  switch: { label: 'escolher valor', icon: '≡', category: 'control', defaults: { expression: 'n' } },
  case: { label: 'caso valor', icon: '▸', category: 'control', defaults: { value: '1' } },
  default: { label: 'caso padrão', icon: '◌', category: 'control', defaults: {} },
  break: { label: 'interromper caso', icon: '■', category: 'control', defaults: {} },
  'end-switch': { label: 'fim escolher', icon: '◇', category: 'control', defaults: {} },
  'print-expression': { label: 'imprimir valor', icon: '◉', category: 'output', defaults: { expression: 'n' } },
  'print-text': { label: 'imprimir texto', icon: '“', category: 'output', defaults: { text: 'Resultado:' } },
}

export const expressionTokens = [
  { label: '+', token: ' + ', group: 'Aritmética' },
  { label: '−', token: ' - ', group: 'Aritmética' },
  { label: '×', token: ' * ', group: 'Aritmética' },
  { label: '÷', token: ' / ', group: 'Aritmética' },
  { label: '%', token: ' % ', group: 'Aritmética' },
  { label: '==', token: ' == ', group: 'Comparação' },
  { label: '!=', token: ' != ', group: 'Comparação' },
  { label: '<', token: ' < ', group: 'Comparação' },
  { label: '<=', token: ' <= ', group: 'Comparação' },
  { label: '>', token: ' > ', group: 'Comparação' },
  { label: '>=', token: ' >= ', group: 'Comparação' },
  { label: '&&', token: ' && ', group: 'Lógica' },
  { label: '||', token: ' || ', group: 'Lógica' },
  { label: '!', token: '!', group: 'Lógica' },
  { label: '(', token: '(', group: 'Agrupamento' },
  { label: ')', token: ')', group: 'Agrupamento' },
]

let blockSequence = 0

export function createBlock(type) {
  const definition = blockDefinitions[type]
  if (!definition) throw new Error(`Tipo de bloco desconhecido: ${type}`)
  blockSequence += 1
  return {
    instanceId: `free-block-${Date.now()}-${blockSequence}`,
    type,
    ...definition.defaults,
  }
}

const cKeywords = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register',
  'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef',
  'union', 'unsigned', 'void', 'volatile', 'while',
])
const reservedIdentifiers = new Set(['bool', 'false', 'main', 'printf', 'scanf', 'true'])

function isIdentifier(value) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value)
    && !cKeywords.has(value)
    && !reservedIdentifiers.has(value)
}

function tokenizeExpression(expression) {
  const tokens = []
  const tokenPattern = /\s*(>=|<=|==|!=|&&|\|\||[A-Za-z_][A-Za-z0-9_]*|(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/%!<>])\s*/y
  let position = 0
  while (position < expression.length) {
    tokenPattern.lastIndex = position
    const match = tokenPattern.exec(expression)
    if (!match) return null
    tokens.push(match[1])
    position = tokenPattern.lastIndex
  }
  return tokens
}

function isValidExpression(tokens) {
  let position = 0
  const current = () => tokens[position]
  const accept = (operators) => {
    if (!operators.includes(current())) return false
    position += 1
    return true
  }
  const parsePrimary = () => {
    if (accept(['('])) {
      if (!parseOr() || !accept([')'])) return false
      return true
    }
    if (/^(?:[A-Za-z_][A-Za-z0-9_]*|(?:\d+(?:\.\d*)?|\.\d+))$/.test(current() || '')) {
      position += 1
      return true
    }
    return false
  }
  const parseUnary = () => {
    if (accept(['!', '+', '-'])) return parseUnary()
    return parsePrimary()
  }
  const parseBinary = (parseNext, operators) => () => {
    if (!parseNext()) return false
    while (accept(operators)) {
      if (!parseNext()) return false
    }
    return true
  }
  const parseMultiply = parseBinary(parseUnary, ['*', '/', '%'])
  const parseAdd = parseBinary(parseMultiply, ['+', '-'])
  const parseCompare = parseBinary(parseAdd, ['<', '<=', '>', '>='])
  const parseEquality = parseBinary(parseCompare, ['==', '!='])
  const parseAnd = parseBinary(parseEquality, ['&&'])
  const parseOr = parseBinary(parseAnd, ['||'])

  return parseOr() && position === tokens.length
}

function validateExpression(expression) {
  const value = expression.trim()
  if (!value) return 'Preencha a expressão.'
  if (/[;{}'"`\r\n]/.test(value)) return 'Use apenas operadores e valores no espaço de expressão.'
  const tokens = tokenizeExpression(value)
  if (!tokens) return 'A expressão contém um caractere que não é um operador ou valor reconhecido.'
  if (!isValidExpression(tokens)) return 'Confira a ordem dos operadores, dos valores e dos parênteses.'
  return null
}

function indent(depth) {
  return '    '.repeat(Math.max(0, depth))
}

function escapedCText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n')
}

function expressionType(expression, declarations) {
  const trimmed = expression.trim()
  if (declarations.has(trimmed)) return declarations.get(trimmed)
  return 'number'
}

export function generateC(blocks) {
  const lines = []
  const diagnostics = []
  const declarations = new Map()
  const contexts = []
  const declaredNames = new Set()
  const plannedTypes = new Map()
  const userNames = new Set()
  const temporaryNames = new Set()
  const booleanInputTemps = new Map()
  let depth = 1

  for (const block of blocks) {
    if (block.type === 'declare' && isIdentifier(block.variable) && !plannedTypes.has(block.variable)) {
      plannedTypes.set(block.variable, block.variableType)
      userNames.add(block.variable)
    }
  }
  for (const block of blocks) {
    if (block.type !== 'read') continue
    const variables = block.variables.split(/[,\s]+/).filter(Boolean)
    for (const variable of variables) {
      if (plannedTypes.get(variable) !== 'bool') continue
      let temporary = `input_${variable}`
      let suffix = 2
      while (userNames.has(temporary) || temporaryNames.has(temporary)) {
        temporary = `input_${variable}_${suffix}`
        suffix += 1
      }
      temporaryNames.add(temporary)
      booleanInputTemps.set(`${block.instanceId}:${variable}`, temporary)
    }
  }

  const addLine = (text, blockId = null) => lines.push({ text, blockId })
  const addDiagnostic = (block, message) => {
    diagnostics.push({ blockId: block.instanceId, message })
    addLine(`${indent(depth)}/* ${message} */`, block.instanceId)
  }
  const addExpressionError = (block, expression) => {
    const error = validateExpression(expression)
    if (error) {
      addDiagnostic(block, error)
      return true
    }
    const identifiers = expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []
    const unknown = identifiers.find((identifier) => (
      !declarations.has(identifier) && identifier !== 'true' && identifier !== 'false'
    ))
    if (unknown) {
      addDiagnostic(block, `Declare a variável "${unknown}" antes de usá-la.`)
      return true
    }
    return false
  }

  const needsBooleanHeader = blocks.some((block) => (
    block.variableType === 'bool'
    || /\b(?:true|false)\b/.test(block.condition || block.expression || '')
  ))
  addLine('#include <stdio.h>')
  if (needsBooleanHeader) addLine('#include <stdbool.h>')
  addLine('')
  addLine('int main(void)')
  addLine('{')
  for (const [key, temporary] of booleanInputTemps) {
    const [blockId] = key.split(':')
    addLine(`${indent(depth)}int ${temporary};`, blockId)
  }

  for (const block of blocks) {
    switch (block.type) {
      case 'declare': {
        const type = block.variableType
        if (!isIdentifier(block.variable)) {
          addDiagnostic(block, 'Use um nome de variável válido, sem espaços.')
          break
        }
        if (declaredNames.has(block.variable)) {
          addDiagnostic(block, `A variável "${block.variable}" já foi declarada.`)
          break
        }
        const declaration = type === 'string'
          ? `char ${block.variable}[100];`
          : `${type} ${block.variable};`
        addLine(`${indent(depth)}${declaration}`, block.instanceId)
        declaredNames.add(block.variable)
        declarations.set(block.variable, type)
        break
      }

      case 'read': {
        const variables = block.variables.split(/[,\s]+/).filter(Boolean)
        if (!variables.length) {
          addDiagnostic(block, 'Informe ao menos uma variável para ler.')
          break
        }
        if (variables.some((variable) => !isIdentifier(variable) || !declarations.has(variable))) {
          addDiagnostic(block, 'Declare cada variável antes de usá-la no bloco de entrada.')
          break
        }
        const formats = variables.map((variable) => {
          const type = declarations.get(variable)
          if (type === 'string') return '%99s'
          if (type === 'float') return '%f'
          if (type === 'double') return '%lf'
          if (type === 'char') return ' %c'
          return '%d'
        })
        const argumentsList = variables.map((variable) => (
          declarations.get(variable) === 'string'
            ? variable
            : `&${booleanInputTemps.get(`${block.instanceId}:${variable}`) ?? variable}`
        ))
        addLine(`${indent(depth)}scanf("${formats.join(' ')}", ${argumentsList.join(', ')});`, block.instanceId)
        for (const variable of variables) {
          const temporary = booleanInputTemps.get(`${block.instanceId}:${variable}`)
          if (temporary) addLine(`${indent(depth)}${variable} = (${temporary} != 0);`, block.instanceId)
        }
        break
      }

      case 'assign': {
        if (!isIdentifier(block.variable) || !declarations.has(block.variable)) {
          addDiagnostic(block, 'Declare a variável antes de atribuir um valor a ela.')
          break
        }
        if (declarations.get(block.variable) === 'string') {
          addDiagnostic(block, 'Use uma variável numérica ou char para atribuições nesta versão.')
          break
        }
        if (addExpressionError(block, block.expression)) break
        addLine(`${indent(depth)}${block.variable} = ${block.expression.trim()};`, block.instanceId)
        break
      }

      case 'print-expression': {
        if (addExpressionError(block, block.expression)) break
        const type = expressionType(block.expression, declarations)
        let output = `printf("%g\\n", (double)(${block.expression.trim()}));`
        if (type === 'int' || type === 'bool') output = `printf("%d\\n", ${block.expression.trim()});`
        if (type === 'char') output = `printf("%c\\n", ${block.expression.trim()});`
        if (type === 'string') output = `printf("%s\\n", ${block.expression.trim()});`
        addLine(`${indent(depth)}${output}`, block.instanceId)
        break
      }

      case 'print-text':
        addLine(`${indent(depth)}printf("%s\\n", "${escapedCText(block.text)}");`, block.instanceId)
        break

      case 'if': {
        if (addExpressionError(block, block.condition)) break
        addLine(`${indent(depth)}if (${block.condition.trim()}) {`, block.instanceId)
        contexts.push({ type: 'if', blockId: block.instanceId, hasElse: false })
        depth += 1
        break
      }

      case 'else-if': {
        const context = contexts[contexts.length - 1]
        if (!context || context.type !== 'if' || context.hasElse) {
          addDiagnostic(block, '“Senão se” precisa vir dentro de um “se” ainda aberto e antes de “senão”.')
          break
        }
        if (addExpressionError(block, block.condition)) break
        addLine(`${indent(depth - 1)}} else if (${block.condition.trim()}) {`, block.instanceId)
        break
      }

      case 'else': {
        const context = contexts[contexts.length - 1]
        if (!context || context.type !== 'if' || context.hasElse) {
          addDiagnostic(block, '“Senão” precisa vir dentro de um “se” ainda aberto e só pode aparecer uma vez.')
          break
        }
        context.hasElse = true
        addLine(`${indent(depth - 1)}} else {`, block.instanceId)
        break
      }

      case 'end-if': {
        const context = contexts[contexts.length - 1]
        if (!context || context.type !== 'if') {
          addDiagnostic(block, 'Não há um bloco “se” aberto para fechar.')
          break
        }
        contexts.pop()
        depth -= 1
        addLine(`${indent(depth)}}`, block.instanceId)
        break
      }

      case 'switch': {
        if (addExpressionError(block, block.expression)) break
        addLine(`${indent(depth)}switch (${block.expression.trim()}) {`, block.instanceId)
        contexts.push({ type: 'switch', blockId: block.instanceId, hasDefault: false, cases: new Set() })
        depth += 1
        break
      }

      case 'case': {
        const context = contexts[contexts.length - 1]
        if (!context || context.type !== 'switch') {
          addDiagnostic(block, '“Caso” precisa estar diretamente dentro de “escolher valor”.')
          break
        }
        if (!/^-?\d+$/.test(block.value.trim())) {
          addDiagnostic(block, 'Use um número inteiro no bloco “caso”.')
          break
        }
        if (context.cases.has(block.value.trim())) {
          addDiagnostic(block, `O caso "${block.value.trim()}" já existe neste bloco “escolher”.`)
          break
        }
        context.cases.add(block.value.trim())
        addLine(`${indent(depth - 1)}case ${block.value.trim()}:`, block.instanceId)
        break
      }

      case 'default': {
        const context = contexts[contexts.length - 1]
        if (!context || context.type !== 'switch' || context.hasDefault) {
          addDiagnostic(block, '“Caso padrão” precisa estar dentro de “escolher valor” e só pode aparecer uma vez.')
          break
        }
        context.hasDefault = true
        addLine(`${indent(depth - 1)}default:`, block.instanceId)
        break
      }

      case 'break': {
        if (!contexts.some((context) => context.type === 'switch')) {
          addDiagnostic(block, '“Interromper caso” só pode ser usado dentro de “escolher valor”.')
          break
        }
        addLine(`${indent(depth)}break;`, block.instanceId)
        break
      }

      case 'end-switch': {
        const context = contexts[contexts.length - 1]
        if (!context || context.type !== 'switch') {
          addDiagnostic(block, 'Não há um bloco “escolher valor” aberto para fechar.')
          break
        }
        contexts.pop()
        depth -= 1
        addLine(`${indent(depth)}}`, block.instanceId)
        break
      }

      default:
        addDiagnostic(block, 'Este bloco ainda não tem geração de C.')
    }
  }

  while (contexts.length) {
    const context = contexts.pop()
    depth -= 1
    const name = context.type === 'if' ? 'se' : 'escolher valor'
    const message = `Feche o bloco "${name}" com seu bloco de fim.`
    diagnostics.push({ blockId: context.blockId, message })
    addLine(`${indent(depth)}} /* ${message} */`, context.blockId)
  }

  addLine(`${indent(depth)}return 0;`)
  addLine('}')

  return { lines, diagnostics, isValid: diagnostics.length === 0 }
}

export function getBlockDepth(blocks, index) {
  let depth = 0
  for (let position = 0; position < index; position += 1) {
    const type = blocks[position].type
    if (type === 'if' || type === 'switch') depth += 1
    if ((type === 'end-if' || type === 'end-switch') && depth > 0) depth -= 1
  }
  return depth
}

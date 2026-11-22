import assert from 'node:assert/strict'
import test from 'node:test'
import { createBlock, generateC } from '../src/freeBuilderModel.js'

test('generates declarations, input, and nested conditional C', () => {
  const declaration = createBlock('declare')
  const input = createBlock('read')
  const decision = createBlock('if')
  const output = createBlock('print-text')
  const end = createBlock('end-if')
  declaration.variable = 'n'
  input.variables = 'n'
  decision.condition = 'n % 3 == 0 || n % 7 == 0'
  output.text = 'divisível'

  const result = generateC([declaration, input, decision, output, end])
  const code = result.lines.map((line) => line.text).join('\n')

  assert.equal(result.isValid, true)
  assert.match(code, /int n;/)
  assert.match(code, /scanf\("%d", &n\);/)
  assert.match(code, /if \(n % 3 == 0 \|\| n % 7 == 0\) \{/)
  assert.match(code, /printf\("%s\\n", "divisível"\);/)
})

test('generates switch cases and default branches', () => {
  const declaration = createBlock('declare')
  const choice = createBlock('switch')
  const caseBlock = createBlock('case')
  const output = createBlock('print-text')
  const breakBlock = createBlock('break')
  const defaultBlock = createBlock('default')
  const fallback = createBlock('print-text')
  const end = createBlock('end-switch')
  declaration.variable = 'mes'
  choice.expression = 'mes'
  caseBlock.value = '2'
  output.text = 'fevereiro'
  fallback.text = 'inválido'

  const result = generateC([declaration, choice, caseBlock, output, breakBlock, defaultBlock, fallback, end])
  const code = result.lines.map((line) => line.text).join('\n')

  assert.equal(result.isValid, true)
  assert.match(code, /switch \(mes\) \{/)
  assert.match(code, /case 2:/)
  assert.match(code, /default:/)
  assert.match(code, /break;/)
})

test('reads boolean variables through a safe integer temporary', () => {
  const declaration = createBlock('declare')
  const input = createBlock('read')
  declaration.variable = 'resultado'
  declaration.variableType = 'bool'
  input.variables = 'resultado'

  const result = generateC([declaration, input])
  const code = result.lines.map((line) => line.text).join('\n')

  assert.equal(result.isValid, true)
  assert.match(code, /#include <stdbool.h>/)
  assert.match(code, /int input_resultado;/)
  assert.match(code, /scanf\("%d", &input_resultado\);/)
  assert.match(code, /resultado = \(input_resultado != 0\);/)
})

test('prints percent signs as literal text', () => {
  const output = createBlock('print-text')
  output.text = 'IMC: 25%'

  const result = generateC([output])
  const code = result.lines.map((line) => line.text).join('\n')

  assert.match(code, /printf\("%s\\n", "IMC: 25%"\);/)
})

test('reports duplicate switch cases', () => {
  const declaration = createBlock('declare')
  const choice = createBlock('switch')
  const firstCase = createBlock('case')
  const secondCase = createBlock('case')
  const end = createBlock('end-switch')
  declaration.variable = 'mes'
  choice.expression = 'mes'
  firstCase.value = '2'
  secondCase.value = '2'

  const result = generateC([declaration, choice, firstCase, secondCase, end])

  assert.equal(result.isValid, false)
  assert.match(result.diagnostics[0].message, /caso "2" já existe/)
})

test('reports undeclared input variables and unclosed decisions', () => {
  const read = createBlock('read')
  read.variables = 'n'
  const missingVariable = generateC([read])

  const declaration = createBlock('declare')
  const decision = createBlock('if')
  declaration.variable = 'n'
  decision.condition = 'n > 0'
  const unclosedDecision = generateC([declaration, decision])

  assert.equal(missingVariable.isValid, false)
  assert.match(missingVariable.diagnostics[0].message, /Declare cada variável/)
  assert.equal(unclosedDecision.isValid, false)
  assert.match(unclosedDecision.diagnostics[0].message, /Feche o bloco "se"/)
  assert.ok(unclosedDecision.lines.some((line) => line.text.includes('Feche o bloco "se"')))
})

test('rejects invalid C expressions instead of silently generating them', () => {
  const declaration = createBlock('declare')
  const assignment = createBlock('assign')
  declaration.variable = 'resultado'
  assignment.variable = 'resultado'
  assignment.expression = 'n + 2; printf("oops")'

  const result = generateC([declaration, assignment])

  assert.equal(result.isValid, false)
  assert.match(result.diagnostics[0].message, /Use apenas operadores/)
})

test('reports undeclared names and malformed operator order', () => {
  const declaration = createBlock('declare')
  const decision = createBlock('if')
  declaration.variable = 'n'
  decision.condition = 'n > total'
  const unknownName = generateC([declaration, decision])
  decision.condition = 'n + * 2'
  const invalidOrder = generateC([declaration, decision])

  assert.equal(unknownName.isValid, false)
  assert.match(unknownName.diagnostics[0].message, /Declare a variável "total"/)
  assert.equal(invalidOrder.isValid, false)
  assert.match(invalidOrder.diagnostics[0].message, /ordem dos operadores/)
})

test('accepts arithmetic and compound conditions used by module 3 exercises', () => {
  const names = ['ano', 'dia', 'n', 'pedido', 'salario', 'altura', 'idade', 'a', 'b', 'c', 'media']
  const blocks = names.map((variable) => {
    const declaration = createBlock('declare')
    declaration.variable = variable
    declaration.variableType = variable === 'altura' || variable === 'salario' || variable === 'pedido' || variable === 'media'
      ? 'float'
      : 'int'
    return declaration
  })
  const average = createBlock('assign')
  average.variable = 'media'
  average.expression = '(a * 0.25) + (b * 0.25) + (c * 0.5)'
  blocks.push(average)

  const conditions = [
    'n % 3 == 0 || n % 7 == 0',
    'pedido <= salario * 5',
    'altura >= 1.80 && idade < 18',
    '(ano % 400 == 0) || (ano % 4 == 0 && ano % 100 != 0)',
    'dia >= 1 && dia <= 31',
    'a + b > c && a + c > b && b + c > a',
    'a * a + b * b == c * c',
  ]

  for (const condition of conditions) {
    const decision = createBlock('if')
    decision.condition = condition
    blocks.push(decision, createBlock('end-if'))
  }

  const result = generateC(blocks)

  assert.equal(result.isValid, true, result.diagnostics.map((item) => item.message).join('\n'))
})

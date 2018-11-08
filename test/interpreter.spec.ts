import {HandsOnEngine} from '../src'
import {cellError, ErrorType} from '../src/Cell'

describe('Interpreter', () => {
  let engine: HandsOnEngine

  beforeEach(() => {
    engine = new HandsOnEngine()
  })

  it('relative addressing formula', () => {
    engine.loadSheet([['42', '=A1']])

    expect(engine.getCellValue('B1')).toBe(42)
  })

  it('number literal', () => {
    engine.loadSheet([['3']])

    expect(engine.getCellValue('A1')).toBe(3)
  })

  it('negative number literal', () => {
    engine.loadSheet([['=-3']])

    expect(engine.getCellValue('A1')).toBe(-3)
  })

  it('negative number literal - non numeric value', () => {
    engine.loadSheet([["=-'foo'"]])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('string literals', () => {
    engine.loadSheet([
      ['www', '1www', 'www1'],
    ])

    expect(engine.getCellValue('A1')).toBe('www')
    expect(engine.getCellValue('B1')).toBe('1www')
    expect(engine.getCellValue('C1')).toBe('www1')
  })

  it('string literals in formula', () => {
    engine.loadSheet([
      ["='www'", "='1www'", "='www1'"],
    ])

    expect(engine.getCellValue('A1')).toBe('www')
    expect(engine.getCellValue('B1')).toBe('1www')
    expect(engine.getCellValue('C1')).toBe('www1')
  })

  it('plus operator', () => {
    engine.loadSheet([['3', '7', '=A1+B1']])

    expect(engine.getCellValue('C1')).toBe(10)
  })

  it('plus operator', () => {
    engine.loadSheet([['3', '=A1+42']])

    expect(engine.getCellValue('B1')).toBe(45)
  })

  it('plus operator - int + float', () => {
    engine.loadSheet([['2.0', '=A1 + 3.14']])

    expect(engine.getCellValue('B1')).toBeCloseTo(5.14)
  })

  it('plus operator - VALUE error on 1st operand', () => {
    engine.loadSheet([['www', '=A1+42']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('plus operator - VALUE error on 2nd operand', () => {
    engine.loadSheet([['www', '=42+A1']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('minus operator', () => {
    engine.loadSheet([['3', '=A1-43']])

    expect(engine.getCellValue('B1')).toBe(-40)
  })

  it('minus operator - VALUE error on 1st operand', () => {
    engine.loadSheet([['www', '=A1-42']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('minus operator - VALUE error on 2nd operand', () => {
    engine.loadSheet([['www', '=42-A1']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('times operator', () => {
    engine.loadSheet([['3', '=A1*6']])

    expect(engine.getCellValue('B1')).toBe(18)
  })

  it('times operator - VALUE error on 1st operand', () => {
    engine.loadSheet([['www', '=A1*42']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('times operator - VALUE error on 2nd operand', () => {
    engine.loadSheet([['www', '=42*A1']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('div operator - int result', () => {
    engine.loadSheet([['=10 / 2']])

    expect(engine.getCellValue('A1')).toEqual(5)
  })

  it('div operator - float result', () => {
    engine.loadSheet([['=5 / 2']])

    expect(engine.getCellValue('A1')).toEqual(2.5)
  })

  it('div operator - float arg and result', () => {
    engine.loadSheet([['=12 / 2.5']])

    expect(engine.getCellValue('A1')).toEqual(4.8)
  })

  it('div operator - DIV_ZERO error', () => {
    engine.loadSheet([['=42 / 0']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.DIV_BY_ZERO))
  })

  it('div operator - VALUE error on 1st operand', () => {
    engine.loadSheet([['www', '=A1 / 42']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('div operator - VALUE error on 2nd operand', () => {
    engine.loadSheet([['www', '=42 / A1']])

    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('procedures - SUM without args', () => {
    engine.loadSheet([['=SUM()']])

    expect(engine.getCellValue('A1')).toEqual(0)
  })

  it('procedures - SUM with args', () => {
    engine.loadSheet([['=SUM(1; B1)', '3.14']])

    expect(engine.getCellValue('A1')).toBeCloseTo(4.14)
  })

  it('procedures - SUM with range args', () => {
    engine.loadSheet([['1', '2', '5'],
                      ['3', '4', '=SUM(A1:B2)']])

    expect(engine.getCellValue('C2')).toBeCloseTo(10)
  })

  it('ranges - VALUE error when evaluating without context', () => {
    engine.loadSheet([['1'], ['2'], ['=A1:A2']])
    expect(engine.getCellValue('A3')).toEqual(cellError(ErrorType.VALUE))
  })

  it('procedures - SUM with bad args', () => {
    engine.loadSheet([['=SUM(B1)', 'asdf']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('ranges - SUM range with not numeric values', () => {
    engine.loadSheet([['1'], ['2'], ['foo'], ['=SUM(A1:A3)']])
    expect(engine.getCellValue('A4')).toEqual(cellError(ErrorType.VALUE))
  })

  it('procedures - not known procedure', () => {
    engine.loadSheet([['=FOO()']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NAME))
  })

  it('errors - parsing errors', () => {
    engine.loadSheet([['=A', '=A1C1', '=SUM(A)']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NAME))
    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.NAME))
    expect(engine.getCellValue('C1')).toEqual(cellError(ErrorType.NAME))
  })

  it('function TRUE', () => {
    engine.loadSheet([['=TRUE()']])

    expect(engine.getCellValue('A1')).toEqual(true)
  })

  it('function TRUE is 0-arity', () => {
    engine.loadSheet([['=TRUE(1)']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NA))
  })

  it('function FALSE', () => {
    engine.loadSheet([['=FALSE()']])

    expect(engine.getCellValue('A1')).toEqual(false)
  })

  it('function FALSE is 0-arity', () => {
    engine.loadSheet([['=FALSE(1)']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NA))
  })

  it('function ACOS happy path', () => {
    engine.loadSheet([['=ACOS(1)']])

    expect(engine.getCellValue('A1')).toEqual(0)
  })

  it('function ACOS when value not numeric', () => {
    engine.loadSheet([["=ACOS('foo')"]])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NUM))
  })

  it('function ACOS for 1 (edge)', () => {
    engine.loadSheet([['=ACOS(1)']])

    expect(engine.getCellValue('A1')).toEqual(0)
  })

  it('function ACOS for -1 (edge)', () => {
    engine.loadSheet([['=ACOS(-1)']])

    expect(engine.getCellValue('A1')).toEqual(Math.PI)
  })

  it('function ACOS when value too large', () => {
    engine.loadSheet([['=ACOS(1.1)']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NUM))
  })

  it('function ACOS when value too small', () => {
    engine.loadSheet([['=ACOS(-1.1)']])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NUM))
  })
})

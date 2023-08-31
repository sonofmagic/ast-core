/* eslint-disable no-eval */
import punycode from 'punycode/'
import { jsStringEscape } from '@/index'

describe('index', () => {
  it('basic use', () => {
    expect(jsStringEscape('"Hello World!"')).toBe('\\"Hello World!\\"')
  })

  it('invariants', () => {
    let allCharacters = ''
    let i
    // The Punycode.js version that ships with Node v0.8 won't create unmatched
    // surrogate halves, so let's use `String.fromCharCode` for BMP code points.
    for (i = 0; i <= 0x00_ff_ff; i++) {
      allCharacters += String.fromCodePoint(i)
    }
    // Generate strings based on astral code points. Trickier than it seems:
    // http://mathiasbynens.be/notes/javascript-encoding
    for (i = 0x01_00_00; i <= 0x10_ff_ff; i++) {
      allCharacters += punycode.ucs2.encode([i])
    }

    const escaped = jsStringEscape(allCharacters)

    expect(eval("'" + escaped + "'")).toBe(allCharacters)
    expect(eval('"' + escaped + '"')).toBe(allCharacters)
  })

  it('supports arbitrary objects', () => {
    expect(jsStringEscape(null)).toBe('null')
    expect(jsStringEscape(undefined)).toBe('undefined')
    expect(jsStringEscape(false)).toBe('false')
    expect(jsStringEscape(true)).toBe('true')
    expect(jsStringEscape(0)).toBe('0')
    expect(jsStringEscape({})).toBe('[object Object]')
    expect(jsStringEscape('')).toBe('')
  })
})

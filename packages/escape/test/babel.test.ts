/* eslint-disable no-useless-escape, prettier/prettier */
import fs from 'node:fs/promises'
import path from 'node:path'
import babel from '@babel/core'
import MagicString from 'magic-string'
import { jsStringEscape } from '@/index'

describe('babel', () => {
  it('escape', () => {
    const arr = ['"\'', '\"\'', "\"'", "\"\'"]
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      for (let j = i + 1; j < arr.length; j++) {
        const b = arr[j];
        // console.log(a, b)
        expect(a).toBe(b)
      }
    }
  })
  it('case0', async () => {
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/case0.js'), 'utf8')
    const s = new MagicString(code)
    await babel.transformAsync(code, {
      plugins: [
        {
          visitor: {
            StringLiteral(p) {
              if (p.node.start && p.node.end && p.node.start > -1 && p.node.end > -1) {
                const v = s.slice(p.node.start + 1, p.node.end - 1)
                expect(v).toBe('12\\n34')
                expect(p.node.value).toBe('12\n34')
                s.update(p.node.start + 1, p.node.end - 1, jsStringEscape(p.node.value))
              }
            },
            TemplateElement(p) {
              if (p.node.start && p.node.end && p.node.start > -1 && p.node.end > -1) {
                const v = s.slice(p.node.start, p.node.end)
                expect(v).toBe('12\\n34')
                expect(p.node.value.raw).toBe('12\\n34')
                s.update(p.node.start, p.node.end, v) // jsStringEscape(v))
              }
            }
          }
        }
      ]
    })
    const ms = s.toString()
    expect(ms).toMatchSnapshot()
    await fs.writeFile(path.resolve(__dirname, './fixtures/case0.out.js'), ms, 'utf8')
    expect(ms).toEqual(code)
  })

  it('case1', async () => {
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/case1.js'), 'utf8')
    const s = new MagicString(code)
    const result = ['\'1\'\\n\\t', '2\\n"34"']
    let idx = 0
    await babel.transformAsync(code, {
      plugins: [
        {
          visitor: {
            StringLiteral(p) {
              if (p.node.start && p.node.end && p.node.start > -1 && p.node.end > -1) {
                const v = s.slice(p.node.start + 1, p.node.end - 1)
                expect(v).toBe('\\\'"\\"12\\n34')
                expect(p.node.value).toBe('\'""12\n34')
                s.update(p.node.start + 1, p.node.end - 1, jsStringEscape(p.node.value))
              }
            },
            TemplateElement(p) {
              if (p.node.start && p.node.end && p.node.start > -1 && p.node.end > -1) {
                const v = s.slice(p.node.start, p.node.end)
                expect(v).toBe(result[idx])
                expect(p.node.value.raw).toBe(result[idx])
                s.update(p.node.start, p.node.end, v) // jsStringEscape(v))
                idx++
              }
            }
          }
        }
      ]
    })
    const ms = s.toString()
    expect(ms).toMatchSnapshot()
    await fs.writeFile(path.resolve(__dirname, './fixtures/case1.out.js'), ms, 'utf8')
    // expect(ms).toEqual(code)
    expect('\'"\"12\n34').toBe('\'\"\"12\n34')
  })

  it('case2', async () => {
    const inputPath = path.resolve(__dirname, './fixtures/case2.js')
    const code = await fs.readFile(inputPath, 'utf8')
    const s = new MagicString(code)
    await babel.transformAsync(code, {
      plugins: [
        {
          visitor: {
            StringLiteral(p) {
              if (p.node.start && p.node.end && p.node.start > -1 && p.node.end > -1) {
                // const v = s.slice(p.node.start + 1, p.node.end - 1)
               
                s.update(p.node.start + 1, p.node.end - 1, jsStringEscape(p.node.value))
              }
            },
            TemplateElement(p) {
              if (p.node.start && p.node.end && p.node.start > -1 && p.node.end > -1) {
                const v = s.slice(p.node.start, p.node.end)
                s.update(p.node.start, p.node.end, v) // jsStringEscape(v))
                
              }
            }
          }
        }
      ]
    })
    const ms = s.toString()
    const outputPath = path.resolve(__dirname, './fixtures/case2.out.js')
    await fs.writeFile(outputPath, ms, 'utf8')
    expect(require(inputPath)).toEqual(require(outputPath))
    // expect(ms).toEqual(code)
    // expect(ms).toBe(code)
  })
})

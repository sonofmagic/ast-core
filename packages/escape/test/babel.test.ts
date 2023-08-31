import fs from 'node:fs/promises'
import path from 'node:path'
import babel from '@babel/core'
import MagicString from 'magic-string'
import { jsStringEscape } from '@/index'

describe('babel', () => {
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
  })
})

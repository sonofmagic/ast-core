// 用来加 \, 这是因为 babel 和 magic string 配合使用导致的结果
export function jsStringEscape(str: unknown) {
  return ('' + str).replaceAll(/[\n\r"'\\\u2028\u2029]/g, (character) => {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case '"':
      case "'":
      case '\\': {
        return '\\' + character
      }
      // Four possible LineTerminator characters need to be escaped:
      case '\n': {
        return '\\n'
      }
      case '\r': {
        return '\\r'
      }
      case '\u2028': {
        return '\\u2028'
      }
      case '\u2029': {
        return '\\u2029'
      }
      default: {
        return character
      }
    }
  })
}

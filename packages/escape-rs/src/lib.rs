use regex::{Captures, Regex, Replacer};

struct CharReplacer;

pub fn replace_char(ch: char) -> String {
    match ch {
        '"' | '\'' | '\\' => {
            return String::from_iter(['\\', ch]);
        }
        '\n' => "\\n".to_string(),
        '\r' => "\\r".to_string(),
        '\u{2028}' => "\\u2028".to_string(),
        '\u{2029}' => "\\u2029".to_string(),
        _ => {
            return ch.to_string();
        }
    }
}

impl Replacer for CharReplacer {
    fn replace_append(&mut self, caps: &Captures<'_>, dst: &mut String) {
        let chars: Vec<char> = (&caps[0]).chars().collect();
        let sss = replace_char(chars[0]);
        dst.push_str(&sss);
    }
}

pub fn escape(js_str: &str) -> String {
    let regex = Regex::new(r#"[\n\r"'\\\u2028\u2029]"#).unwrap();
    let result = regex.replace_all(js_str, CharReplacer);
    result.into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works_case_0() {
        let result = escape("\"Hello World!\"");
        assert_eq!(result, "\\\"Hello World!\\\"");
    }
}

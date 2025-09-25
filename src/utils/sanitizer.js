const xss = require('xss');
const validator = require('validator');

// санитайзер для ответов
function sanitizeOutput(obj) {
  if (obj == null) return obj;
  if (typeof obj === 'string') return xss(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeOutput);
  if (typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      out[k] = sanitizeOutput(v);
    }
    return out;
  }
  return obj;
}

// санитайзер для входных строк
function sanitizeInputString(s) {
  if (typeof s !== 'string') return '';
  const trimmed = s.trim();
  return validator.escape(trimmed);
}

module.exports = { sanitizeOutput, sanitizeInputString };

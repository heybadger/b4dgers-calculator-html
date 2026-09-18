(function() {
    'use strict';
  
    const $ = id => document.getElementById(id);
    const STORAGE_KEYS = {
      theme: 'b4dgers_theme_dark',
      angle: 'b4dgers_angle_mode',
      memory: 'b4dgers_memory',
      history: 'b4dgers_history',
      gwaRows: 'b4dgers_gwa_rows',
      panel: 'b4dgers_panel',
      ans: 'b4dgers_ans'
    };
  
    function safeStorageGet(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch { return fallback; }
    }
    function safeStorageSet(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }
  
    let toastTimer = null;
    function showToast(msg) {
      const t = $('toast');
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
    }
  
    const themeCheckbox = $('themeCheckbox');
    const themeLabel = $('themeLabel');
  
    function applyTheme(dark) {
      document.body.classList.toggle('dark', dark);
      themeLabel.textContent = dark ? 'Dark' : 'Light';
      themeCheckbox.checked = dark;
      safeStorageSet(STORAGE_KEYS.theme, dark);
    }
    themeCheckbox.addEventListener('change', function() { applyTheme(this.checked); });
  
    const sciPanel = $('sciPanel');
    const gwaPanel = $('gwaPanel');
    const showSciBtn = $('showSciBtn');
    const showGwaBtn = $('showGwaBtn');
  
    function setActivePanel(panel) {
      if (panel === 'sci') {
        sciPanel.classList.add('active');
        gwaPanel.classList.remove('active');
        showSciBtn.classList.add('active');
        showGwaBtn.classList.remove('active');
      } else {
        gwaPanel.classList.add('active');
        sciPanel.classList.remove('active');
        showGwaBtn.classList.add('active');
        showSciBtn.classList.remove('active');
      }
      safeStorageSet(STORAGE_KEYS.panel, panel);
    }
    showSciBtn.addEventListener('click', () => setActivePanel('sci'));
    showGwaBtn.addEventListener('click', () => setActivePanel('gwa'));
  
    const MathParser = (function() {
      const FUNCTIONS = {
        sin: 'sin', cos: 'cos', tan: 'tan',
        asin: 'asin', acos: 'acos', atan: 'atan',
        log: 'log10', ln: 'ln', sqrt: 'sqrt',
        abs: 'abs'
      };
      const CONSTANTS = { pi: Math.PI, 'π': Math.PI, e: Math.E };
  
      function tokenize(input) {
        const tokens = [];
        let i = 0;
        while (i < input.length) {
          const ch = input[i];
          if (/\s/.test(ch)) { i++; continue; }
  
          if (/[0-9.]/.test(ch)) {
            let num = '';
            while (i < input.length && /[0-9.]/.test(input[i])) { num += input[i++]; }
            if (i < input.length && (input[i] === 'e' || input[i] === 'E')) {
              let j = i + 1;
              if (input[j] === '+' || input[j] === '-') j++;
              if (/[0-9]/.test(input[j] || '')) {
                num += input[i++];
                if (input[i] === '+' || input[i] === '-') num += input[i++];
                while (i < input.length && /[0-9]/.test(input[i])) num += input[i++];
              }
            }
            if (num === '.' || num === '') throw new Error('Invalid number');
            tokens.push({ type: 'num', value: parseFloat(num) });
            continue;
          }
  
          if (/[a-zA-Zπ]/.test(ch)) {
            let id = '';
            while (i < input.length && /[a-zA-Zπ]/.test(input[i])) { id += input[i++]; }
            const lower = id.toLowerCase();
            if (CONSTANTS.hasOwnProperty(lower)) {
              tokens.push({ type: 'num', value: CONSTANTS[lower] });
            } else if (FUNCTIONS.hasOwnProperty(lower)) {
              tokens.push({ type: 'func', value: FUNCTIONS[lower] });
            } else {
              throw new Error('Unknown identifier: ' + id);
            }
            continue;
          }
  
          if ('+-*/^%!()'.includes(ch)) {
            tokens.push({ type: 'op', value: ch });
            i++;
            continue;
          }
  
          throw new Error('Unexpected character: ' + ch);
        }
        return tokens;
      }
  
      const PRECEDENCE = {
        '+': 1, '-': 1,
        '*': 2, '/': 2, '%': 2,
        '^': 3,
        'u-': 4, 'u+': 4,
        '!': 5,
        'func': 6
      };
      const RIGHT_ASSOC = { '^': true, 'u-': true, 'u+': true };
  
      function toRPN(tokens) {
        const output = [];
        const stack = [];
        let prevType = null;
  
        for (let i = 0; i < tokens.length; i++) {
          const tok = tokens[i];
  
          if (tok.type === 'num') {
            output.push(tok);
          } else if (tok.type === 'func') {
            stack.push(tok);
          } else if (tok.type === 'op') {
            const op = tok.value;
  
            let isUnary = false;
            if ((op === '-' || op === '+') &&
                (prevType === null || prevType === 'op' || prevType === 'func')) {
              isUnary = true;
            }
  
            if (op === '!') {
              output.push({ type: 'op', value: '!' });
              prevType = 'op';
              continue;
            }
  
            if (isUnary) {
              while (stack.length) {
                const top = stack[stack.length - 1];
                if (top.type === 'func') break;
                if (top.type === 'op') {
                  const tp = PRECEDENCE[top.value] || 0;
                  const cp = PRECEDENCE['u' + op];
                  if (tp > cp || (tp === cp && !RIGHT_ASSOC[top.value])) {
                    output.push(stack.pop());
                    continue;
                  }
                }
                break;
              }
              stack.push({ type: 'op', value: 'u' + op });
            } else {
              while (stack.length) {
                const top = stack[stack.length - 1];
                if (top.type === 'op') {
                  const tp = PRECEDENCE[top.value] || 0;
                  const cp = PRECEDENCE[op];
                  if (tp > cp || (tp === cp && !RIGHT_ASSOC[op])) {
                    output.push(stack.pop());
                    continue;
                  }
                }
                break;
              }
              stack.push(tok);
            }
          } else if (tok.value === '(') {
            stack.push(tok);
          } else if (tok.value === ')') {
            let found = false;
            while (stack.length) {
              const top = stack.pop();
              if (top.value === '(') { found = true; break; }
              output.push(top);
            }
            if (!found) throw new Error('Mismatched parentheses');
            if (stack.length && stack[stack.length - 1].type === 'func') {
              output.push(stack.pop());
            }
          }
          prevType = tok.type === 'op' ? 'op' : tok.type;
        }
  
        while (stack.length) {
          const top = stack.pop();
          if (top.value === '(' || top.value === ')') throw new Error('Mismatched parentheses');
          output.push(top);
        }
        return output;
      }
  
      function factorial(n) {
        if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial needs non-negative integer');
        if (n > 170) return Infinity;
        let r = 1;
        for (let k = 2; k <= n; k++) r *= k;
        return r;
      }
  
      function evaluateRPN(rpn, angleMode) {
        const stack = [];
        const toRad = x => angleMode === 'deg' ? x * Math.PI / 180 : x;
        const fromRad = x => angleMode === 'deg' ? x * 180 / Math.PI : x;
  
        for (const tok of rpn) {
          if (tok.type === 'num') {
            stack.push(tok.value);
          } else if (tok.type === 'func') {
            if (!stack.length) throw new Error('Missing argument');
            const a = stack.pop();
            let r;
            switch (tok.value) {
              case 'sin': r = Math.sin(toRad(a)); break;
              case 'cos': r = Math.cos(toRad(a)); break;
              case 'tan': r = Math.tan(toRad(a)); break;
              case 'asin':
                if (a < -1 || a > 1) throw new Error('asin domain');
                r = fromRad(Math.asin(a)); break;
              case 'acos':
                if (a < -1 || a > 1) throw new Error('acos domain');
                r = fromRad(Math.acos(a)); break;
              case 'atan': r = fromRad(Math.atan(a)); break;
              case 'log10': r = Math.log10(a); break;
              case 'ln': r = Math.log(a); break;
              case 'sqrt':
                if (a < 0) throw new Error('sqrt of negative');
                r = Math.sqrt(a); break;
              case 'abs': r = Math.abs(a); break;
              default: throw new Error('Unknown function');
            }
            stack.push(r);
          } else if (tok.type === 'op') {
            const op = tok.value;
            if (op === 'u-') {
              if (!stack.length) throw new Error('Missing operand');
              stack.push(-stack.pop());
            } else if (op === 'u+') {
              continue;
            } else if (op === '!') {
              if (!stack.length) throw new Error('Missing operand');
              stack.push(factorial(stack.pop()));
            } else {
              if (stack.length < 2) throw new Error('Missing operand');
              const b = stack.pop();
              const a = stack.pop();
              let r;
              switch (op) {
                case '+': r = a + b; break;
                case '-': r = a - b; break;
                case '*': r = a * b; break;
                case '/':
                  if (b === 0) throw new Error('Division by zero');
                  r = a / b; break;
                case '%': r = a % b; break;
                case '^': r = Math.pow(a, b); break;
                default: throw new Error('Unknown op: ' + op);
              }
              stack.push(r);
            }
          }
        }
  
        if (stack.length !== 1) throw new Error('Invalid expression');
        const result = stack[0];
        if (!isFinite(result)) throw new Error('Result not finite');
        return result;
      }
  
      return {
        evaluate(input, angleMode = 'deg') {
          if (!input || !input.trim()) throw new Error('Empty expression');
          const tokens = tokenize(input);
          const rpn = toRPN(tokens);
          return evaluateRPN(rpn, angleMode);
        }
      };
    })();
  
    const sciResultEl = $('sciResult');
    const sciExpressionEl = $('sciExpression');
    const sciDisplayBox = $('sciDisplayBox');
    const memIndicator = $('memIndicator');
    const degBtn = $('degBtn');
    const radBtn = $('radBtn');
  
    let expression = '';
    let memory = safeStorageGet(STORAGE_KEYS.memory, 0);
    let angleMode = safeStorageGet(STORAGE_KEYS.angle, 'deg');
    let lastAnswer = safeStorageGet(STORAGE_KEYS.ans, 0);
    let history = safeStorageGet(STORAGE_KEYS.history, []);
  
    if (!Array.isArray(history)) history = [];
  
    function formatNumber(n) {
      if (typeof n !== 'number' || !isFinite(n)) return 'Error';
      if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
      let s = parseFloat(n.toPrecision(12)).toString();
      if (s.includes('e')) return s;
      return s;
    }
  
    function updateDisplay() {
      sciExpressionEl.textContent = expression || '';
      const trimmed = expression.trim();
      if (trimmed && /[0-9)]$/.test(trimmed)) {
        try {
          const val = MathParser.evaluate(trimmed, angleMode);
          sciResultEl.textContent = formatNumber(val);
          sciResultEl.style.color = '';
          return;
        } catch {}
      }
      sciResultEl.textContent = expression || '0';
      sciResultEl.style.color = '';
    }
  
    function showError() {
      sciDisplayBox.classList.add('shake');
      sciResultEl.style.color = '#b34141';
      setTimeout(() => sciDisplayBox.classList.remove('shake'), 400);
    }
  
    function updateMemIndicator() {
      if (memory !== 0) {
        memIndicator.classList.add('visible');
        memIndicator.textContent = 'M (' + formatNumber(memory) + ')';
      } else {
        memIndicator.classList.remove('visible');
      }
    }
  
    function persistHistory() {
      safeStorageSet(STORAGE_KEYS.history, history);
    }
  
    function renderHistory() {
      const box = $('historyBox');
      box.innerHTML = '';
      if (!history.length) {
        box.classList.add('empty');
        return;
      }
      box.classList.remove('empty');
  
      for (let idx = history.length - 1; idx >= 0; idx--) {
        const item = history[idx];
        const itemIndex = idx;
  
        const row = document.createElement('div');
        row.className = 'history-item';
  
        const content = document.createElement('div');
        content.className = 'hist-content';
        content.title = 'Click to reuse';
  
        const exprSpan = document.createElement('span');
        exprSpan.className = 'hist-expr';
        exprSpan.textContent = item.expr;
  
        const resSpan = document.createElement('span');
        resSpan.className = 'hist-result';
        if (item.error) resSpan.classList.add('error');
        resSpan.textContent = '= ' + item.result;
  
        content.appendChild(exprSpan);
        content.appendChild(resSpan);
  
        content.addEventListener('click', () => {
          if (!item.error) {
            expression = item.expr;
            updateDisplay();
          }
        });
  
        const removeBtn = document.createElement('button');
        removeBtn.className = 'hist-remove';
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.setAttribute('aria-label', 'remove this history entry');
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          history.splice(itemIndex, 1);
          persistHistory();
          renderHistory();
        });
  
        row.appendChild(content);
        row.appendChild(removeBtn);
        box.appendChild(row);
      }
    }
  
    function addHistory(expr, result, isError) {
      history.push({ expr, result: String(result), error: !!isError });
      if (history.length > 30) history.shift();
      persistHistory();
      renderHistory();
    }
  
    $('historyClear').addEventListener('click', () => {
      if (!history.length) return;
      history = [];
      persistHistory();
      renderHistory();
      showToast('History cleared');
    });
  
    function setAngleMode(mode) {
      angleMode = mode;
      degBtn.classList.toggle('active', mode === 'deg');
      radBtn.classList.toggle('active', mode === 'rad');
      safeStorageSet(STORAGE_KEYS.angle, mode);
      updateDisplay();
    }
    degBtn.addEventListener('click', () => setAngleMode('deg'));
    radBtn.addEventListener('click', () => setAngleMode('rad'));
  
    function insertText(txt) {
      expression += txt;
      updateDisplay();
    }
  
    function applyFunction(name) {
      switch (name) {
        case 'sin': insertText('sin('); break;
        case 'cos': insertText('cos('); break;
        case 'tan': insertText('tan('); break;
        case 'asin': insertText('asin('); break;
        case 'acos': insertText('acos('); break;
        case 'atan': insertText('atan('); break;
        case 'log': insertText('log('); break;
        case 'ln': insertText('ln('); break;
        case 'sqrt': insertText('sqrt('); break;
        case 'sqr': insertText('^2'); break;
        case 'cube': insertText('^3'); break;
        case 'pow': insertText('^'); break;
        case 'inv': insertText('^(-1)'); break;
        case 'fact': insertText('!'); break;
        case 'pi': insertText('π'); break;
        case 'e': insertText('e'); break;
        case 'percent': insertText('%'); break;
        case 'ans': insertText(formatNumber(lastAnswer)); break;
      }
    }
  
    function clearAll() {
      expression = '';
      updateDisplay();
    }
  
    function backspace() {
      if (expression.length > 0) {
        const fnMatch = expression.match(/(sin|cos|tan|asin|acos|atan|log|ln|sqrt)\($/);
        if (fnMatch) {
          expression = expression.slice(0, -fnMatch[0].length);
        } else {
          expression = expression.slice(0, -1);
        }
        updateDisplay();
      }
    }
  
    function negate() {
      if (!expression.trim()) {
        expression = '-';
      } else {
        expression = '-(' + expression + ')';
      }
      updateDisplay();
    }
  
    function calculate() {
      const expr = expression.trim();
      if (!expr) return;
      try {
        const val = MathParser.evaluate(expr, angleMode);
        const formatted = formatNumber(val);
        addHistory(expr, formatted, false);
        lastAnswer = val;
        safeStorageSet(STORAGE_KEYS.ans, lastAnswer);
        expression = formatted;
        updateDisplay();
      } catch (err) {
        sciResultEl.textContent = 'Error';
        sciResultEl.style.color = '#b34141';
        addHistory(expr, 'Error', true);
        showError();
      }
    }
  
    function memoryClear() {
      memory = 0;
      safeStorageSet(STORAGE_KEYS.memory, 0);
      updateMemIndicator();
      showToast('Memory cleared');
    }
    function memoryRecall() {
      expression += formatNumber(memory);
      updateDisplay();
    }
    function memoryAdd() {
      try {
        const val = expression.trim() ? MathParser.evaluate(expression, angleMode) : 0;
        memory += val;
        safeStorageSet(STORAGE_KEYS.memory, memory);
        updateMemIndicator();
        showToast('M+ = ' + formatNumber(memory));
      } catch { showToast('Invalid expression'); }
    }
    function memorySubtract() {
      try {
        const val = expression.trim() ? MathParser.evaluate(expression, angleMode) : 0;
        memory -= val;
        safeStorageSet(STORAGE_KEYS.memory, memory);
        updateMemIndicator();
        showToast('M− = ' + formatNumber(memory));
      } catch { showToast('Invalid expression'); }
    }
  
    document.querySelectorAll('.sci-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (!action) return;
        handleAction(action);
      });
    });
  
    function handleAction(action) {
      switch (action) {
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          insertText(action); break;
        case 'dot': insertText('.'); break;
        case 'add': insertText('+'); break;
        case 'sub': insertText('-'); break;
        case 'mul': insertText('*'); break;
        case 'div': insertText('/'); break;
        case 'lparen': insertText('('); break;
        case 'rparen': insertText(')'); break;
        case 'neg': negate(); break;
        case 'clear': clearAll(); break;
        case 'back': backspace(); break;
        case 'equal': calculate(); break;
        case 'mc': memoryClear(); break;
        case 'mr': memoryRecall(); break;
        case 'mplus': memoryAdd(); break;
        case 'mminus': memorySubtract(); break;
        default: applyFunction(action);
      }
    }
  
    document.addEventListener('keydown', (e) => {
      if (!sciPanel.classList.contains('active')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  
      const k = e.key;
      if (/^[0-9]$/.test(k)) { e.preventDefault(); insertText(k); }
      else if (k === '.') { e.preventDefault(); insertText('.'); }
      else if (k === '+') { e.preventDefault(); insertText('+'); }
      else if (k === '-') { e.preventDefault(); insertText('-'); }
      else if (k === '*') { e.preventDefault(); insertText('*'); }
      else if (k === '/') { e.preventDefault(); insertText('/'); }
      else if (k === '(') { e.preventDefault(); insertText('('); }
      else if (k === ')') { e.preventDefault(); insertText(')'); }
      else if (k === '^') { e.preventDefault(); insertText('^'); }
      else if (k === '%') { e.preventDefault(); insertText('%'); }
      else if (k === '!') { e.preventDefault(); insertText('!'); }
      else if (k === 'Enter' || k === '=') { e.preventDefault(); calculate(); }
      else if (k === 'Backspace') { e.preventDefault(); backspace(); }
      else if (k === 'Escape') { e.preventDefault(); clearAll(); }
    });
  
    const tbody = $('tableBody');
    const addBtn = $('addSubjectBtn');
    const calcBtn = $('calculateBtn');
    const clearBtn = $('clearBtn');
    const gwaNumber = $('gwaNumber');
    const honorBadge = $('honorBadge');
    const resultArea = $('resultArea');
    const totalSubjects = $('totalSubjects');
    const totalUnits = $('totalUnits');
    const totalWeighted = $('totalWeighted');
    const errorDisplay = $('errorDisplay');
  
    const GRADE_OPTIONS = ['1.00','1.25','1.50','1.75','2.00','2.25','2.50','2.75','3.00','5.00'];
  
    function createGradeSelect(selected = '1.00') {
      const select = document.createElement('select');
      select.className = 'grade-select';
      GRADE_OPTIONS.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        if (g === selected) opt.selected = true;
        select.appendChild(opt);
      });
      return select;
    }
  
    function createRow(subject = '', units = '3', grade = '1.00') {
      const tr = document.createElement('tr');
  
      const tdSub = document.createElement('td');
      const inpSub = document.createElement('input');
      inpSub.type = 'text';
      inpSub.className = 'subject-input';
      inpSub.placeholder = 'Subject';
      inpSub.value = subject;
      inpSub.setAttribute('list', 'subjectPresets');
      inpSub.addEventListener('input', saveGwaRows);
      tdSub.appendChild(inpSub);
      tr.appendChild(tdSub);
  
      const tdUnits = document.createElement('td');
      const inpUnits = document.createElement('input');
      inpUnits.type = 'number';
      inpUnits.className = 'unit-input';
      inpUnits.placeholder = '3';
      inpUnits.value = units;
      inpUnits.min = '0.5';
      inpUnits.step = '0.5';
      inpUnits.addEventListener('input', saveGwaRows);
      tdUnits.appendChild(inpUnits);
      tr.appendChild(tdUnits);
  
      const tdGrade = document.createElement('td');
      const selGrade = createGradeSelect(grade);
      selGrade.addEventListener('change', saveGwaRows);
      tdGrade.appendChild(selGrade);
      tr.appendChild(tdGrade);
  
      const tdAction = document.createElement('td');
      tdAction.className = 'action-cell';
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'delete subject');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = delBtn.closest('tr');
        if (tbody.children.length > 1) {
          row.remove();
          clearErrors();
          saveGwaRows();
        } else {
          row.querySelector('.subject-input').value = '';
          row.querySelector('.unit-input').value = '3';
          row.querySelector('.grade-select').value = '1.00';
          saveGwaRows();
        }
      });
      tdAction.appendChild(delBtn);
      tr.appendChild(tdAction);
  
      return tr;
    }
  
    function addSubjectRow(subject = '', units = '3', grade = '1.00', focus = false) {
      const row = createRow(subject, units, grade);
      tbody.appendChild(row);
      clearErrors();
      if (focus) row.querySelector('.subject-input').focus();
      saveGwaRows();
      return row;
    }
  
    function saveGwaRows() {
      const rows = [];
      tbody.querySelectorAll('tr').forEach(tr => {
        rows.push({
          subject: tr.querySelector('.subject-input').value,
          units: tr.querySelector('.unit-input').value,
          grade: tr.querySelector('.grade-select').value
        });
      });
      safeStorageSet(STORAGE_KEYS.gwaRows, rows);
    }
  
    function loadGwaRows() {
      const saved = safeStorageGet(STORAGE_KEYS.gwaRows, null);
      if (saved && Array.isArray(saved) && saved.length) {
        saved.forEach(r => addSubjectRow(r.subject, r.units, r.grade));
      } else {
        addSubjectRow('', '3', '1.00');
      }
    }
  
    function clearAllGwa() {
      tbody.innerHTML = '';
      addSubjectRow('', '3', '1.00');
      clearErrors();
      gwaNumber.textContent = '—';
      honorBadge.style.display = 'none';
      resultArea.className = 'result-area';
      totalSubjects.textContent = '0';
      totalUnits.textContent = '0';
      totalWeighted.textContent = '0';
      safeStorageSet(STORAGE_KEYS.gwaRows, []);
    }
  
    function showError(msg) {
      errorDisplay.style.display = 'inline-block';
      errorDisplay.textContent = msg;
    }
    function clearErrors() {
      errorDisplay.style.display = 'none';
      errorDisplay.textContent = '';
    }
  
    function calculateGWA() {
      clearErrors();
      const rows = tbody.querySelectorAll('tr');
      if (rows.length === 0) {
        showError('Please add at least one subject.');
        return;
      }
  
      let totalGradeUnits = 0;
      let totalUnitsSum = 0;
      let subjectCount = 0;
      let hasFailure = false;
  
      for (let row of rows) {
        const inpSub = row.querySelector('.subject-input');
        const inpUnits = row.querySelector('.unit-input');
        const selGrade = row.querySelector('.grade-select');
  
        const subjectName = inpSub.value.trim();
        const unitsVal = inpUnits.value.trim();
        const gradeVal = selGrade.value.trim();
  
        if (!subjectName && !unitsVal && gradeVal === '1.00') continue;
  
        if (!subjectName) {
          showError('Subject name cannot be empty.');
          inpSub.focus();
          return;
        }
        if (unitsVal === '') {
          showError('Units cannot be empty.');
          inpUnits.focus();
          return;
        }
        const unitsNum = parseFloat(unitsVal);
        if (isNaN(unitsNum) || unitsNum <= 0) {
          showError('Units must be a positive number (e.g. 3).');
          inpUnits.focus();
          return;
        }
        const gradeNum = parseFloat(gradeVal);
        if (isNaN(gradeNum) || gradeNum < 1.0 || gradeNum > 5.0) {
          showError('Grade must be between 1.00 and 5.00.');
          selGrade.focus();
          return;
        }
  
        if (gradeNum === 5.0) hasFailure = true;
  
        totalGradeUnits += gradeNum * unitsNum;
        totalUnitsSum += unitsNum;
        subjectCount++;
      }
  
      if (subjectCount === 0) {
        showError('Please add at least one subject with a name.');
        return;
      }
      if (totalUnitsSum === 0) {
        showError('Total units cannot be zero.');
        return;
      }
  
      const gwa = totalGradeUnits / totalUnitsSum;
      const rounded = gwa.toFixed(2);
      gwaNumber.textContent = rounded;
      totalSubjects.textContent = subjectCount;
      totalUnits.textContent = totalUnitsSum.toFixed(1);
      totalWeighted.textContent = totalGradeUnits.toFixed(2);
  
      resultArea.className = 'result-area';
      let badgeText = '', badgeClass = '';
      if (hasFailure || gwa > 3.00) {
        badgeClass = 'fail';
        badgeText = hasFailure ? 'FAILED' : 'Needs Improvement';
        resultArea.classList.add('honor-fail');
      } else if (gwa <= 1.20) {
        badgeClass = 'summa';
        badgeText = 'Summa Cum Laude';
        resultArea.classList.add('honor-summa');
      } else if (gwa <= 1.45) {
        badgeClass = 'magna';
        badgeText = 'Magna Cum Laude';
        resultArea.classList.add('honor-magna');
      } else if (gwa <= 1.75) {
        badgeClass = 'cum';
        badgeText = 'Cum Laude';
        resultArea.classList.add('honor-cum');
      } else if (gwa <= 3.00) {
        badgeClass = 'cum';
        badgeText = 'Passing';
        resultArea.classList.add('honor-cum');
      }
  
      honorBadge.textContent = badgeText;
      honorBadge.className = 'honor-badge ' + badgeClass;
      honorBadge.style.display = 'inline-block';
    }
  
    addBtn.addEventListener('click', () => addSubjectRow('', '3', '1.00', true));
    calcBtn.addEventListener('click', calculateGWA);
    clearBtn.addEventListener('click', clearAllGwa);
  
    gwaNumber.addEventListener('click', () => {
      if (gwaNumber.textContent && gwaNumber.textContent !== '—') {
        navigator.clipboard?.writeText(gwaNumber.textContent)
          .then(() => showToast('GWA copied!'))
          .catch(() => showToast('Copy failed'));
      }
    });
  
    document.addEventListener('keydown', (e) => {
      if (!gwaPanel.classList.contains('active')) return;
      if (e.key === 'Enter' && e.target.closest('.subject-table')) {
        e.preventDefault();
        calculateGWA();
      }
    });
  
    function init() {
      const dark = safeStorageGet(STORAGE_KEYS.theme, false);
      applyTheme(dark);
      setAngleMode(angleMode);
      updateMemIndicator();
      renderHistory();
      const panel = safeStorageGet(STORAGE_KEYS.panel, 'sci');
      setActivePanel(panel);
      loadGwaRows();
      updateDisplay();
    }
  
    init();
  })();
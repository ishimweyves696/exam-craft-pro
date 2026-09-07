import { Question, TableCell } from '../../types.js';
import { isCandidateAnswerCell, QuestionContractValidationIssue } from '../../types/questionContracts.js';

export function detectTableTemplate(q: Question): string {
  if (!q.tableData || !q.tableData.rows || q.tableData.rows.length === 0) {
    return 'invalid_table';
  }

  const text = (q.text || '').toLowerCase();
  const inst = (q.instruction || '').toLowerCase();
  const combined = `${inst} ${text}`;

  if (/\b(classify|categorize)\b/i.test(combined)) {
    return 'classification_table';
  }

  if (/\b(compare|differences|similarities)\b/i.test(combined)) {
    return 'comparison_table';
  }

  // Look at cell distribution
  const rows = q.tableData.rows;
  if (rows.length > 1) {
    let emptyColumns = 0;
    const colCount = rows[0].length;
    for (let c = 0; c < colCount; c++) {
      let allEmptyInCol = true;
      for (let r = 1; r < rows.length; r++) {
        if (!isCandidateAnswerCell(rows[r][c])) {
          allEmptyInCol = false;
          break;
        }
      }
      if (allEmptyInCol) emptyColumns++;
    }
    
    if (emptyColumns > 0 && emptyColumns < colCount) {
      return 'selected_columns';
    }

    let emptyRows = 0;
    for (let r = 1; r < rows.length; r++) {
      let allEmptyInRow = true;
      for (let c = 0; c < rows[r].length; c++) {
        if (!isCandidateAnswerCell(rows[r][c])) {
          allEmptyInRow = false;
          break;
        }
      }
      if (allEmptyInRow) emptyRows++;
    }
    
    if (emptyRows > 0) {
      return 'selected_rows';
    }
  }

  return 'partially_completed';
}

export function validateTableQuestionContract(
  q: Question,
  context?: { subjectName?: string }
): { issues: QuestionContractValidationIssue[] } {
  const issues: QuestionContractValidationIssue[] = [];
  const qType = q.type;

  if (!q.tableData || !Array.isArray(q.tableData.rows) || q.tableData.rows.length < 2) {
    issues.push({
      field: 'tableData',
      code: 'REQUIRED_MISSING',
      message: `Table question requires 'tableData' matrix with at least 2 rows.`,
      severity: 'Critical',
      autoFixable: false,
    });
  } else {
    // Table Completion Specific Contract
    const isCompletionTable = (qType as any) === 'table_completion' || qType === 'table' || (q.text && /complete|fill in|missing/i.test(q.text));
    if (isCompletionTable) {
      const rows = q.tableData.rows;
      let candidateCellsCount = 0;
      let hasHeader = rows[0] && rows[0].length > 0;

      const blankCellsSet = new Set<string>();
      if (q.tableData.blankCells) {
        q.tableData.blankCells.forEach(bc => blankCellsSet.add(`${bc.rowIndex}-${bc.colIndex}`));
      }

      // Validate header consistency
      const expectedCols = rows[0].length;
      for (let r = 1; r < rows.length; r++) {
        if (rows[r].length !== expectedCols) {
           issues.push({
             field: 'tableData',
             code: 'INVALID_STRUCTURE',
             message: `Table row ${r} has inconsistent column count (${rows[r].length} instead of ${expectedCols}).`,
             severity: 'High',
             autoFixable: false,
           });
        }
        for (let c = 0; c < rows[r].length; c++) {
          if (blankCellsSet.has(`${r}-${c}`) || isCandidateAnswerCell(rows[r][c])) {
            candidateCellsCount++;
          }
        }
      }

      if (candidateCellsCount === 0) {
        issues.push({
          field: 'tableData',
          code: 'REQUIRED_MISSING',
          message: `Table completion question contains 0 candidate-answer cells. At least 1 candidate response cell is required.`,
          severity: 'Critical',
          autoFixable: false,
        });
      }
    }
  }

  // Forbidden: options
  if (q.options && q.options.length > 0) {
    issues.push({
      field: 'options',
      code: 'FORBIDDEN_PRESENT',
      message: `Table question type must not contain 'options'.`,
      severity: 'High',
      autoFixable: true,
    });
  }

  return { issues };
}

export function sanitizeTableQuestion(
  q: Question,
  context?: { subjectName?: string; parentInstruction?: string }
): {
  sanitized: Question;
  repairLogs: any[];
  fixes: string[];
  isRejected: boolean;
  rejectionReason?: string;
} {
  const clone = JSON.parse(JSON.stringify(q)) as Question;
  const repairLogs: any[] = [];
  const fixes: string[] = [];

  // 1. Strip forbidden options
  if (clone.options) {
    repairLogs.push({
      questionId: clone.id,
      violatedRule: 'FORBIDDEN_PROPERTY',
      actionTaken: 'Stripped forbidden options from Table question',
      originalValue: clone.options,
      newValue: undefined,
    });
    fixes.push(`Stripped forbidden 'options' from Table Q${clone.number || ''}`);
    delete (clone as any).options;
  }

  // 2. Format statement text
  if (clone.text) {
    let newText = clone.text;
    newText = newText.replace(/^\s*Question\s*\d+:\s*/i, '');
    newText = newText.replace(/^\s*\(\s*[a-z]\s*\)\s*/i, '');
    newText = newText.replace(/^\s*\d+\.\s*/, '');
    
    if (newText.startsWith('**') && newText.endsWith('**') && newText.length > 4) {
      const inner = newText.slice(2, -2);
      if (!inner.includes('**')) {
        newText = inner;
      }
    }

    // Strip redundant instruction
    if (clone.instruction) {
      const instClean = clone.instruction.trim().toLowerCase();
      const textClean = newText.trim().toLowerCase();
      if (textClean.startsWith(instClean)) {
        clone.instruction = undefined;
        fixes.push('Removed redundant instruction that is duplicated in the stem');
      }
    }

    if (newText !== clone.text) {
      repairLogs.push({
        questionId: clone.id,
        violatedRule: 'INVALID_FORMATTING',
        actionTaken: 'Sanitized Table statement text (stripped prefixes/bolding)',
        originalValue: clone.text,
        newValue: newText,
      });
      clone.text = newText;
      fixes.push('Sanitized Table question text formatting');
    }
  }

  // 3. Ensure TableData semantics
  if (clone.tableData && clone.tableData.rows && clone.tableData.rows.length > 0) {
    const rows = clone.tableData.rows;
    const blankCellsSet = new Set<string>();
    
    if (clone.tableData.blankCells) {
      clone.tableData.blankCells.forEach((bc: any) => {
        blankCellsSet.add(`${bc.rowIndex}-${bc.colIndex}`);
      });
    }

    const semanticCells: TableCell[][] = [];
    const isCompletionTable = (clone as any).type === 'table_completion' || clone.type === 'table' || (clone.text && /complete|fill in|missing|completer|remplir|vuga/i.test(clone.text));

    // Header row
    semanticCells.push(rows[0].map(cell => ({
      text: cell,
      role: 'HEADER'
    })));

    let candidateCellsFound = 0;
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        if (blankCellsSet.has(`${r}-${c}`) || isCandidateAnswerCell(row[c])) {
          candidateCellsFound++;
        }
      }
    }

    // Heuristic: If completion table but no blanks found, AI likely forgot blankCells
    // We treat all body cells except the first column as candidate response areas
    const shouldApplyHeuristic = isCompletionTable && candidateCellsFound === 0 && rows.length > 1 && rows[0].length > 1;
    const newBlankCells: { rowIndex: number; colIndex: number }[] = clone.tableData.blankCells ? [...clone.tableData.blankCells] : [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const semanticRow: TableCell[] = [];
      for (let c = 0; c < row.length; c++) {
        const isExplicitBlank = blankCellsSet.has(`${r}-${c}`);
        const looksLikeBlank = isCandidateAnswerCell(row[c]);
        
        // Apply heuristic: if it's a completion table with NO blanks, blank everything except the first column
        // or cells that are clearly labels (short, starting with dash, etc).
        const heuristicBlank = shouldApplyHeuristic && c > 0;

        if (isExplicitBlank || looksLikeBlank || heuristicBlank) {
          // Record in blankCells array for downstream validation
          if (!newBlankCells.some(bc => bc.rowIndex === r && bc.colIndex === c)) {
            newBlankCells.push({ rowIndex: r, colIndex: c });
          }

          // If explicit blank or heuristic blank, the cell text IS the expected answer.
          // Otherwise, it might be a dotted line.
          const answer = (isExplicitBlank || heuristicBlank) ? row[c] : (
            row[c] && !/^[\._\-–—\s]*$/.test(row[c]) && !/\[blank\]/i.test(row[c]) && !/candidate_answer/i.test(row[c]) ? row[c] : undefined
          );
          
          semanticRow.push({
            text: '', // Candidate sees empty
            expectedAnswer: answer,
            role: 'CANDIDATE_RESPONSE'
          });
        } else {
          semanticRow.push({
            text: row[c],
            role: 'SUPPLIED_CONTENT'
          });
        }
      }
      semanticCells.push(semanticRow);
    }
    
    clone.tableData.blankCells = newBlankCells;
    clone.tableData.semanticCells = semanticCells;
    if (shouldApplyHeuristic) {
      fixes.push('Automatically blanked response columns in table (heuristic applied for completion task)');
    }
    fixes.push('Generated semantic cell roles for table');
  }

  return {
    sanitized: clone,
    repairLogs,
    fixes,
    isRejected: false,
  };
}

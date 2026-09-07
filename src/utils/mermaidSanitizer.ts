export function sanitizeMermaidData(code: string | undefined | null): string {
  if (!code) return '';
  let clean = code.trim();

  // 1. Ensure diagram directive is on its own line if node follows on the same line
  // e.g. "graph TD A[State 1]" -> "graph TD\nA[State 1]"
  clean = clean.replace(
    /^(graph\s+[A-Za-z]+|flowchart\s+[A-Za-z]+|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|quadrantChart|xychart-beta|C4Context)\s+([^\n;]+)/i,
    '$1\n$2'
  );

  // 2. Default to 'graph TD\n' if missing a diagram header directive
  if (
    !/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|quadrantChart|xychart-beta|C4Context)/i.test(
      clean
    )
  ) {
    clean = 'graph TD\n' + clean;
  }

  // 3. Fix unquoted bracket labels containing special characters (parentheses, colons, slashes, etc.)
  clean = clean.replace(/(\b[A-Za-z0-9_]+)\[\s*([^"\n\]]+?)\s*\]/g, (match, id, label) => {
    if (label.startsWith('"') && label.endsWith('"')) return match;
    if (/[\(\):\/&#$%<>,=\-+*]/.test(label)) {
      return `${id}["${label.replace(/"/g, "'")}"]`;
    }
    return match;
  });

  // 4. Fix unquoted parenthesis labels containing special characters
  clean = clean.replace(/(\b[A-Za-z0-9_]+)\(\s*([^"\n\)]+?)\s*\)/g, (match, id, label) => {
    if (label.startsWith('"') && label.endsWith('"')) return match;
    if (/[\(\):\/&#$%\[\]<>,=\-+*]/.test(label)) {
      return `${id}("${label.replace(/"/g, "'")}")`;
    }
    return match;
  });

  return clean;
}

import React, { useEffect, useRef, useState } from 'react';
import SmilesDrawer from 'smiles-drawer';
import { sanitizeMermaidData } from '../../utils/mermaidSanitizer';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

let mermaidInitialized = false;

export function DiagramViewer({ smilesData, mermaidData, svgData }: { smilesData?: string, mermaidData?: string, svgData?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mermaidSvg, setMermaidSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (smilesData && canvasRef.current) {
      try {
        let drawer = new SmilesDrawer.Drawer({ width: 320, height: 280 });
        SmilesDrawer.parse(smilesData, function(tree: any) {
          drawer.draw(tree, canvasRef.current!, 'light', false);
        }, function(err: any) {
          console.error("SmilesDrawer parse error:", err);
          setError("Failed to parse SMILES");
        });
      } catch(e) {
        console.error("SmilesDrawer error:", e);
      }
    }
  }, [smilesData]);

  useEffect(() => {
    if (mermaidData) {
      const renderMermaid = async () => {
        try {
          const mermaid = (await import('mermaid')).default;
          if (!mermaidInitialized) {
            mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
            mermaidInitialized = true;
          }
          const id = 'mermaid-' + Math.random().toString(36).substring(2, 9);
          const cleanData = sanitizeMermaidData(mermaidData);
          const { svg } = await mermaid.render(id, cleanData);
          setMermaidSvg(svg);
        } catch(e) {
          console.error("Mermaid error:", e);
          setError("Failed to render diagram");
        }
      };
      renderMermaid();
    }
  }, [mermaidData]);

  if (!smilesData && !mermaidData && !svgData) return null;

  return (
    <div className="examprint-diagram my-4 flex flex-col items-center justify-center break-inside-avoid">
      {smilesData && (
        <div className="border border-slate-200 bg-white p-2 rounded shadow-none max-w-full flex justify-center">
          <canvas ref={canvasRef} className="smiles-canvas" data-smiles={smilesData} />
        </div>
      )}
      
      {mermaidData && (
        <div className="mermaid-container print-mermaid-target border border-slate-200 bg-white p-3 rounded max-w-full overflow-x-auto flex justify-center" data-mermaid={mermaidData}>
          {mermaidSvg ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(mermaidSvg) }} />
          ) : (
            <div className="mermaid" style={{ display: 'none' }}>{mermaidData}</div>
          )}
        </div>
      )}

      {svgData && (
        <div 
          className="max-w-full overflow-x-auto flex justify-center py-2 border border-slate-200 bg-white p-2 rounded shadow-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(svgData) }} 
        />
      )}
      
      {error && <div className="text-red-500 text-sm hidden print:hidden">{error}</div>}
    </div>
  );
}

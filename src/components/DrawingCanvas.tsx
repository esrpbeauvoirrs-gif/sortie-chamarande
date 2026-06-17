import { useRef, useState, useCallback, useEffect } from 'react';
import { Eraser, Trash2, Download, Minus, Plus } from 'lucide-react';

const colors = [
  '#1a1a1a', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#3498db', '#9b59b6', '#e91e8f', '#795548', '#607d8b',
];

const brushSizes = [3, 6, 12, 20];

const drawingPrompts = [
  { emoji: '🏰', text: 'Dessine le château de Chamarande' },
  { emoji: '🌳', text: 'Dessine ton arbre préféré' },
  { emoji: '🌸', text: 'Dessine une fleur du domaine' },
  { emoji: '🦋', text: 'Dessine un animal que tu as vu' },
  { emoji: '☀️', text: 'Dessine le paysage' },
  { emoji: '👨‍👩‍👧‍👦', text: 'Dessine ta famille' },
];

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [activePrompt, setActivePrompt] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const drawLine = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, [selectedColor, brushSize, isEraser]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getCanvasCoords(e);
    lastPosRef.current = pos;
    setHasDrawn(true);
  }, [getCanvasCoords]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPosRef.current) return;
    const pos = getCanvasCoords(e);
    drawLine(lastPosRef.current, pos);
    lastPosRef.current = pos;
  }, [isDrawing, getCanvasCoords, drawLine]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mon-dessin-chamarande-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 text-white px-6 py-6">
        <div className="text-center">
          <span className="text-4xl block mb-2">🎨</span>
          <h2 className="text-2xl font-black">Atelier Dessin</h2>
          <p className="text-sm opacity-90 mt-1">Dessine ce qui t'inspire dans le domaine !</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Drawing Prompts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Inspiration</h4>
            <button
              onClick={() => setActivePrompt((activePrompt + 1) % drawingPrompts.length)}
              className="text-[10px] font-semibold text-forest-600 hover:text-forest-700"
            >
              Suivant →
            </button>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100">
            <p className="text-sm font-bold text-purple-800">
              {drawingPrompts[activePrompt].emoji} {drawingPrompts[activePrompt].text}
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="drawing-canvas w-full"
            style={{ height: '320px', touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-3">
          {/* Colors */}
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Couleurs</h4>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => { setSelectedColor(color); setIsEraser(false); }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color && !isEraser
                      ? 'border-gray-800 scale-110 shadow-md'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Taille du pinceau</h4>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setBrushSize(Math.max(1, brushSize - 2))}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Minus size={14} />
              </button>
              <div className="flex gap-1.5 flex-1 justify-center">
                {brushSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`rounded-full transition-all ${
                      brushSize === size ? 'bg-forest-500' : 'bg-gray-200'
                    }`}
                    style={{ width: `${size + 8}px`, height: `${size + 8}px` }}
                  />
                ))}
              </div>
              <button
                onClick={() => setBrushSize(Math.min(40, brushSize + 2))}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isEraser
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Eraser size={14} />
              Gomme
            </button>
            <button
              onClick={clearCanvas}
              className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 size={14} />
              Effacer
            </button>
            <button
              onClick={downloadCanvas}
              disabled={!hasDrawn}
              className="flex-1 py-2 rounded-xl bg-forest-500 text-white hover:bg-forest-600 disabled:bg-gray-200 disabled:text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download size={14} />
              Sauver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

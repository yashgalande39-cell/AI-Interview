import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../config';
import { 
  PenTool, Trash2, Download, Users, Copy, 
  Check, ArrowRightLeft, Square, Circle, Eraser
} from 'lucide-react';

export default function Whiteboard() {
  const { token, user } = useAuth();
  
  // Collaborative Room state
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [activePeers, setActivePeers] = useState(0);

  // Brush settings
  const [color, setColor] = useState('#a855f7'); // Violet brand color default
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush'); // 'brush', 'eraser'

  // Canvas details
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const socketRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const colors = [
    { name: 'Purple', value: '#a855f7' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'White', value: '#ffffff' }
  ];

  // Initialize Socket.IO connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
      console.log('🔌 Whiteboard linked to websocket relay server.');
    });

    socketRef.current.on('peer_joined', () => {
      setActivePeers(prev => prev + 1);
    });

    socketRef.current.on('draw_update', ({ drawData }) => {
      drawPeerPath(drawData);
    });

    socketRef.current.on('canvas_cleared', () => {
      clearLocalCanvas();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Initialize local HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Support standard 2x canvas resolution for crisp lines on high-dpi displays
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, [joined]); // Re-initialize when joining workspace

  // Draw incoming peer paths
  const drawPeerPath = (drawData) => {
    const context = contextRef.current;
    if (!context) return;

    context.beginPath();
    context.strokeStyle = drawData.tool === 'eraser' ? '#090d16' : drawData.color; // Eraser matches background color
    context.lineWidth = drawData.size;
    context.moveTo(drawData.x0, drawData.y0);
    context.lineTo(drawData.x1, drawData.y1);
    context.stroke();
    context.closePath();
  };

  const handleMouseDown = ({ nativeEvent }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse coordinates relative to canvas bounding box
    const rect = canvas.getBoundingClientRect();
    const x = nativeEvent.clientX - rect.left;
    const y = nativeEvent.clientY - rect.top;

    lastPosRef.current = { x, y };
    setIsDrawing(true);
  };

  const handleMouseMove = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = nativeEvent.clientX - rect.left;
    const y = nativeEvent.clientY - rect.top;

    const currentStroke = {
      x0: lastPosRef.current.x,
      y0: lastPosRef.current.y,
      x1: x,
      y1: y,
      color: color,
      size: brushSize,
      tool: tool
    };

    // Draw locally
    context.beginPath();
    context.strokeStyle = tool === 'eraser' ? '#090d16' : color;
    context.lineWidth = brushSize;
    context.moveTo(currentStroke.x0, currentStroke.y0);
    context.lineTo(currentStroke.x1, currentStroke.y1);
    context.stroke();
    context.closePath();

    // Broadcast path via Socket.IO if collaborative room is active
    if (joined && roomId) {
      socketRef.current.emit('draw_path', {
        roomId,
        drawData: currentStroke
      });
    }

    lastPosRef.current = { x, y };
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClearCanvas = () => {
    clearLocalCanvas();
    if (joined && roomId) {
      socketRef.current.emit('clear_canvas', roomId);
    }
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a dark themed background container for exporting
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportContext = exportCanvas.getContext('2d');

    // Fill dark background
    exportContext.fillStyle = '#090d16';
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // Draw canvas overlay
    exportContext.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `MockPrep_DesignBoard_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL();
    link.click();
  };

  // Collaborative Room actions
  const hostRoom = () => {
    const randomKey = 'BOARD-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    setRoomId(randomKey);
    setJoined(true);
    socketRef.current.emit('join_room', randomKey);
  };

  const joinRoom = () => {
    const key = inputRoomId.trim().toUpperCase();
    if (!key) {
      alert("Please enter a valid Board Room ID.");
      return;
    }
    setRoomId(key);
    setJoined(true);
    setActivePeers(1);
    socketRef.current.emit('join_room', key);
  };

  const copyRoomKey = () => {
    navigator.clipboard.writeText(roomId);
    alert("Board room key copied to clipboard!");
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-76px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            🎨 Collaborative Architectural Board
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Draw system architectures, wireframe mockups, and collaborate in real-time with peers during system design mock rounds.
          </p>
        </div>
        
        {/* Connection Widget */}
        {!joined ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={hostRoom}
              className="bg-glow-gradient px-5 py-3 rounded-xl text-xs font-bold text-white shadow shadow-violet-500/10 transition-all hover:scale-102"
            >
              Host Design Session
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Board ID..."
                value={inputRoomId}
                onChange={e => setInputRoomId(e.target.value)}
                className="px-4 py-2.5 bg-slate-950/80 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none w-32 focus:border-violet-500"
              />
              <button
                onClick={joinRoom}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200"
              >
                Join
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-900 px-4 py-2 rounded-2xl">
            <div className="text-left text-xs">
              <span className="text-slate-500 font-bold block">Board Session Key</span>
              <span 
                className="font-extrabold text-accentCyan flex items-center gap-1.5 cursor-pointer"
                onClick={copyRoomKey}
              >
                {roomId} <Copy className="w-3 h-3 text-slate-400" />
              </span>
            </div>
            <div className="h-8 w-px bg-slate-900"></div>
            <div className="text-right text-xs">
              <span className="text-slate-500 font-bold block">Connected Peers</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {activePeers} Online
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Brush Controls & Presets */}
        <div className="glass-panel rounded-3xl p-6 space-y-6 lg:col-span-1 h-fit bg-gradient-to-b from-slate-950/40 to-slate-900/10">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Design Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTool('brush')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 border text-xs font-semibold transition-all ${
                  tool === 'brush'
                    ? 'bg-violet-500/10 border-violet-500/25 text-violet-400'
                    : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PenTool className="w-4 h-4" /> Brush
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 border text-xs font-semibold transition-all ${
                  tool === 'eraser'
                    ? 'bg-violet-500/10 border-violet-500/25 text-violet-400'
                    : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eraser className="w-4 h-4" /> Eraser
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brush Sizing</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="2"
                max="20"
                value={brushSize}
                onChange={e => setBrushSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Fine (2px)</span>
                <span>Current: {brushSize}px</span>
                <span>Bold (20px)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Curated Palette</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => {
                    setColor(c.value);
                    setTool('brush');
                  }}
                  className={`w-full py-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-[10px] font-bold ${
                    color === c.value && tool === 'brush'
                      ? 'border-slate-300 ring-2 ring-violet-500/30'
                      : 'border-slate-900 bg-slate-950/80'
                  }`}
                >
                  <span 
                    className="w-4.5 h-4.5 rounded-full inline-block shadow-inner" 
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-slate-400 text-[9px]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-900"></div>

          <div className="space-y-3">
            <button
              onClick={handleClearCanvas}
              className="w-full py-3.5 rounded-xl bg-slate-950 border border-slate-900 hover:bg-rose-500/5 hover:border-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear Canvas
            </button>
            <button
              onClick={handleSaveImage}
              className="w-full py-3.5 rounded-xl bg-slate-950 border border-slate-900 hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:text-emerald-400 text-slate-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Canvas PNG
            </button>
          </div>
        </div>

        {/* Canvas Workspace Draw Box */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-2 bg-slate-950 border-slate-800/80 relative h-[500px]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full rounded-2xl cursor-crosshair bg-[#090d16] transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
}

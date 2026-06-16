// [src/components/FluidBackground/index.tsx]

"use client";

import { cn } from "@/lib/utils";
import { DotsSix, Eye, EyeSlash } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ShaderParams {
  u_seed: number;
  u_speed: number;
  u_scale: number;
  u_turbAmp: number;
  u_turbFreq: number;
  u_turbIter: number;
  u_waveFreq: number;
  u_distBias: number;
  u_jellify: number;
  u_ditherMode: number;
  u_dither: number;
  u_exposure: number;
  u_contrast: number;
  u_saturation: number;
}

interface ColorStop {
  r: number; // 0-1 linear
  g: number;
  b: number;
}

interface PanelPos {
  x: number;
  y: number;
}

// ─── Defaults (exact from Spector.js capture) ──────────────────────────────

const DEFAULT_PARAMS: ShaderParams = {
  u_seed: 648,
  u_speed: 0.28,
  u_scale: 0.42,
  u_turbAmp: 0.6,
  u_turbFreq: 0.1,
  u_turbIter: 7,
  u_waveFreq: 3.8,
  u_distBias: 0,
  u_jellify: 0,
  u_ditherMode: 2,
  u_dither: 0.05,
  u_exposure: 1.1,
  u_contrast: 1.1,
  u_saturation: 1.0,
};

// 6 active colors from Spector capture (linear float RGB)
const DEFAULT_COLORS: ColorStop[] = [
  { r: 0.902, g: 0.9333, b: 0.9961 }, // light periwinkle
  { r: 0.3412, g: 0.5294, b: 0.9686 }, // cobalt blue
  { r: 0.0, g: 0.1686, b: 0.5412 }, // dark navy
  { r: 0.0, g: 0.0, b: 0.0 }, // black
  { r: 0.0, g: 0.0, b: 0.0 }, // black
  { r: 0.0, g: 0.0, b: 0.0 }, // black
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function linearToHex(v: number): string {
  const c = Math.round(Math.min(1, Math.max(0, v)) * 255);
  return c.toString(16).padStart(2, "0");
}

function colorToHex(c: ColorStop): string {
  return `#${linearToHex(c.r)}${linearToHex(c.g)}${linearToHex(c.b)}`;
}

function hexToLinear(hex: string): ColorStop {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function buildColorData(colors: ColorStop[]): Float32Array {
  const data = new Float32Array(32); // 8 vec4s
  colors.forEach((c, i) => {
    data[i * 4 + 0] = c.r;
    data[i * 4 + 1] = c.g;
    data[i * 4 + 2] = c.b;
    data[i * 4 + 3] = 1.0;
  });
  return data;
}

// ─── Slider configs ──────────────────────────────────────────────────────────

interface SliderConfig {
  key: keyof ShaderParams;
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDER_CONFIGS: SliderConfig[] = [
  { key: "u_speed", label: "speed", min: 0, max: 2, step: 0.01 },
  { key: "u_scale", label: "scale", min: 0.1, max: 2, step: 0.01 },
  { key: "u_turbAmp", label: "turbAmp", min: 0, max: 2, step: 0.01 },
  { key: "u_turbFreq", label: "turbFreq", min: 0.01, max: 1, step: 0.01 },
  { key: "u_turbIter", label: "turbIter", min: 2, max: 12, step: 1 },
  { key: "u_waveFreq", label: "waveFreq", min: 0.5, max: 10, step: 0.1 },
  { key: "u_distBias", label: "distBias", min: -2, max: 2, step: 0.01 },
  { key: "u_ditherMode", label: "ditherMode", min: 0, max: 2, step: 1 },
  { key: "u_dither", label: "dither", min: 0, max: 0.2, step: 0.005 },
  { key: "u_exposure", label: "exposure", min: 0, max: 3, step: 0.05 },
  { key: "u_contrast", label: "contrast", min: 0.5, max: 3, step: 0.05 },
  { key: "u_saturation", label: "saturation", min: 0, max: 2, step: 0.05 },
  { key: "u_seed", label: "seed", min: 0, max: 1000, step: 1 },
  { key: "u_jellify", label: "jellify", min: 0, max: 1, step: 1 },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const paramsRef = useRef<ShaderParams>({ ...DEFAULT_PARAMS });
  const colorsRef = useRef<ColorStop[]>(DEFAULT_COLORS.map((c) => ({ ...c })));

  const [isReady, setIsReady] = useState<boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"params" | "colors">("params");
  const [params, setParams] = useState<ShaderParams>({ ...DEFAULT_PARAMS });
  const [colors, setColors] = useState<ColorStop[]>(
    DEFAULT_COLORS.map((c) => ({ ...c })),
  );
  // Drag position - null means "use fixed right-10 top-10 anchor"
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

  // ── Drag logic (pointer events on dots handle only) ──────────────────────
  const dragStateRef = useRef<{ active: boolean; ox: number; oy: number }>({
    active: false,
    ox: 0,
    oy: 0,
  });

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      // Compute current panel position from the element itself
      const rect = e.currentTarget
        .closest<HTMLElement>("[data-panel]")
        ?.getBoundingClientRect();
      const currentX = rect
        ? rect.left
        : (panelPos?.x ?? window.innerWidth - 278);
      const currentY = rect ? rect.top : (panelPos?.y ?? 0);
      dragStateRef.current = {
        active: true,
        ox: e.clientX - currentX,
        oy: e.clientY - currentY,
      };
    },
    [panelPos],
  );

  const onHeaderPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current.active) return;
      if (!(e.buttons & 1)) {
        dragStateRef.current.active = false;
        return;
      }
      setPanelPos({
        x: e.clientX - dragStateRef.current.ox,
        y: e.clientY - dragStateRef.current.oy,
      });
    },
    [],
  );

  const onHeaderPointerUp = useCallback(() => {
    dragStateRef.current.active = false;
  }, []);

  // ── GPU helpers ──────────────────────────────────────────────────────────
  const pushParam = useCallback((key: keyof ShaderParams, value: number) => {
    paramsRef.current = { ...paramsRef.current, [key]: value };
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;
    gl.useProgram(program);
    const loc = locsRef.current[key];
    if (loc !== null && loc !== undefined) gl.uniform1f(loc, value);
  }, []);

  const pushColors = useCallback((cols: ColorStop[]) => {
    colorsRef.current = cols;
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;
    gl.useProgram(program);
    const loc = locsRef.current["u_colors"];
    if (loc !== null && loc !== undefined) {
      gl.uniform4fv(loc, buildColorData(cols));
    }
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSlider = useCallback(
    (key: keyof ShaderParams, value: number) => {
      setParams((prev) => ({ ...prev, [key]: value }));
      pushParam(key, value);
    },
    [pushParam],
  );

  const handleColorChange = useCallback(
    (idx: number, hex: string) => {
      const next = colors.map((c, i) => (i === idx ? hexToLinear(hex) : c));
      setColors(next);
      pushColors(next);
    },
    [colors, pushColors],
  );

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    const resetColors = DEFAULT_COLORS.map((c) => ({ ...c }));
    setColors(resetColors);
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;
    gl.useProgram(program);
    (Object.keys(DEFAULT_PARAMS) as Array<keyof ShaderParams>).forEach(
      (key) => {
        const loc = locsRef.current[key];
        if (loc !== null && loc !== undefined)
          gl.uniform1f(loc, DEFAULT_PARAMS[key]);
      },
    );
    paramsRef.current = { ...DEFAULT_PARAMS };
    pushColors(resetColors);
  }, [pushColors]);

  // ── WebGL init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true });
    if (!gl) {
      console.error("WebGL 2 not supported.");
      return;
    }
    glRef.current = gl;

    function createShader(
      ctx: WebGL2RenderingContext,
      type: number,
      src: string,
    ): WebGLShader | null {
      const s = ctx.createShader(type);
      if (!s) return null;
      ctx.shaderSource(s, src);
      ctx.compileShader(s);
      if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) {
        console.error(ctx.getShaderInfoLog(s));
        ctx.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Geometry
    const posLoc = gl.getAttribLocation(program, "a_position");
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uvLoc = gl.getAttribLocation(program, "a_texCoord");
    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    // Cache uniform locations
    const locs: Record<string, WebGLUniformLocation | null> = {
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
      u_colors: gl.getUniformLocation(program, "u_colors"),
      u_colors_length: gl.getUniformLocation(program, "u_colors_length"),
      u_loop: gl.getUniformLocation(program, "u_loop"),
      u_seed: gl.getUniformLocation(program, "u_seed"),
      u_speed: gl.getUniformLocation(program, "u_speed"),
      u_scale: gl.getUniformLocation(program, "u_scale"),
      u_turbAmp: gl.getUniformLocation(program, "u_turbAmp"),
      u_turbFreq: gl.getUniformLocation(program, "u_turbFreq"),
      u_turbIter: gl.getUniformLocation(program, "u_turbIter"),
      u_waveFreq: gl.getUniformLocation(program, "u_waveFreq"),
      u_distBias: gl.getUniformLocation(program, "u_distBias"),
      u_jellify: gl.getUniformLocation(program, "u_jellify"),
      u_ditherMode: gl.getUniformLocation(program, "u_ditherMode"),
      u_dither: gl.getUniformLocation(program, "u_dither"),
      u_exposure: gl.getUniformLocation(program, "u_exposure"),
      u_contrast: gl.getUniformLocation(program, "u_contrast"),
      u_saturation: gl.getUniformLocation(program, "u_saturation"),
    };
    locsRef.current = locs;

    // Static uniforms
    gl.uniform1f(locs.u_pixelRatio, 1.0); // hardcoded - see comments
    gl.uniform1f(locs.u_loop, 0.0);

    // Adjustable params
    (Object.keys(DEFAULT_PARAMS) as Array<keyof ShaderParams>).forEach(
      (key) => {
        const loc = locs[key];
        if (loc !== null && loc !== undefined)
          gl.uniform1f(loc, DEFAULT_PARAMS[key]);
      },
    );

    // Colors
    gl.uniform1i(locs.u_colors_length, 6);
    gl.uniform4fv(locs.u_colors, buildColorData(DEFAULT_COLORS));

    const resizeCanvas = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(locs.u_resolution, w, h);
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const render = (): void => {
      if (!glRef.current) return;
      const ctx = glRef.current;
      ctx.uniform1f(locs.u_time, (Date.now() - startTimeRef.current) / 1000);
      ctx.clearColor(0, 0, 0, 1);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.drawArrays(ctx.TRIANGLES, 0, 6);
      animFrameRef.current = requestAnimationFrame(render);
    };
    render();
    setIsReady(true);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
      if (glRef.current && programRef.current)
        glRef.current.deleteProgram(programRef.current);
      glRef.current = null;
      programRef.current = null;
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  // Panel positioning: dragged position takes priority, else fixed right-10 top-10
  const panelStyle = panelPos
    ? {
        position: "fixed" as const,
        left: panelPos.x,
        top: panelPos.y,
        right: "auto",
      }
    : {};

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-black"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      {/* ── Debug Panel (draggable) ── */}
      <div
        data-panel
        style={panelStyle}
        className={cn(
          "z-[9999] w-[268px]",
          "bg-[rgba(14,14,18,0.94)] backdrop-blur-[16px]",
          "border border-white/[0.08] rounded-[10px]",
          "font-mono text-[11px] text-[#c8c8cc]",
          "select-none shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
          !panelPos && "fixed right-2 top-2",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-2 py-[9px] pl-[10px]",
            showPanel
              ? "border-b border-white/[0.07] rounded-t-[10px]"
              : "rounded-[10px]",
          )}
        >
          {/* Drag handle - ONLY this zone triggers drag */}
          <div
            onPointerDown={onHeaderPointerDown}
            onPointerMove={onHeaderPointerMove}
            onPointerUp={onHeaderPointerUp}
            title="Drag to move"
            className="grid grid-cols-3 grid-rows-2 gap-[3px] p-1 cursor-grab rounded shrink-0"
          >
            <DotsSix
              size={16}
              weight="bold"
              className="text-white/30 col-span-3 row-span-2"
            />
          </div>

          {/* Title */}
          <span className="flex-1 text-center text-[#5787f7] font-semibold tracking-[0.06em] text-[10px] uppercase">
            SHADER PARAMS
          </span>

          {/* Collapse toggle button */}
          <button
            onClick={() => setShowPanel((v) => !v)}
            title={showPanel ? "Collapse panel" : "Expand panel"}
            className={cn(
              "flex items-center justify-center shrink-0",
              "bg-transparent border-none p-[4px_5px] cursor-pointer",
              "text-[#444] text-xs leading-none rounded",
              "transition-colors duration-150 hover:text-[#aaa]",
            )}
          >
            {showPanel ? (
              <Eye size={14} weight="regular" />
            ) : (
              <EyeSlash size={14} weight="regular" />
            )}
          </button>
        </div>

        {showPanel && (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-white/[0.07]">
              {(["params", "colors"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-[6px]",
                    "bg-transparent border-none font-mono text-[10px] tracking-[0.06em] uppercase cursor-pointer",
                    "border-b-2 transition-colors duration-150",
                    activeTab === tab
                      ? "border-[#5787f7] text-[#5787f7]"
                      : "border-transparent text-[#555]",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Params tab ── */}
            {activeTab === "params" && (
              <div className="py-2 pb-2 max-h-[70vh] overflow-y-auto">
                {SLIDER_CONFIGS.map(({ key, label, min, max, step }) => {
                  const value = params[key];
                  return (
                    <div key={key} className="px-3 py-1">
                      <div className="flex justify-between mb-[3px]">
                        <span className="text-[#919195]">{label}</span>
                        <span className="text-[#e0e0e6] min-w-[36px] text-right">
                          {Number(value).toFixed(
                            step >= 1
                              ? 0
                              : step >= 0.1
                                ? 1
                                : step >= 0.01
                                  ? 2
                                  : 3,
                          )}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) =>
                          handleSlider(key, parseFloat(e.target.value))
                        }
                        className="w-full cursor-pointer h-[3px] accent-[#5787f7]"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Colors tab ── */}
            {activeTab === "colors" && (
              <div className="p-[10px_12px_12px]">
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((color, idx) => {
                    const hex = colorToHex(color);
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="text-[#555] text-[10px]">
                          color {idx + 1}
                        </span>
                        <label
                          className={cn(
                            "flex items-center gap-[6px]",
                            "bg-white/[0.04] border border-white/[0.08] rounded-md",
                            "px-2 py-[5px] cursor-pointer",
                          )}
                        >
                          {/* Color swatch */}
                          <div
                            className="w-[18px] h-[18px] rounded shrink-0 border border-white/15"
                            style={{ background: hex }}
                          />
                          <span className="text-[#919195] text-[10px] flex-1">
                            {hex.toUpperCase()}
                          </span>
                          <input
                            type="color"
                            value={hex}
                            onChange={(e) =>
                              handleColorChange(idx, e.target.value)
                            }
                            className="absolute opacity-0 w-0 h-0 pointer-events-none"
                          />
                        </label>
                        {/* Separate visible color input */}
                        <input
                          type="color"
                          value={hex}
                          onChange={(e) =>
                            handleColorChange(idx, e.target.value)
                          }
                          className="w-full h-6 border-none rounded cursor-pointer bg-transparent p-0"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset */}
            <div className="px-3 pb-[10px] pt-[2px]">
              <button
                onClick={handleReset}
                className={cn(
                  "w-full py-[5px]",
                  "bg-[rgba(87,135,247,0.1)] border border-[rgba(87,135,247,0.25)] rounded-[5px]",
                  "text-[#5787f7] text-[10px] cursor-pointer font-mono tracking-[0.06em]",
                  "transition-colors duration-150 hover:bg-[rgba(87,135,247,0.18)]",
                )}
              >
                reset to reference
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        input[type=range] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #5787f7;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(87,135,247,0.5);
        }
        input[type=range]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #5787f7;
          cursor: pointer;
          border: none;
        }
        input[type=color] {
          -webkit-appearance: none;
        }
        input[type=color]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type=color]::-webkit-color-swatch {
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}

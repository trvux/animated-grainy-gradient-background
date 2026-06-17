// // // [src/components/FluidBackground/index.tsx]

// // "use client";

// // import { Button } from "@/components/ui/button";
// // import { cn } from "@/lib/utils";
// // import { DotsSix, Eye, EyeSlash } from "@phosphor-icons/react";
// // import { motion } from "framer-motion";
// // import { useCallback, useEffect, useRef, useState } from "react";
// // import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

// // // ─── Types ─────────────────────────────────────────────────────────────────

// // interface ShaderParams {
// //   u_seed: number;
// //   u_speed: number;
// //   u_scale: number;
// //   u_turbAmp: number;
// //   u_turbFreq: number;
// //   u_turbIter: number;
// //   u_waveFreq: number;
// //   u_distBias: number;
// //   u_jellify: number;
// //   u_ditherMode: number;
// //   u_dither: number;
// //   u_exposure: number;
// //   u_contrast: number;
// //   u_saturation: number;
// // }

// // interface ColorStop {
// //   r: number; // 0-1 linear
// //   g: number;
// //   b: number;
// // }

// // interface PanelPos {
// //   x: number;
// //   y: number;
// // }

// // // ─── Defaults (exact from Spector.js capture) ──────────────────────────────

// // const DEFAULT_PARAMS: ShaderParams = {
// //   u_seed: 648,
// //   u_speed: 0.28,
// //   u_scale: 0.42,
// //   u_turbAmp: 0.6,
// //   u_turbFreq: 0.1,
// //   u_turbIter: 7,
// //   u_waveFreq: 3.8,
// //   u_distBias: 0,
// //   u_jellify: 0,
// //   u_ditherMode: 2,
// //   u_dither: 0.05,
// //   u_exposure: 1.1,
// //   u_contrast: 1.1,
// //   u_saturation: 1.0,
// // };

// // // 6 active colors from Spector capture (linear float RGB)
// // const DEFAULT_COLORS: ColorStop[] = [
// //   { r: 0.902, g: 0.9333, b: 0.9961 }, // light periwinkle
// //   { r: 0.3412, g: 0.5294, b: 0.9686 }, // cobalt blue
// //   { r: 0.0, g: 0.1686, b: 0.5412 }, // dark navy
// //   { r: 0.0, g: 0.0, b: 0.0 }, // black
// //   { r: 0.0, g: 0.0, b: 0.0 }, // black
// //   { r: 0.0, g: 0.0, b: 0.0 }, // black
// // ];

// // // ─── Helpers ────────────────────────────────────────────────────────────────

// // function linearToHex(v: number): string {
// //   const c = Math.round(Math.min(1, Math.max(0, v)) * 255);
// //   return c.toString(16).padStart(2, "0");
// // }

// // function colorToHex(c: ColorStop): string {
// //   return `#${linearToHex(c.r)}${linearToHex(c.g)}${linearToHex(c.b)}`;
// // }

// // function hexToLinear(hex: string): ColorStop {
// //   const h = hex.replace("#", "");
// //   return {
// //     r: parseInt(h.slice(0, 2), 16) / 255,
// //     g: parseInt(h.slice(2, 4), 16) / 255,
// //     b: parseInt(h.slice(4, 6), 16) / 255,
// //   };
// // }

// // function buildColorData(colors: ColorStop[]): Float32Array {
// //   const data = new Float32Array(32); // 8 vec4s
// //   colors.forEach((c, i) => {
// //     data[i * 4 + 0] = c.r;
// //     data[i * 4 + 1] = c.g;
// //     data[i * 4 + 2] = c.b;
// //     data[i * 4 + 3] = 1.0;
// //   });
// //   return data;
// // }

// // // ─── Slider configs ──────────────────────────────────────────────────────────

// // interface SliderConfig {
// //   key: keyof ShaderParams;
// //   label: string;
// //   min: number;
// //   max: number;
// //   step: number;
// // }

// // const SLIDER_CONFIGS: SliderConfig[] = [
// //   { key: "u_speed", label: "speed", min: 0, max: 2, step: 0.01 },
// //   { key: "u_scale", label: "scale", min: 0.1, max: 2, step: 0.01 },
// //   { key: "u_turbAmp", label: "turbAmp", min: 0, max: 2, step: 0.01 },
// //   { key: "u_turbFreq", label: "turbFreq", min: 0.01, max: 1, step: 0.01 },
// //   { key: "u_turbIter", label: "turbIter", min: 2, max: 12, step: 1 },
// //   { key: "u_waveFreq", label: "waveFreq", min: 0.5, max: 10, step: 0.1 },
// //   { key: "u_distBias", label: "distBias", min: -2, max: 2, step: 0.01 },
// //   { key: "u_ditherMode", label: "ditherMode", min: 0, max: 2, step: 1 },
// //   { key: "u_dither", label: "dither", min: 0, max: 0.2, step: 0.005 },
// //   { key: "u_exposure", label: "exposure", min: 0, max: 3, step: 0.05 },
// //   { key: "u_contrast", label: "contrast", min: 0.5, max: 3, step: 0.05 },
// //   { key: "u_saturation", label: "saturation", min: 0, max: 2, step: 0.05 },
// //   { key: "u_seed", label: "seed", min: 0, max: 1000, step: 1 },
// //   { key: "u_jellify", label: "jellify", min: 0, max: 1, step: 1 },
// // ];

// // // ─── Component ──────────────────────────────────────────────────────────────

// // export default function FluidBackground() {
// //   const canvasRef = useRef<HTMLCanvasElement>(null);
// //   const glRef = useRef<WebGL2RenderingContext | null>(null);
// //   const programRef = useRef<WebGLProgram | null>(null);
// //   const animFrameRef = useRef<number>(0);
// //   const startTimeRef = useRef<number>(Date.now());
// //   const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
// //   const paramsRef = useRef<ShaderParams>({ ...DEFAULT_PARAMS });
// //   const colorsRef = useRef<ColorStop[]>(DEFAULT_COLORS.map((c) => ({ ...c })));

// //   const [isReady, setIsReady] = useState<boolean>(false);
// //   const [showPanel, setShowPanel] = useState<boolean>(false);
// //   const [activeTab, setActiveTab] = useState<"params" | "colors">("params");
// //   const [params, setParams] = useState<ShaderParams>({ ...DEFAULT_PARAMS });
// //   const [colors, setColors] = useState<ColorStop[]>(
// //     DEFAULT_COLORS.map((c) => ({ ...c })),
// //   );
// //   // Drag position - null means "use fixed right-10 top-10 anchor"
// //   const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

// //   // ── Drag logic (pointer events on dots handle only) ──────────────────────
// //   const dragStateRef = useRef<{ active: boolean; ox: number; oy: number }>({
// //     active: false,
// //     ox: 0,
// //     oy: 0,
// //   });

// //   const onHeaderPointerDown = useCallback(
// //     (e: React.PointerEvent<HTMLDivElement>) => {
// //       if (e.button !== 0) return;
// //       e.preventDefault();
// //       e.currentTarget.setPointerCapture(e.pointerId);
// //       // Compute current panel position from the element itself
// //       const rect = e.currentTarget
// //         .closest<HTMLElement>("[data-panel]")
// //         ?.getBoundingClientRect();
// //       const currentX = rect
// //         ? rect.left
// //         : (panelPos?.x ?? window.innerWidth - 278);
// //       const currentY = rect ? rect.top : (panelPos?.y ?? 0);
// //       dragStateRef.current = {
// //         active: true,
// //         ox: e.clientX - currentX,
// //         oy: e.clientY - currentY,
// //       };
// //     },
// //     [panelPos],
// //   );

// //   const onHeaderPointerMove = useCallback(
// //     (e: React.PointerEvent<HTMLDivElement>) => {
// //       if (!dragStateRef.current.active) return;
// //       if (!(e.buttons & 1)) {
// //         dragStateRef.current.active = false;
// //         return;
// //       }
// //       setPanelPos({
// //         x: e.clientX - dragStateRef.current.ox,
// //         y: e.clientY - dragStateRef.current.oy,
// //       });
// //     },
// //     [],
// //   );

// //   const onHeaderPointerUp = useCallback(() => {
// //     dragStateRef.current.active = false;
// //   }, []);

// //   // ── GPU helpers ──────────────────────────────────────────────────────────
// //   const pushParam = useCallback((key: keyof ShaderParams, value: number) => {
// //     paramsRef.current = { ...paramsRef.current, [key]: value };
// //     const gl = glRef.current;
// //     const program = programRef.current;
// //     if (!gl || !program) return;
// //     gl.useProgram(program);
// //     const loc = locsRef.current[key];
// //     if (loc !== null && loc !== undefined) gl.uniform1f(loc, value);
// //   }, []);

// //   const pushColors = useCallback((cols: ColorStop[]) => {
// //     colorsRef.current = cols;
// //     const gl = glRef.current;
// //     const program = programRef.current;
// //     if (!gl || !program) return;
// //     gl.useProgram(program);
// //     const loc = locsRef.current["u_colors"];
// //     if (loc !== null && loc !== undefined) {
// //       gl.uniform4fv(loc, buildColorData(cols));
// //     }
// //   }, []);

// //   // ── Handlers ────────────────────────────────────────────────────────────
// //   const handleSlider = useCallback(
// //     (key: keyof ShaderParams, value: number) => {
// //       setParams((prev) => ({ ...prev, [key]: value }));
// //       pushParam(key, value);
// //     },
// //     [pushParam],
// //   );

// //   const handleColorChange = useCallback(
// //     (idx: number, hex: string) => {
// //       const next = colors.map((c, i) => (i === idx ? hexToLinear(hex) : c));
// //       setColors(next);
// //       pushColors(next);
// //     },
// //     [colors, pushColors],
// //   );

// //   const handleReset = useCallback(() => {
// //     setParams({ ...DEFAULT_PARAMS });
// //     const resetColors = DEFAULT_COLORS.map((c) => ({ ...c }));
// //     setColors(resetColors);
// //     const gl = glRef.current;
// //     const program = programRef.current;
// //     if (!gl || !program) return;
// //     gl.useProgram(program);
// //     (Object.keys(DEFAULT_PARAMS) as Array<keyof ShaderParams>).forEach(
// //       (key) => {
// //         const loc = locsRef.current[key];
// //         if (loc !== null && loc !== undefined)
// //           gl.uniform1f(loc, DEFAULT_PARAMS[key]);
// //       },
// //     );
// //     paramsRef.current = { ...DEFAULT_PARAMS };
// //     pushColors(resetColors);
// //   }, [pushColors]);

// //   // ── WebGL init ───────────────────────────────────────────────────────────
// //   useEffect(() => {
// //     const canvas = canvasRef.current;
// //     if (!canvas) return;

// //     const gl = canvas.getContext("webgl2", { alpha: true });
// //     if (!gl) {
// //       console.error("WebGL 2 not supported.");
// //       return;
// //     }
// //     glRef.current = gl;

// //     function createShader(
// //       ctx: WebGL2RenderingContext,
// //       type: number,
// //       src: string,
// //     ): WebGLShader | null {
// //       const s = ctx.createShader(type);
// //       if (!s) return null;
// //       ctx.shaderSource(s, src);
// //       ctx.compileShader(s);
// //       if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) {
// //         console.error(ctx.getShaderInfoLog(s));
// //         ctx.deleteShader(s);
// //         return null;
// //       }
// //       return s;
// //     }

// //     const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
// //     const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
// //     if (!vs || !fs) return;

// //     const program = gl.createProgram();
// //     if (!program) return;
// //     gl.attachShader(program, vs);
// //     gl.attachShader(program, fs);
// //     gl.linkProgram(program);
// //     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
// //       console.error(gl.getProgramInfoLog(program));
// //       return;
// //     }
// //     programRef.current = program;
// //     gl.useProgram(program);

// //     // Geometry
// //     const posLoc = gl.getAttribLocation(program, "a_position");
// //     const posBuf = gl.createBuffer();
// //     gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
// //     gl.bufferData(
// //       gl.ARRAY_BUFFER,
// //       new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
// //       gl.STATIC_DRAW,
// //     );
// //     gl.enableVertexAttribArray(posLoc);
// //     gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

// //     const uvLoc = gl.getAttribLocation(program, "a_texCoord");
// //     const uvBuf = gl.createBuffer();
// //     gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
// //     gl.bufferData(
// //       gl.ARRAY_BUFFER,
// //       new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
// //       gl.STATIC_DRAW,
// //     );
// //     gl.enableVertexAttribArray(uvLoc);
// //     gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

// //     // Cache uniform locations
// //     const locs: Record<string, WebGLUniformLocation | null> = {
// //       u_resolution: gl.getUniformLocation(program, "u_resolution"),
// //       u_time: gl.getUniformLocation(program, "u_time"),
// //       u_pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
// //       u_colors: gl.getUniformLocation(program, "u_colors"),
// //       u_colors_length: gl.getUniformLocation(program, "u_colors_length"),
// //       u_loop: gl.getUniformLocation(program, "u_loop"),
// //       u_seed: gl.getUniformLocation(program, "u_seed"),
// //       u_speed: gl.getUniformLocation(program, "u_speed"),
// //       u_scale: gl.getUniformLocation(program, "u_scale"),
// //       u_turbAmp: gl.getUniformLocation(program, "u_turbAmp"),
// //       u_turbFreq: gl.getUniformLocation(program, "u_turbFreq"),
// //       u_turbIter: gl.getUniformLocation(program, "u_turbIter"),
// //       u_waveFreq: gl.getUniformLocation(program, "u_waveFreq"),
// //       u_distBias: gl.getUniformLocation(program, "u_distBias"),
// //       u_jellify: gl.getUniformLocation(program, "u_jellify"),
// //       u_ditherMode: gl.getUniformLocation(program, "u_ditherMode"),
// //       u_dither: gl.getUniformLocation(program, "u_dither"),
// //       u_exposure: gl.getUniformLocation(program, "u_exposure"),
// //       u_contrast: gl.getUniformLocation(program, "u_contrast"),
// //       u_saturation: gl.getUniformLocation(program, "u_saturation"),
// //     };
// //     locsRef.current = locs;

// //     // Static uniforms
// //     gl.uniform1f(locs.u_pixelRatio, 1.0); // hardcoded - see comments
// //     gl.uniform1f(locs.u_loop, 0.0);

// //     // Adjustable params
// //     (Object.keys(DEFAULT_PARAMS) as Array<keyof ShaderParams>).forEach(
// //       (key) => {
// //         const loc = locs[key];
// //         if (loc !== null && loc !== undefined)
// //           gl.uniform1f(loc, DEFAULT_PARAMS[key]);
// //       },
// //     );

// //     // Colors
// //     gl.uniform1i(locs.u_colors_length, 6);
// //     gl.uniform4fv(locs.u_colors, buildColorData(DEFAULT_COLORS));

// //     const resizeCanvas = (): void => {
// //       const w = window.innerWidth;
// //       const h = window.innerHeight;
// //       if (canvas.width !== w || canvas.height !== h) {
// //         canvas.width = w;
// //         canvas.height = h;
// //         gl.viewport(0, 0, w, h);
// //         gl.uniform2f(locs.u_resolution, w, h);
// //       }
// //     };
// //     window.addEventListener("resize", resizeCanvas);
// //     resizeCanvas();

// //     const render = (): void => {
// //       if (!glRef.current) return;
// //       const ctx = glRef.current;
// //       ctx.uniform1f(locs.u_time, (Date.now() - startTimeRef.current) / 1000);
// //       ctx.clearColor(0, 0, 0, 1);
// //       ctx.clear(ctx.COLOR_BUFFER_BIT);
// //       ctx.drawArrays(ctx.TRIANGLES, 0, 6);
// //       animFrameRef.current = requestAnimationFrame(render);
// //     };
// //     render();
// //     setIsReady(true);

// //     return () => {
// //       cancelAnimationFrame(animFrameRef.current);
// //       window.removeEventListener("resize", resizeCanvas);
// //       if (glRef.current && programRef.current)
// //         glRef.current.deleteProgram(programRef.current);
// //       glRef.current = null;
// //       programRef.current = null;
// //     };
// //   }, []);

// //   // ── Render ───────────────────────────────────────────────────────────────

// //   // Panel positioning: dragged position takes priority, else fixed right-10 top-10
// //   const panelStyle = panelPos
// //     ? {
// //         position: "fixed" as const,
// //         left: panelPos.x,
// //         top: panelPos.y,
// //         right: "auto",
// //       }
// //     : {};

// //   return (
// //     <>
// //       <motion.div
// //         initial={{ opacity: 0 }}
// //         animate={isReady ? { opacity: 1 } : { opacity: 0 }}
// //         transition={{ duration: 1.5, ease: "easeInOut" }}
// //         className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-black"
// //       >
// //         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
// //         <div className="absolute inset-0 bg-black/30" />
// //       </motion.div>

// //       {/* ── Debug Panel (draggable) ── */}
// //       <div
// //         data-panel
// //         style={panelStyle}
// //         className={cn(
// //           "dark z-9999 w-67",
// //           "bg-[rgba(14,14,18,0.94)] backdrop-blur-lg",
// //           "border border-white/8 rounded-lg",
// //           "font-mono text-xs text-foreground",
// //           "select-none shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
// //           !panelPos && "fixed right-2 top-2",
// //         )}
// //       >
// //         {/* Header */}
// //         <div
// //           className={cn(
// //             "flex items-center justify-between px-2 py-2.25 pl-2.5",
// //             showPanel ? "border-b border-border rounded-t-lg" : "rounded-lg",
// //           )}
// //         >
// //           {/* Drag handle - ONLY this zone triggers drag */}
// //           <div
// //             onPointerDown={onHeaderPointerDown}
// //             onPointerMove={onHeaderPointerMove}
// //             onPointerUp={onHeaderPointerUp}
// //             title="Drag to move"
// //             className="grid grid-cols-3 grid-rows-2 gap-0.75 p-1 cursor-grab rounded shrink-0"
// //           >
// //             <DotsSix
// //               size={16}
// //               weight="bold"
// //               className="text-foreground hover:text-foreground/70 col-span-3 row-span-2"
// //             />
// //           </div>

// //           {/* Title */}
// //           <span className="flex-1 text-center text-foreground font-semibold tracking-wide text-xs uppercase">
// //             SHADER PARAMS
// //           </span>

// //           {/* Collapse toggle button */}
// //           <button
// //             onClick={() => setShowPanel((v) => !v)}
// //             title={showPanel ? "Collapse panel" : "Expand panel"}
// //             className={cn(
// //               "flex items-center justify-center shrink-0",
// //               "bg-transparent border-none p-[4px_5px] cursor-pointer",
// //               "text-foreground text-xs leading-none rounded",
// //               "transition-colors duration-150 hover:text-foreground/70",
// //             )}
// //           >
// //             {showPanel ? (
// //               <Eye size={14} weight="regular" />
// //             ) : (
// //               <EyeSlash size={14} weight="regular" />
// //             )}
// //           </button>
// //         </div>

// //         {showPanel && (
// //           <div>
// //             {/* Tabs */}
// //             <div className="flex border-b border-border">
// //               {(["params", "colors"] as const).map((tab) => (
// //                 <button
// //                   key={tab}
// //                   onClick={() => setActiveTab(tab)}
// //                   className={cn(
// //                     "flex-1 py-1.5",
// //                     "bg-transparent border-none font-mono text-xs tracking-normal uppercase cursor-pointer",
// //                     "border-b-2 transition-colors duration-150",
// //                     activeTab === tab
// //                       ? "border-border text-foreground"
// //                       : "border-transparent text-foreground/60",
// //                   )}
// //                 >
// //                   {tab}
// //                 </button>
// //               ))}
// //             </div>

// //             {/* ── Params tab ── */}
// //             {activeTab === "params" && (
// //               <div className="py-2 pb-2 max-h-[70vh] overflow-y-auto">
// //                 {SLIDER_CONFIGS.map(({ key, label, min, max, step }) => {
// //                   const value = params[key];
// //                   return (
// //                     <div key={key} className="px-3 py-1">
// //                       <div className="flex justify-between mb-0.75">
// //                         <span className="text-foreground/80">{label}</span>
// //                         <span className="text-foreground/90 min-w-9 text-right">
// //                           {Number(value).toFixed(
// //                             step >= 1
// //                               ? 0
// //                               : step >= 0.1
// //                                 ? 1
// //                                 : step >= 0.01
// //                                   ? 2
// //                                   : 3,
// //                           )}
// //                         </span>
// //                       </div>
// //                       <input
// //                         type="range"
// //                         min={min}
// //                         max={max}
// //                         step={step}
// //                         value={value}
// //                         onChange={(e) =>
// //                           handleSlider(key, parseFloat(e.target.value))
// //                         }
// //                         className="w-full cursor-pointer h-0.75 accent-accent"
// //                       />
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             )}

// //             {/* ── Colors tab ── */}
// //             {activeTab === "colors" && (
// //               <div className="p-[10px_12px_12px]">
// //                 <div className="grid grid-cols-2 gap-2">
// //                   {colors.map((color, idx) => {
// //                     const hex = colorToHex(color);
// //                     return (
// //                       <div key={idx} className="flex flex-col gap-1">
// //                         <span className="text-foreground/80 text-xs">
// //                           color {idx + 1}
// //                         </span>
// //                         <label
// //                           className={cn(
// //                             "flex items-center gap-1.5",
// //                             "bg-background/4 border border-border rounded-md",
// //                             "px-2 py-1.25 cursor-pointer",
// //                           )}
// //                         >
// //                           {/* Color swatch */}
// //                           <div
// //                             className="w-4.5 h-4.5 rounded shrink-0 border border-white/15"
// //                             style={{ background: hex }}
// //                           />
// //                           <span className="text-muted-foreground text-xs flex-1">
// //                             {hex.toUpperCase()}
// //                           </span>
// //                           <input
// //                             type="color"
// //                             value={hex}
// //                             onChange={(e) =>
// //                               handleColorChange(idx, e.target.value)
// //                             }
// //                             className="absolute opacity-0 w-0 h-0 pointer-events-none"
// //                           />
// //                         </label>
// //                         {/* Separate visible color input */}
// //                         <input
// //                           type="color"
// //                           value={hex}
// //                           onChange={(e) =>
// //                             handleColorChange(idx, e.target.value)
// //                           }
// //                           className="w-full h-6 border-none rounded cursor-pointer bg-transparent p-0"
// //                         />
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Reset */}
// //             <div className="px-3 pb-2.5 pt-0.5">
// //               <Button
// //                 variant="outline"
// //                 onClick={handleReset}
// //                 className="w-full"
// //               >
// //                 Reset to reference
// //               </Button>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </>
// //   );
// // }

// "use client";

// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area"; // 1. Import ScrollArea
// import { Slider } from "@/components/ui/slider";
// import { cn } from "@/lib/utils";
// import { DotsSix, Eye, EyeSlash } from "@phosphor-icons/react";
// import { motion } from "framer-motion";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

// // ─── Types ─────────────────────────────────────────────────────────────────

// interface ShaderParams {
//   u_seed: number;
//   u_speed: number;
//   u_scale: number;
//   u_turbAmp: number;
//   u_turbFreq: number;
//   u_turbIter: number;
//   u_waveFreq: number;
//   u_distBias: number;
//   u_jellify: number;
//   u_ditherMode: number;
//   u_dither: number;
//   u_exposure: number;
//   u_contrast: number;
//   u_saturation: number;
// }

// interface ColorStop {
//   r: number;
//   g: number;
//   b: number;
// }

// interface PanelPos {
//   x: number;
//   y: number;
// }

// // ─── Defaults (exact from Spector.js capture) ──────────────────────────────

// const DEFAULT_PARAMS: ShaderParams = {
//   u_seed: 648,
//   u_speed: 0.28,
//   u_scale: 0.42,
//   u_turbAmp: 0.6,
//   u_turbFreq: 0.1,
//   u_turbIter: 7,
//   u_waveFreq: 3.8,
//   u_distBias: 0,
//   u_jellify: 0,
//   u_ditherMode: 2,
//   u_dither: 0.05,
//   u_exposure: 1.1,
//   u_contrast: 1.1,
//   u_saturation: 1.0,
// };

// const DEFAULT_COLORS: ColorStop[] = [
//   { r: 0.902, g: 0.9333, b: 0.9961 },
//   { r: 0.3412, g: 0.5294, b: 0.9686 },
//   { r: 0.0, g: 0.1686, b: 0.5412 },
//   { r: 0.0, g: 0.0, b: 0.0 },
//   { r: 0.0, g: 0.0, b: 0.0 },
//   { r: 0.0, g: 0.0, b: 0.0 },
// ];

// // ─── Helpers ────────────────────────────────────────────────────────────────

// function linearToHex(v: number): string {
//   const c = Math.round(Math.min(1, Math.max(0, v)) * 255);
//   return c.toString(16).padStart(2, "0");
// }

// function colorToHex(c: ColorStop): string {
//   return `#${linearToHex(c.r)}${linearToHex(c.g)}${linearToHex(c.b)}`;
// }

// function hexToLinear(hex: string): ColorStop {
//   const h = hex.replace("#", "");
//   return {
//     r: parseInt(h.slice(0, 2), 16) / 255,
//     g: parseInt(h.slice(2, 4), 16) / 255,
//     b: parseInt(h.slice(4, 6), 16) / 255,
//   };
// }

// function buildColorData(colors: ColorStop[]): Float32Array {
//   const data = new Float32Array(32);
//   colors.forEach((c, i) => {
//     data[i * 4 + 0] = c.r;
//     data[i * 4 + 1] = c.g;
//     data[i * 4 + 2] = c.b;
//     data[i * 4 + 3] = 1.0;
//   });
//   return data;
// }

// interface SliderConfig {
//   key: keyof ShaderParams;
//   label: string;
//   min: number;
//   max: number;
//   step: number;
// }

// const SLIDER_CONFIGS: SliderConfig[] = [
//   { key: "u_speed", label: "speed", min: 0, max: 2, step: 0.01 },
//   { key: "u_scale", label: "scale", min: 0.1, max: 2, step: 0.01 },
//   { key: "u_turbAmp", label: "turbAmp", min: 0, max: 2, step: 0.01 },
//   { key: "u_turbFreq", label: "turbFreq", min: 0.01, max: 1, step: 0.01 },
//   { key: "u_turbIter", label: "turbIter", min: 2, max: 12, step: 1 },
//   { key: "u_waveFreq", label: "waveFreq", min: 0.5, max: 10, step: 0.1 },
//   { key: "u_distBias", label: "distBias", min: -2, max: 2, step: 0.01 },
//   { key: "u_ditherMode", label: "ditherMode", min: 0, max: 2, step: 1 },
//   { key: "u_dither", label: "dither", min: 0, max: 0.2, step: 0.005 },
//   { key: "u_exposure", label: "exposure", min: 0, max: 3, step: 0.05 },
//   { key: "u_contrast", label: "contrast", min: 0.5, max: 3, step: 0.05 },
//   { key: "u_saturation", label: "saturation", min: 0, max: 2, step: 0.05 },
//   { key: "u_seed", label: "seed", min: 0, max: 1000, step: 1 },
//   { key: "u_jellify", label: "jellify", min: 0, max: 1, step: 1 },
// ];

// export default function FluidBackground() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const glRef = useRef<WebGL2RenderingContext | null>(null);
//   const programRef = useRef<WebGLProgram | null>(null);
//   const animFrameRef = useRef<number>(0);
//   const startTimeRef = useRef<number>(Date.now());
//   const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
//   const paramsRef = useRef<ShaderParams>({ ...DEFAULT_PARAMS });
//   const colorsRef = useRef<ColorStop[]>(DEFAULT_COLORS.map((c) => ({ ...c })));

//   const [isReady, setIsReady] = useState<boolean>(false);
//   const [showPanel, setShowPanel] = useState<boolean>(false);
//   const [activeTab, setActiveTab] = useState<"params" | "colors">("params");
//   const [params, setParams] = useState<ShaderParams>({ ...DEFAULT_PARAMS });
//   const [colors, setColors] = useState<ColorStop[]>(
//     DEFAULT_COLORS.map((c) => ({ ...c })),
//   );
//   const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

//   const dragStateRef = useRef<{ active: boolean; ox: number; oy: number }>({
//     active: false,
//     ox: 0,
//     oy: 0,
//   });

//   const onHeaderPointerDown = useCallback(
//     (e: React.PointerEvent<HTMLDivElement>) => {
//       if (e.button !== 0) return;
//       e.preventDefault();
//       e.currentTarget.setPointerCapture(e.pointerId);
//       const rect = e.currentTarget
//         .closest<HTMLElement>("[data-panel]")
//         ?.getBoundingClientRect();
//       const currentX = rect
//         ? rect.left
//         : (panelPos?.x ?? window.innerWidth - 278);
//       const currentY = rect ? rect.top : (panelPos?.y ?? 0);
//       dragStateRef.current = {
//         active: true,
//         ox: e.clientX - currentX,
//         oy: e.clientY - currentY,
//       };
//     },
//     [panelPos],
//   );

//   const onHeaderPointerMove = useCallback(
//     (e: React.PointerEvent<HTMLDivElement>) => {
//       if (!dragStateRef.current.active) return;
//       if (!(e.buttons & 1)) {
//         dragStateRef.current.active = false;
//         return;
//       }
//       setPanelPos({
//         x: e.clientX - dragStateRef.current.ox,
//         y: e.clientY - dragStateRef.current.oy,
//       });
//     },
//     [],
//   );

//   const onHeaderPointerUp = useCallback(() => {
//     dragStateRef.current.active = false;
//   }, []);

//   const pushParam = useCallback((key: keyof ShaderParams, value: number) => {
//     paramsRef.current = { ...paramsRef.current, [key]: value };
//     const gl = glRef.current;
//     const program = programRef.current;
//     if (!gl || !program) return;
//     gl.useProgram(program);
//     const loc = locsRef.current[key];
//     if (loc !== null && loc !== undefined) gl.uniform1f(loc, value);
//   }, []);

//   const pushColors = useCallback((cols: ColorStop[]) => {
//     colorsRef.current = cols;
//     const gl = glRef.current;
//     const program = programRef.current;
//     if (!gl || !program) return;
//     gl.useProgram(program);
//     const loc = locsRef.current["u_colors"];
//     if (loc !== null && loc !== undefined) {
//       gl.uniform4fv(loc, buildColorData(cols));
//     }
//   }, []);

//   const handleSlider = useCallback(
//     (key: keyof ShaderParams, value: number) => {
//       setParams((prev) => ({ ...prev, [key]: value }));
//       pushParam(key, value);
//     },
//     [pushParam],
//   );

//   const handleColorChange = useCallback(
//     (idx: number, hex: string) => {
//       const next = colors.map((c, i) => (i === idx ? hexToLinear(hex) : c));
//       setColors(next);
//       pushColors(next);
//     },
//     [colors, pushColors],
//   );

//   const handleReset = useCallback(() => {
//     setParams({ ...DEFAULT_PARAMS });
//     const resetColors = DEFAULT_COLORS.map((c) => ({ ...c }));
//     setColors(resetColors);
//     const gl = glRef.current;
//     const program = programRef.current;
//     if (!gl || !program) return;
//     gl.useProgram(program);
//     (Object.keys(DEFAULT_PARAMS) as Array<keyof ShaderParams>).forEach(
//       (key) => {
//         const loc = locsRef.current[key];
//         if (loc !== null && loc !== undefined)
//           gl.uniform1f(loc, DEFAULT_PARAMS[key]);
//       },
//     );
//     paramsRef.current = { ...DEFAULT_PARAMS };
//     pushColors(resetColors);
//   }, [pushColors]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const gl = canvas.getContext("webgl2", { alpha: true });
//     if (!gl) {
//       console.error("WebGL 2 not supported.");
//       return;
//     }
//     glRef.current = gl;

//     function createShader(
//       ctx: WebGL2RenderingContext,
//       type: number,
//       src: string,
//     ): WebGLShader | null {
//       const s = ctx.createShader(type);
//       if (!s) return null;
//       ctx.shaderSource(s, src);
//       ctx.compileShader(s);
//       if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) {
//         console.error(ctx.getShaderInfoLog(s));
//         ctx.deleteShader(s);
//         return null;
//       }
//       return s;
//     }

//     const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
//     const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
//     if (!vs || !fs) return;

//     const program = gl.createProgram();
//     if (!program) return;
//     gl.attachShader(program, vs);
//     gl.attachShader(program, fs);
//     gl.linkProgram(program);
//     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//       console.error(gl.getProgramInfoLog(program));
//       return;
//     }
//     programRef.current = program;
//     gl.useProgram(program);

//     const posLoc = gl.getAttribLocation(program, "a_position");
//     const posBuf = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
//     gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
//       gl.STATIC_DRAW,
//     );
//     gl.enableVertexAttribArray(posLoc);
//     gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

//     const uvLoc = gl.getAttribLocation(program, "a_texCoord");
//     const uvBuf = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
//     gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
//       gl.STATIC_DRAW,
//     );
//     gl.enableVertexAttribArray(uvLoc);
//     gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

//     const locs: Record<string, WebGLUniformLocation | null> = {
//       u_resolution: gl.getUniformLocation(program, "u_resolution"),
//       u_time: gl.getUniformLocation(program, "u_time"),
//       u_pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
//       u_colors: gl.getUniformLocation(program, "u_colors"),
//       u_colors_length: gl.getUniformLocation(program, "u_colors_length"),
//       u_loop: gl.getUniformLocation(program, "u_loop"),
//       u_seed: gl.getUniformLocation(program, "u_seed"),
//       u_speed: gl.getUniformLocation(program, "u_speed"),
//       u_scale: gl.getUniformLocation(program, "u_scale"),
//       u_turbAmp: gl.getUniformLocation(program, "u_turbAmp"),
//       u_turbFreq: gl.getUniformLocation(program, "u_turbFreq"),
//       u_turbIter: gl.getUniformLocation(program, "u_turbIter"),
//       u_waveFreq: gl.getUniformLocation(program, "u_waveFreq"),
//       u_distBias: gl.getUniformLocation(program, "u_distBias"),
//       u_jellify: gl.getUniformLocation(program, "u_jellify"),
//       u_ditherMode: gl.getUniformLocation(program, "u_ditherMode"),
//       u_dither: gl.getUniformLocation(program, "u_dither"),
//       u_exposure: gl.getUniformLocation(program, "u_exposure"),
//       u_contrast: gl.getUniformLocation(program, "u_contrast"),
//       u_saturation: gl.getUniformLocation(program, "u_saturation"),
//     };
//     locsRef.current = locs;

//     gl.uniform1f(locs.u_pixelRatio, 1.0);
//     gl.uniform1f(locs.u_loop, 0.0);

//     (Object.keys(DEFAULT_PARAMS) as Array<keyof ShaderParams>).forEach(
//       (key) => {
//         const loc = locs[key];
//         if (loc !== null && loc !== undefined)
//           gl.uniform1f(loc, DEFAULT_PARAMS[key]);
//       },
//     );

//     gl.uniform1i(locs.u_colors_length, 6);
//     gl.uniform4fv(locs.u_colors, buildColorData(DEFAULT_COLORS));

//     const resizeCanvas = (): void => {
//       const w = window.innerWidth;
//       const h = window.innerHeight;

//       const dpr = Math.min(window.devicePixelRatio, 1.5);

//       const renderW = Math.floor(w * dpr);
//       const renderH = Math.floor(h * dpr);

//       if (canvas.width !== renderW || canvas.height !== renderH) {
//         canvas.width = renderW;
//         canvas.height = renderH;
//       }

//       if (canvas.width !== w || canvas.height !== h) {
//         canvas.width = w;
//         canvas.height = h;
//         gl.viewport(0, 0, w, h);
//         gl.uniform2f(locs.u_resolution, w, h);
//       }
//     };
//     window.addEventListener("resize", resizeCanvas);
//     resizeCanvas();

//     const render = (): void => {
//       if (!glRef.current) return;
//       const ctx = glRef.current;
//       ctx.uniform1f(locs.u_time, (Date.now() - startTimeRef.current) / 1000);
//       ctx.clearColor(0, 0, 0, 1);
//       ctx.clear(ctx.COLOR_BUFFER_BIT);
//       ctx.drawArrays(ctx.TRIANGLES, 0, 6);
//       animFrameRef.current = requestAnimationFrame(render);
//     };
//     render();
//     setIsReady(true);

//     return () => {
//       cancelAnimationFrame(animFrameRef.current);
//       window.removeEventListener("resize", resizeCanvas);
//       if (glRef.current && programRef.current)
//         glRef.current.deleteProgram(programRef.current);
//       glRef.current = null;
//       programRef.current = null;
//     };
//   }, []);

//   const panelStyle = panelPos
//     ? {
//         position: "fixed" as const,
//         left: panelPos.x,
//         top: panelPos.y,
//         right: "auto",
//       }
//     : {};

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={isReady ? { opacity: 1 } : { opacity: 0 }}
//         transition={{ duration: 1.5, ease: "easeInOut" }}
//         className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-black"
//       >
//         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
//         <div className="absolute inset-0 bg-black/30" />
//       </motion.div>

//       {/* ── Debug Panel (Giao diện Darkmode theo config hệ thống) ── */}
//       <div
//         data-panel
//         style={panelStyle}
//         className={cn(
//           "dark z-40 w-67",
//           "bg-card/95 backdrop-blur-lg",
//           "border border-border rounded-lg",
//           "font-mono text-xs text-foreground",
//           "select-none shadow-xl",
//           !panelPos &&
//             "fixed top-22 right-5 md:top-20 md:right-6 lg:top-20 lg:right-8 xl:top-20 xl:right-24 2xl:right-2 2xl:top-5",
//           // "absolute top-16 right-4 sm:right-6 lg:right-8",
//         )}
//       >
//         {/* Header */}
//         <div
//           className={cn(
//             "flex items-center justify-between px-2 py-2.25 pl-2.5",
//             showPanel ? "border-b border-border rounded-t-lg" : "rounded-lg",
//           )}
//         >
//           <div
//             onPointerDown={onHeaderPointerDown}
//             onPointerMove={onHeaderPointerMove}
//             onPointerUp={onHeaderPointerUp}
//             title="Drag to move"
//             className="grid grid-cols-3 grid-rows-2 gap-0.75 p-1 cursor-grab rounded shrink-0"
//           >
//             <DotsSix
//               size={18}
//               weight="bold"
//               className="text-foreground hover:text-foreground/70 col-span-3 row-span-2"
//             />
//           </div>

//           <span className="flex-1 text-center text-foreground font-semibold tracking-wide text-xs capitalize">
//             background effects
//           </span>

//           <button
//             onClick={() => setShowPanel((v) => !v)}
//             title={showPanel ? "Collapse panel" : "Expand panel"}
//             className="flex items-center justify-center shrink-0 bg-transparent border-none p-[4px_5px] cursor-pointer text-foreground transition-colors hover:text-foreground/70"
//           >
//             {showPanel ? (
//               <Eye size={18} weight="regular" />
//             ) : (
//               <EyeSlash size={18} weight="regular" />
//             )}
//           </button>
//         </div>

//         {showPanel && (
//           <div>
//             {/* Tabs */}
//             <div className="flex border-b border-border">
//               {(["params", "colors"] as const).map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={cn(
//                     "flex-1 py-1.5 bg-transparent border-none font-mono text-xs capitalize cursor-pointer border-b-2 transition-colors",
//                     activeTab === tab
//                       ? "border-foreground text-foreground"
//                       : "border-transparent text-foreground/60",
//                   )}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>

//             {/* ── Params tab ── */}
//             {activeTab === "params" && (
//               /* Sử dụng ScrollArea của Shadcn để giới hạn chiều cao tối đa (ví dụ: h-72) */
//               /* Lớp CSS [&::-webkit-scrollbar]:hidden, [scrollbar-width]:none,... giúp ẩn thanh cuộn */
//               <ScrollArea
//                 className={cn(
//                   "h-72 md:h-fit w-full py-2 pb-2",
//                   "[&>div>div]:!block", // Đảm bảo layout bên trong ScrollArea không bị lỗi flexbox
//                   "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
//                 )}
//               >
//                 {SLIDER_CONFIGS.map(({ key, label, min, max, step }) => {
//                   const value = params[key];
//                   return (
//                     <div key={key} className="flex flex-col gap-2 px-3 py-2">
//                       <div className="flex justify-between">
//                         <span className="text-foreground/80">{label}</span>
//                         <span className="text-foreground/90 min-w-9 text-right">
//                           {Number(value).toFixed(
//                             step >= 1
//                               ? 0
//                               : step >= 0.1
//                                 ? 1
//                                 : step >= 0.01
//                                   ? 2
//                                   : 3,
//                           )}
//                         </span>
//                       </div>
//                       <Slider
//                         min={min}
//                         max={max}
//                         step={step}
//                         value={[value]}
//                         onValueChange={(values) => handleSlider(key, values[0])}
//                         className="w-full"
//                       />
//                     </div>
//                   );
//                 })}
//               </ScrollArea>
//             )}

//             {/* ── Colors tab ── */}
//             {activeTab === "colors" && (
//               <div className="p-3">
//                 <div className="grid grid-cols-2 gap-2">
//                   {colors.map((color, idx) => {
//                     const hex = colorToHex(color);
//                     return (
//                       <div key={idx} className="flex flex-col gap-1">
//                         <span className="text-foreground/80 text-[11px]">
//                           color {idx + 1}
//                         </span>
//                         <label
//                           className={cn(
//                             "flex items-center gap-1.5 relative",
//                             "bg-muted/40 border border-border rounded-md",
//                             "px-2 py-1.25 cursor-pointer hover:bg-muted/60 transition-colors",
//                           )}
//                         >
//                           <div
//                             className="w-4 h-4 rounded shrink-0 border border-white/10"
//                             style={{ background: hex }}
//                           />
//                           <span className="text-foreground font-mono text-[11px] flex-1">
//                             {hex.toUpperCase()}
//                           </span>
//                           <input
//                             type="color"
//                             value={hex}
//                             onChange={(e) =>
//                               handleColorChange(idx, e.target.value)
//                             }
//                             className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
//                           />
//                         </label>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Reset Button */}
//             <div className="px-3 pb-2.5 pt-1">
//               <Button
//                 variant="outline"
//                 onClick={handleReset}
//                 className="w-full text-xs h-8 border-border hover:bg-accent hover:text-accent-foreground"
//               >
//                 Reset to reference
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
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
  r: number;
  g: number;
  b: number;
}

interface PanelPos {
  x: number;
  y: number;
}

// ─── Defaults ──────────────────────────────────────────────────────────────

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

const DEFAULT_COLORS: ColorStop[] = [
  { r: 0.902, g: 0.9333, b: 0.9961 },
  { r: 0.3412, g: 0.5294, b: 0.9686 },
  { r: 0.0, g: 0.1686, b: 0.5412 },
  { r: 0.0, g: 0.0, b: 0.0 },
  { r: 0.0, g: 0.0, b: 0.0 },
  { r: 0.0, g: 0.0, b: 0.0 },
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
  const data = new Float32Array(32);
  colors.forEach((c, i) => {
    data[i * 4 + 0] = c.r;
    data[i * 4 + 1] = c.g;
    data[i * 4 + 2] = c.b;
    data[i * 4 + 3] = 1.0;
  });
  return data;
}

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

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const paramsRef = useRef<ShaderParams>({ ...DEFAULT_PARAMS });
  const colorsRef = useRef<ColorStop[]>(DEFAULT_COLORS.map((c) => ({ ...c })));

  // Dùng ref theo dõi trạng thái hiển thị của Canvas để tránh trigger re-render không đáng có
  const isIntersectingRef = useRef<boolean>(true);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"params" | "colors">("params");
  const [params, setParams] = useState<ShaderParams>({ ...DEFAULT_PARAMS });
  const [colors, setColors] = useState<ColorStop[]>(
    DEFAULT_COLORS.map((c) => ({ ...c })),
  );
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

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

    gl.uniform1f(locs.u_loop, 0.0);

    (Object.keys(DEFAULT_PARAMS) as Array<keyof ShaderParams>).forEach(
      (key) => {
        const loc = locs[key];
        if (loc !== null && loc !== undefined)
          gl.uniform1f(loc, DEFAULT_PARAMS[key]);
      },
    );

    gl.uniform1i(locs.u_colors_length, 6);
    gl.uniform4fv(locs.u_colors, buildColorData(DEFAULT_COLORS));

    // ── Fixed Resize Logic (Clean & Non-conflicting) ──
    const resizeCanvas = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 1.5);

      const renderW = Math.floor(w * dpr);
      const renderH = Math.floor(h * dpr);

      if (canvas.width !== renderW || canvas.height !== renderH) {
        canvas.width = renderW;
        canvas.height = renderH;

        // Fix cú pháp template string để bóp kích thước hiển thị CSS
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        gl.viewport(0, 0, renderW, renderH);
        gl.uniform2f(locs.u_resolution, renderW, renderH);
        gl.uniform1f(locs.u_pixelRatio, dpr);
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // ── Loop Render Control (Mát máy chuẩn chỉ) ──
    const render = (): void => {
      if (!glRef.current) return;

      // Nếu khuất khỏi màn hình, bỏ qua frame này, giữ nguyên vòng lặp chờ
      if (!isIntersectingRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const ctx = glRef.current;
      ctx.uniform1f(locs.u_time, (Date.now() - startTimeRef.current) / 1000);
      ctx.clearColor(0, 0, 0, 1);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.drawArrays(ctx.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };
    render();
    setIsReady(true);

    // ── Intersection Observer Integration ──
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersectingRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.01 }, // Chỉ cần lộ ra 1% diện tích là kích hoạt render lại
    );
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
      observer.disconnect();
      if (glRef.current && programRef.current)
        glRef.current.deleteProgram(programRef.current);
      glRef.current = null;
      programRef.current = null;
    };
  }, []);

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

      {/* ── Debug Panel ── */}
      <div
        data-panel
        style={panelStyle}
        className={cn(
          "dark z-40 w-67",
          "bg-card/95 backdrop-blur-lg",
          "border border-border rounded-lg",
          "font-mono text-xs text-foreground",
          "select-none shadow-xl",
          !panelPos &&
            "fixed top-22 right-5 md:top-20 md:right-6 lg:top-20 lg:right-8 xl:top-20 xl:right-24 2xl:right-2 2xl:top-5",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-2 py-2.25 pl-2.5",
            showPanel ? "border-b border-border rounded-t-lg" : "rounded-lg",
          )}
        >
          <div
            onPointerDown={onHeaderPointerDown}
            onPointerMove={onHeaderPointerMove}
            onPointerUp={onHeaderPointerUp}
            title="Drag to move"
            className="grid grid-cols-3 grid-rows-2 gap-0.75 p-1 cursor-grab rounded shrink-0"
          >
            <DotsSix
              size={18}
              weight="bold"
              className="text-foreground hover:text-foreground/70 col-span-3 row-span-2"
            />
          </div>

          <span className="flex-1 text-center text-foreground font-semibold tracking-wide text-xs capitalize">
            background effects
          </span>

          <button
            onClick={() => setShowPanel((v) => !v)}
            title={showPanel ? "Collapse panel" : "Expand panel"}
            className="flex items-center justify-center shrink-0 bg-transparent border-none p-[4px_5px] cursor-pointer text-foreground transition-colors hover:text-foreground/70"
          >
            {showPanel ? (
              <Eye size={18} weight="regular" />
            ) : (
              <EyeSlash size={18} weight="regular" />
            )}
          </button>
        </div>

        {showPanel && (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["params", "colors"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-1.5 bg-transparent border-none font-mono text-xs capitalize cursor-pointer border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-foreground text-foreground"
                      : "border-transparent text-foreground/60",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Params tab */}
            {activeTab === "params" && (
              <ScrollArea
                className={cn(
                  "h-72 md:h-fit w-full py-2 pb-2",
                  "[&>div>div]:!block",
                  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                )}
              >
                {SLIDER_CONFIGS.map(({ key, label, min, max, step }) => {
                  const value = params[key];
                  return (
                    <div key={key} className="flex flex-col gap-2 px-3 py-2">
                      <div className="flex justify-between">
                        <span className="text-foreground/80">{label}</span>
                        <span className="text-foreground/90 min-w-9 text-right">
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
                      <Slider
                        min={min}
                        max={max}
                        step={step}
                        value={[value]}
                        onValueChange={(values) => handleSlider(key, values[0])}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </ScrollArea>
            )}

            {/* Colors tab */}
            {activeTab === "colors" && (
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((color, idx) => {
                    const hex = colorToHex(color);
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="text-foreground/80 text-[11px]">
                          color {idx + 1}
                        </span>
                        <label
                          className={cn(
                            "flex items-center gap-1.5 relative",
                            "bg-muted/40 border border-border rounded-md",
                            "px-2 py-1.25 cursor-pointer hover:bg-muted/60 transition-colors",
                          )}
                        >
                          <div
                            className="w-4 h-4 rounded shrink-0 border border-white/10"
                            style={{ background: hex }}
                          />
                          <span className="text-foreground font-mono text-[11px] flex-1">
                            {hex.toUpperCase()}
                          </span>
                          <input
                            type="color"
                            value={hex}
                            onChange={(e) =>
                              handleColorChange(idx, e.target.value)
                            }
                            className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset Button */}
            <div className="px-3 pb-2.5 pt-1">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full text-xs h-8 border-border hover:bg-accent hover:text-accent-foreground"
              >
                Reset to reference
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

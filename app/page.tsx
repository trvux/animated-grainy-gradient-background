// // "use client";
// // import { useEffect, useRef } from "react";

// // export default function ScalarExactBackground() {
// //   const canvasRef = useRef<HTMLCanvasElement | null>(null);

// //   useEffect(() => {
// //     const canvas = canvasRef.current;
// //     if (!canvas) return;
// //     const gl = canvas.getContext("webgl2");
// //     if (!gl) {
// //       console.error("WebGL2 không được hỗ trợ trên trình duyệt này.");
// //       return;
// //     }

// //     // 1. VERTEX SHADER NGUYÊN BẢN
// //     const vsSource = `#version 300 es
// //       precision highp float;
// //       in vec2 a_position;
// //       in vec2 a_texCoord;
// //       out vec2 v_uv;
// //       void main() {
// //         v_uv = a_texCoord;
// //         gl_Position = vec4(a_position, 0.0, 1.0);
// //       }
// //     `;

// //     // 2. FRAGMENT SHADER - ĐÃ KÍCH HOẠT VECTOR CHUYỂN ĐỘNG TỊNH TIẾN TUYẾN TÍNH
// //     const fsSource = `#version 300 es
// //       precision highp float;
// //       in vec2 v_uv;
// //       out vec4 fragColor;
// //       #define NUM_COLORS 8

// //       uniform vec4 u_colors[NUM_COLORS];
// //       uniform int u_colors_length;
// //       uniform float u_seed;
// //       uniform float u_speed;
// //       uniform float u_loop;
// //       uniform float u_scale;
// //       uniform float u_turbAmp;
// //       uniform float u_turbFreq;
// //       uniform float u_turbIter;
// //       uniform float u_waveFreq;
// //       uniform float u_distBias;
// //       uniform float u_jellify;
// //       uniform float u_ditherMode;
// //       uniform float u_dither;
// //       uniform float u_exposure;
// //       uniform float u_contrast;
// //       uniform float u_saturation;
// //       uniform float u_time;
// //       uniform vec2 u_resolution;
// //       uniform float u_pixelRatio;

// //       const float GOLDEN_ANGLE = 2.3999632;
// //       const float TAU = 6.28318530;

// //       uvec3 hash3(uvec3 v) {
// //         v = v * 1664525u + 1013904223u;
// //         v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
// //         v ^= v >> 16u;
// //         v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
// //         return v;
// //       }

// //       vec3 seedRandom(float seedVal) {
// //         uvec3 s = uvec3(floatBitsToUint(seedVal), floatBitsToUint(seedVal * 1.5 + 7.31), floatBitsToUint(seedVal * 2.7 + 13.37));
// //         s = hash3(s);
// //         return vec3(s) / float(0xFFFFFFFFu);
// //       }

// //       vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
// //       vec3 toSrgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(0.4545)); }

// //       vec3 linearToOklab(vec3 c) {
// //         float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
// //         float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
// //         float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
// //         l = pow(max(l, 0.0), 1.0/3.0); m = pow(max(m, 0.0), 1.0/3.0); s = pow(max(s, 0.0), 1.0/3.0);
// //         return vec3(0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
// //       }

// //       vec3 oklabToLinear(vec3 c) {
// //         float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
// //         float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
// //         float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
// //         l = l * l * l; m = m * m * m; s = s * s * s;
// //         return vec3(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
// //       }

// //       vec3 oklabToLch(vec3 lab) { return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y)); }
// //       vec3 lchToOklab(vec3 lch) { return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z)); }

// //       vec3 mixLch(vec3 lab0, vec3 lab1, float t) {
// //         vec3 lch0 = oklabToLch(lab0); vec3 lch1 = oklabToLch(lab1);
// //         if (lch0.y < 0.05) lch0.z = lch1.z; if (lch1.y < 0.05) lch1.z = lch0.z;
// //         float dh = lch1.z - lch0.z;
// //         if (dh > 3.14159265) dh -= 6.28318530; if (dh < -3.14159265) dh += 6.28318530;
// //         return lchToOklab(vec3(mix(lch0.x, lch1.x, t), mix(lch0.y, lch1.y, t), lch0.z + dh * t));
// //       }

// //       vec3 getColor(int idx) {
// //         if (u_colors_length < 1) return vec3(0.0);
// //         int safeIdx = clamp(idx, 0, u_colors_length - 1);
// //         return u_colors[safeIdx].rgb;
// //       }

// //       vec3 paletteN(float t, int count) {
// //         if (count < 1) return vec3(0.0); if (count < 2) return toLinear(getColor(0));
// //         float segmentSize = 1.0 / float(count - 1);
// //         t = clamp(t, 0.0, 1.0);
// //         int idx = min(int(floor(t / segmentSize)), count - 2);
// //         float localT = clamp((t - float(idx) * segmentSize) / segmentSize, 0.0, 1.0);
// //         vec3 lab0 = linearToOklab(toLinear(getColor(idx)));
// //         vec3 lab1 = linearToOklab(toLinear(getColor(idx + 1)));
// //         return oklabToLinear(mixLch(lab0, lab1, localT));
// //       }

// //       float IGN(vec2 uv) { return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715)))); }
// //       float quickNoise(vec2 I) { return fract(sin(dot(I, vec2(12.9898, 78.233))) * 43758.5453); }

// //       float getDither(vec2 I, float mode) {
// //         if (mode < 0.5) return 0.5;
// //         if (mode < 1.5) return IGN(I);
// //         return quickNoise(I);
// //       }

// //       vec3 softGamutMap(vec3 linearRgb) {
// //         float maxC = max(linearRgb.r, max(linearRgb.g, linearRgb.b));
// //         float minC = min(linearRgb.r, min(linearRgb.g, linearRgb.b));
// //         if (minC >= 0.0 && maxC <= 1.0) return linearRgb;
// //         vec3 lab = linearToOklab(max(linearRgb, 0.0));
// //         float L = clamp(lab.x, 0.0, 1.0); float C = length(lab.yz); float h = atan(lab.z, lab.y);
// //         float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));
// //         if (C > maxChroma * 0.7) {
// //           float knee = maxChroma * 0.7;
// //           C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
// //         }
// //         return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
// //       }

// //       vec3 applyContrastSaturation(vec3 linearRgb, float contrast, float saturation) {
// //         vec3 lab = linearToOklab(linearRgb);
// //         float C = length(lab.yz); float h = atan(lab.z, lab.y);
// //         lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
// //         C *= saturation; lab.y = C * cos(h); lab.z = C * sin(h);
// //         return oklabToLinear(lab);
// //       }

// //       void main() {
// //         vec2 fragCoord = v_uv * u_resolution;
// //         vec2 r = u_resolution;
// //         vec2 p = (fragCoord * 2.0 - r) / r.y;

// //         // Căn chỉnh phom lụa nằm tinh tế sát cạnh dưới
// //         p.y += 0.38;

// //         int colorCount = u_colors_length;
// //         if (colorCount < 1) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

// //         // SỬA ĐỔI CHÍNH: Thay thế tA, tB lặp bằng trục thời gian tịnh tiến liên tục (Linear Drift)
// //         float t = u_time * u_speed;

// //         vec3 seedOffset = seedRandom(u_seed); vec3 seedOffset2 = seedRandom(u_seed + 100.0);
// //         float seedAngle = u_seed * GOLDEN_ANGLE; vec2 seedPhase = (seedOffset2.xy - 0.5) * TAU;

// //         float cs = cos(seedAngle); float sn = sin(seedAngle);
// //         p = mat2(cs, -sn, sn, cs) * p;

// //         float dither = getDither(floor(fragCoord / u_pixelRatio), u_ditherMode);
// //         float totalVal = 0.0; float totalWeight = 0.0;
// //         int turbIter = int(u_turbIter);
// //         float freq = 1.0 / max(u_turbFreq, 0.01);

// //         for (float i = 0.0; i < 4.0; i++) {
// //           float eph = i / 4.0;
// //           vec2 q = p * u_scale;

// //           // Tạo dòng chảy trôi dạt có hướng: Ép tọa độ dịch chuyển tịnh tiến theo thời gian
// //           q.x -= t * 0.8;
// //           q.y += t * 0.2;

// //           float sq = eph * eph;
// //           if (u_jellify > 0.5) { q.yx *= mix(1.0, 0.5, 1.0 - exp(-sq)); }
// //           float a = seedPhase.x; float d = seedPhase.y;
// //           for (int j = 2; j < 13; j++) {
// //             if (j >= turbIter) break;
// //             float fj = float(j);

// //             // Ép hệ không gian nhiễu uốn lượn liên tục dịch chuyển cuộn dạt thay vì lặp vòng tròn
// //             q += u_turbAmp * sin(q.yx / freq * fj + t * 2.2 + vec2(a, d) + seedOffset.xy * fj) / fj;
// //             a += cos(fj + d * 1.2 + q.x * 2.0 - t * 1.5 + seedOffset2.z);
// //             d += sin(fj * q.y + a + seedOffset.z + t * 1.8 + seedOffset2.y);
// //           }
// //           float v = 0.5 + 0.5 * sin(length(q.yx + vec2(a, d) * 0.2) * u_waveFreq + i * i + seedOffset.x);
// //           float weight = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
// //           totalVal += v * weight; totalWeight += weight;
// //         }
// //         float val = totalVal / totalWeight;
// //         val = clamp((val - 0.3) / 0.4, 0.0, 1.0);
// //         val = pow(val, exp(-u_distBias));
// //         val = clamp(val + (dither - 0.5) * u_dither, 0.0, 1.0);

// //         vec3 col = paletteN(val, colorCount);
// //         col *= u_exposure;
// //         col = applyContrastSaturation(col, u_contrast, u_saturation);
// //         col = softGamutMap(col);
// //         col = toSrgb(col);
// //         fragColor = vec4(col, 1.0);
// //       }
// //     `;

// //     // Khởi tạo chương trình biên dịch WebGL2
// //     const vs = gl.createShader(gl.VERTEX_SHADER)!;
// //     gl.shaderSource(vs, vsSource);
// //     gl.compileShader(vs);
// //     const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
// //     gl.shaderSource(fs, fsSource);
// //     gl.compileShader(fs);
// //     const program = gl.createProgram()!;
// //     gl.attachShader(program, vs);
// //     gl.attachShader(program, fs);
// //     gl.linkProgram(program);
// //     gl.useProgram(program);

// //     // Phủ kín khung tọa độ Canvas
// //     const vertices = new Float32Array([
// //       -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1,
// //       1,
// //     ]);
// //     const buffer = gl.createBuffer();
// //     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
// //     gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// //     const posLoc = gl.getAttribLocation(program, "a_position");
// //     gl.enableVertexAttribArray(posLoc);
// //     gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

// //     const texLoc = gl.getAttribLocation(program, "a_texCoord");
// //     gl.enableVertexAttribArray(texLoc);
// //     gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

// //     // ÁP ĐẶT ĐÚNG THAM SỐ THỰC TẾ TRÊN SPECTOR.JS CỦA SCALAR
// //     const setUni = (name: string, val: number) =>
// //       gl.uniform1f(gl.getUniformLocation(program, name), val);
// //     setUni("u_seed", 0.0);
// //     setUni("u_speed", 0.15); // Vận tốc trôi dạt tổng thể tuyến tính
// //     setUni("u_loop", 0.0); // Vứt bỏ hẳn biến u_loop để kích hoạt dòng chảy không lặp
// //     setUni("u_scale", 1.0);
// //     setUni("u_turbAmp", 0.342);
// //     setUni("u_turbFreq", 0.655);
// //     setUni("u_turbIter", 5.0);
// //     setUni("u_waveFreq", 2.222);
// //     setUni("u_distBias", -0.171);
// //     setUni("u_jellify", 1.0);
// //     setUni("u_ditherMode", 1.0);
// //     setUni("u_dither", 0.11);
// //     setUni("u_exposure", 1.0);
// //     setUni("u_contrast", 1.0);
// //     setUni("u_saturation", 1.0);
// //     gl.uniform1f(
// //       gl.getUniformLocation(program, "u_pixelRatio"),
// //       window.devicePixelRatio || 1,
// //     );

// //     // MẢNG MÀU CHÍNH XÁC TỪ UNIFORMS SPECTOR.JS
// //     const colorsLoc = gl.getUniformLocation(program, "u_colors");
// //     const colorsLenLoc = gl.getUniformLocation(program, "u_colors_length");

// //     const scalarExactTokens = [
// //       [0.0039, 0.0, 0.0157, 1.0], // #010004
// //       [0.0, 0.0314, 0.1804, 1.0],
// //       [0.0, 0.1686, 0.5412, 1.0], // #002b8a
// //       [0.0588, 0.3569, 1.0, 1.0], // #0f5bff (Màu loang rộng)
// //       [0.7294, 0.7961, 1.0, 1.0], // #bacbff
// //       [1.0, 1.0, 1.0, 1.0], // #fff (Lõi trắng)
// //       [0.1098, 0.1098, 0.1216, 1.0], // #1c1c1f
// //       [0.0, 0.0, 0.0, 1.0], // #000
// //     ];
// //     const flatColors = new Float32Array(scalarExactTokens.flat());
// //     gl.uniform4fv(colorsLoc, flatColors);
// //     gl.uniform1i(colorsLenLoc, scalarExactTokens.length);

// //     const resLoc = gl.getUniformLocation(program, "u_resolution");
// //     const timeLoc = gl.getUniformLocation(program, "u_time");

// //     const resize = () => {
// //       canvas.width = window.innerWidth;
// //       canvas.height = window.innerHeight;
// //       gl.viewport(0, 0, canvas.width, canvas.height);
// //     };
// //     window.addEventListener("resize", resize);
// //     resize();

// //     let animId: number;
// //     const render = (time: number) => {
// //       gl.uniform2f(resLoc, canvas.width, canvas.height);
// //       gl.uniform1f(timeLoc, time * 0.001);
// //       gl.drawArrays(gl.TRIANGLES, 0, 6);
// //       animId = requestAnimationFrame(render);
// //     };
// //     animId = requestAnimationFrame(render);

// //     return () => {
// //       cancelAnimationFrame(animId);
// //       window.removeEventListener("resize", resize);
// //     };
// //   }, []);

// //   return (
// //     <div className="relative min-h-screen w-screen overflow-hidden bg-[#010004]">
// //       <canvas ref={canvasRef} className="absolute inset-0 h-full w-full z-0" />
// //       <div className="relative z-10 min-h-screen w-full"></div>
// //     </div>
// //   );
// // }

// "use client";
// import { useEffect, useRef } from "react";

// export default function ScalarExactBackground() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const gl = canvas.getContext("webgl2");
//     if (!gl) {
//       console.error("WebGL2 không được hỗ trợ trên trình duyệt này.");
//       return;
//     }

//     // 1. VERTEX SHADER NGUYÊN BẢN
//     const vsSource = `#version 300 es
//       precision highp float;
//       in vec2 a_position;
//       in vec2 a_texCoord;
//       out vec2 v_uv;
//       void main() {
//         v_uv = a_texCoord;
//         gl_Position = vec4(a_position, 0.0, 1.0);
//       }
//     `;

//     // 2. FRAGMENT SHADER - ĐÃ KHẮC PHỤC LỖI ÉP TRỤC TRÁNH SỤP CANVAS
//     const fsSource = `#version 300 es
//       precision highp float;
//       in vec2 v_uv;
//       out vec4 fragColor;
//       #define NUM_COLORS 8

//       uniform vec4 u_colors[NUM_COLORS];
//       uniform int u_colors_length;
//       uniform float u_seed;
//       uniform float u_speed;
//       uniform float u_loop;
//       uniform float u_scale;
//       uniform float u_turbAmp;
//       uniform float u_turbFreq;
//       uniform float u_turbIter;
//       uniform float u_waveFreq;
//       uniform float u_distBias;
//       uniform float u_jellify;
//       uniform float u_ditherMode;
//       uniform float u_dither;
//       uniform float u_exposure;
//       uniform float u_contrast;
//       uniform float u_saturation;
//       uniform float u_time;
//       uniform vec2 u_resolution;
//       uniform float u_pixelRatio;

//       const float GOLDEN_ANGLE = 2.3999632;
//       const float TAU = 6.28318530;

//       uvec3 hash3(uvec3 v) {
//         v = v * 1664525u + 1013904223u;
//         v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
//         v ^= v >> 16u;
//         v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
//         return v;
//       }

//       vec3 seedRandom(float seedVal) {
//         uvec3 s = uvec3(floatBitsToUint(seedVal), floatBitsToUint(seedVal * 1.5 + 7.31), floatBitsToUint(seedVal * 2.7 + 13.37));
//         s = hash3(s);
//         return vec3(s) / float(0xFFFFFFFFu);
//       }

//       vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
//       vec3 toSrgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(0.4545)); }

//       vec3 linearToOklab(vec3 c) {
//         float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
//         float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
//         float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
//         l = pow(max(l, 0.0), 1.0/3.0); m = pow(max(m, 0.0), 1.0/3.0); s = pow(max(s, 0.0), 1.0/3.0);
//         return vec3(0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
//       }

//       vec3 oklabToLinear(vec3 c) {
//         float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
//         float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
//         float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
//         l = l * l * l; m = m * m * m; s = s * s * s;
//         return vec3(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
//       }

//       vec3 oklabToLch(vec3 lab) { return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y)); }
//       vec3 lchToOklab(vec3 lch) { return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z)); }

//       vec3 mixLch(vec3 lab0, vec3 lab1, float t) {
//         vec3 lch0 = oklabToLch(lab0); vec3 lch1 = oklabToLch(lab1);
//         if (lch0.y < 0.05) lch0.z = lch1.z; if (lch1.y < 0.05) lch1.z = lch0.z;
//         float dh = lch1.z - lch0.z;
//         if (dh > 3.14159265) dh -= 6.28318530; if (dh < -3.14159265) dh += 6.28318530;
//         return lchToOklab(vec3(mix(lch0.x, lch1.x, t), mix(lch0.y, lch1.y, t), lch0.z + dh * t));
//       }

//       vec3 getColor(int idx) {
//         if (u_colors_length < 1) return vec3(0.0);
//         int safeIdx = clamp(idx, 0, u_colors_length - 1);
//         return u_colors[safeIdx].rgb;
//       }

//       vec3 paletteN(float t, int count) {
//         if (count < 1) return vec3(0.0); if (count < 2) return toLinear(getColor(0));
//         float segmentSize = 1.0 / float(count - 1);
//         t = clamp(t, 0.0, 1.0);
//         int idx = min(int(floor(t / segmentSize)), count - 2);
//         float localT = clamp((t - float(idx) * segmentSize) / segmentSize, 0.0, 1.0);
//         vec3 lab0 = linearToOklab(toLinear(getColor(idx)));
//         vec3 lab1 = linearToOklab(toLinear(getColor(idx + 1)));
//         return oklabToLinear(mixLch(lab0, lab1, localT));
//       }

//       float IGN(vec2 uv) { return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715)))); }
//       float quickNoise(vec2 I) { return fract(sin(dot(I, vec2(12.9898, 78.233))) * 43758.5453); }

//       float getDither(vec2 I, float mode) {
//         if (mode < 0.5) return 0.5;
//         if (mode < 1.5) return IGN(I);
//         return quickNoise(I);
//       }

//       vec3 softGamutMap(vec3 linearRgb) {
//         float maxC = max(linearRgb.r, max(linearRgb.g, linearRgb.b));
//         float minC = min(linearRgb.r, min(linearRgb.g, linearRgb.b));
//         if (minC >= 0.0 && maxC <= 1.0) return linearRgb;
//         vec3 lab = linearToOklab(max(linearRgb, 0.0));
//         float L = clamp(lab.x, 0.0, 1.0); float C = length(lab.yz); float h = atan(lab.z, lab.y);
//         float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));
//         if (C > maxChroma * 0.7) {
//           float knee = maxChroma * 0.7;
//           C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
//         }
//         return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
//       }

//       vec3 applyContrastSaturation(vec3 linearRgb, float contrast, float saturation) {
//         vec3 lab = linearToOklab(linearRgb);
//         float C = length(lab.yz); float h = atan(lab.z, lab.y);
//         lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
//         C *= saturation; lab.y = C * cos(h); lab.z = C * sin(h);
//         return oklabToLinear(lab);
//       }

//       void main() {
//         vec2 fragCoord = v_uv * u_resolution;
//         vec2 r = u_resolution;
//         vec2 p = (fragCoord * 2.0 - r) / r.y;

//         // Ép dải lụa nằm sát đáy dưới màn hình chuẩn cấu trúc thiết kế
//         p.y += 0.38;

//         int colorCount = u_colors_length;
//         if (colorCount < 1) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

//         float t = u_time * u_speed;

//         vec3 seedOffset = seedRandom(u_seed); vec3 seedOffset2 = seedRandom(u_seed + 100.0);
//         float seedAngle = u_seed * GOLDEN_ANGLE; vec2 seedPhase = (seedOffset2.xy - 0.5) * TAU;

//         float cs = cos(seedAngle); float sn = sin(seedAngle);
//         p = mat2(cs, -sn, sn, cs) * p;

//         float dither = getDither(floor(fragCoord / u_pixelRatio), u_ditherMode);
//         float totalVal = 0.0; float totalWeight = 0.0;
//         int turbIter = int(u_turbIter);
//         float freq = 1.0 / max(u_turbFreq, 0.01);

//         for (float i = 0.0; i < 4.0; i++) {
//           float eph = i / 4.0;
//           vec2 q = p * u_scale;

//           // Kích hoạt dòng chảy tịnh tiến liên tục theo vector thời gian linear
//           q.x -= t * 0.8;
//           q.y += t * 0.2;

//           float sq = eph * eph;

//           // GIẢI PHÁP AN TOÀN: Tính toán hệ số Jellify độc lập, không ép nhân gán trục .yx trực tiếp để tránh sụp GPU
//           float jellifyFactor = 1.0;
//           if (u_jellify > 0.5) { jellifyFactor = mix(1.0, 0.5, 1.0 - exp(-sq)); }
//           vec2 shiftedQ = vec2(q.x, q.y * jellifyFactor);

//           float a = seedPhase.x; float d = seedPhase.y;
//           for (int j = 2; j < 13; j++) {
//             if (j >= turbIter) break;
//             float fj = float(j);

//             // Sử dụng shiftedQ an toàn cho hệ thống vòng lặp nhiễu đa tầng
//             shiftedQ += u_turbAmp * sin(vec2(shiftedQ.y, shiftedQ.x) / freq * fj + t * 2.2 + vec2(a, d) + seedOffset.xy * fj) / fj;
//             a += cos(fj + d * 1.2 + shiftedQ.x * 2.0 - t * 1.5 + seedOffset2.z);
//             d += sin(fj * shiftedQ.y + a + seedOffset.z + t * 1.8 + seedOffset2.y);
//           }
//           float v = 0.5 + 0.5 * sin(length(vec2(shiftedQ.y, shiftedQ.x) + vec2(a, d) * 0.2) * u_waveFreq + i * i + seedOffset.x);
//           float weight = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
//           totalVal += v * weight; totalWeight += weight;
//         }
//         float val = totalVal / totalWeight;
//         val = clamp((val - 0.3) / 0.4, 0.0, 1.0);
//         val = pow(val, exp(-u_distBias));
//         val = clamp(val + (dither - 0.5) * u_dither, 0.0, 1.0);

//         vec3 col = paletteN(val, colorCount);
//         col *= u_exposure;
//         col = applyContrastSaturation(col, u_contrast, u_saturation);
//         col = softGamutMap(col);
//         col = toSrgb(col);
//         fragColor = vec4(col, 1.0);
//       }
//     `;

//     // Khởi tạo đồ họa WebGL2
//     const vs = gl.createShader(gl.VERTEX_SHADER)!;
//     gl.shaderSource(vs, vsSource);
//     gl.compileShader(vs);
//     const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
//     gl.shaderSource(fs, fsSource);
//     gl.compileShader(fs);

//     const program = gl.createProgram()!;
//     gl.attachShader(program, vs);
//     gl.attachShader(program, fs);
//     gl.linkProgram(program);
//     gl.useProgram(program);

//     const vertices = new Float32Array([
//       -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1,
//       1,
//     ]);
//     const buffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//     const posLoc = gl.getAttribLocation(program, "a_position");
//     gl.enableVertexAttribArray(posLoc);
//     gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

//     const texLoc = gl.getAttribLocation(program, "a_texCoord");
//     gl.enableVertexAttribArray(texLoc);
//     gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

//     // THAM SỐ GỐC CHUẨN ĐỒ HỌA SCALAR ĐÃ ĐỒNG BỘ MƯỢT MÀ KHÔNG SỤP
//     const setUni = (name: string, val: number) =>
//       gl.uniform1f(gl.getUniformLocation(program, name), val);
//     setUni("u_seed", 0.0);
//     setUni("u_speed", 0.15);
//     setUni("u_loop", 0.0);
//     setUni("u_scale", 1.0);
//     setUni("u_turbAmp", 0.342);
//     setUni("u_turbFreq", 0.655);
//     setUni("u_turbIter", 5.0);
//     setUni("u_waveFreq", 2.222);
//     setUni("u_distBias", -0.171);
//     setUni("u_jellify", 1.0);
//     setUni("u_ditherMode", 2.0); // KÍCH HOẠT QUỐC BẢO: Đẩy về Mode 2.0 để sinh dải hạt sần thô ráp Grain
//     setUni("u_dither", 0.05); // Đặt mức dither nhẹ nhàng 0.05 giúp hạt bám màu mịn màng, triệt tiêu sọc gãy
//     setUni("u_exposure", 1.0);
//     setUni("u_contrast", 1.0);
//     setUni("u_saturation", 1.0);
//     gl.uniform1f(
//       gl.getUniformLocation(program, "u_pixelRatio"),
//       window.devicePixelRatio || 1,
//     );

//     const colorsLoc = gl.getUniformLocation(program, "u_colors");
//     const colorsLenLoc = gl.getUniformLocation(program, "u_colors_length");

//     const scalarExactTokens = [
//       [0.0039, 0.0, 0.0157, 1.0],
//       [0.0, 0.0314, 0.1804, 1.0],
//       [0.0, 0.1686, 0.5412, 1.0],
//       [0.0588, 0.3569, 1.0, 1.0],
//       [0.7294, 0.7961, 1.0, 1.0],
//       [1.0, 1.0, 1.0, 1.0],
//       [0.1098, 0.1098, 0.1216, 1.0],
//       [0.0, 0.0, 0.0, 1.0],
//     ];
//     const flatColors = new Float32Array(scalarExactTokens.flat());
//     gl.uniform4fv(colorsLoc, flatColors);
//     gl.uniform1i(colorsLenLoc, scalarExactTokens.length);

//     const resLoc = gl.getUniformLocation(program, "u_resolution");
//     const timeLoc = gl.getUniformLocation(program, "u_time");

//     const resize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       gl.viewport(0, 0, canvas.width, canvas.height);
//     };
//     window.addEventListener("resize", resize);
//     resize();

//     let animId: number;
//     const render = (time: number) => {
//       gl.uniform2f(resLoc, canvas.width, canvas.height);
//       gl.uniform1f(timeLoc, time * 0.001);
//       gl.drawArrays(gl.TRIANGLES, 0, 6);
//       animId = requestAnimationFrame(render);
//     };
//     animId = requestAnimationFrame(render);

//     return () => {
//       cancelAnimationFrame(animId);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   return (
//     <div className="relative min-h-screen w-screen overflow-hidden bg-[#010004]">
//       {/* CANVAS KHÔNG BỊ SỤP - CHẠY HẠT VÀ DẢI MÀU LOANG TUYỆT ĐỐI THEO VECTOR ĐỊNH HƯỚNG */}
//       <canvas ref={canvasRef} className="absolute inset-0 h-full w-full z-0" />
//       <div className="relative z-10 min-h-screen w-full"></div>
//     </div>
//   );
// }

// "use client";
// import { useEffect, useRef } from "react";

// export default function ScalarExactBackground() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const gl = canvas.getContext("webgl2");
//     if (!gl) {
//       console.error("WebGL2 không được hỗ trợ trên trình duyệt này.");
//       return;
//     }

//     // 1. VERTEX SHADER NGUYÊN BẢN
//     const vsSource = `#version 300 es
//       precision highp float;
//       in vec2 a_position;
//       in vec2 a_texCoord;
//       out vec2 v_uv;
//       void main() {
//         v_uv = a_texCoord;
//         gl_Position = vec4(a_position, 0.0, 1.0);
//       }
//     `;

//     // 2. FRAGMENT SHADER - ĐỒNG BỘ TOÀN DIỆN THUẬT TOÁN HẠT SIÊU MỊN CỦA SCALAR
//     const fsSource = `#version 300 es
//       precision highp float;
//       in vec2 v_uv;
//       out vec4 fragColor;
//       #define NUM_COLORS 8

//       uniform vec4 u_colors[NUM_COLORS];
//       uniform int u_colors_length;
//       uniform float u_seed;
//       uniform float u_speed;
//       uniform float u_loop;
//       uniform float u_scale;
//       uniform float u_turbAmp;
//       uniform float u_turbFreq;
//       uniform float u_turbIter;
//       uniform float u_waveFreq;
//       uniform float u_distBias;
//       uniform float u_jellify;
//       uniform float u_ditherMode;
//       uniform float u_dither;
//       uniform float u_exposure;
//       uniform float u_contrast;
//       uniform float u_saturation;
//       uniform float u_time;
//       uniform vec2 u_resolution;
//       uniform float u_pixelRatio;

//       const float GOLDEN_ANGLE = 2.3999632;
//       const float TAU = 6.28318530;

//       uvec3 hash3(uvec3 v) {
//         v = v * 1664525u + 1013904223u;
//         v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
//         v ^= v >> 16u;
//         v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
//         return v;
//       }

//       vec3 seedRandom(float seedVal) {
//         uvec3 s = uvec3(floatBitsToUint(seedVal), floatBitsToUint(seedVal * 1.5 + 7.31), floatBitsToUint(seedVal * 2.7 + 13.37));
//         s = hash3(s);
//         return vec3(s) / float(0xFFFFFFFFu);
//       }

//       vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
//       vec3 toSrgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(0.4545)); }

//       vec3 linearToOklab(vec3 c) {
//         float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
//         float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
//         float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
//         l = pow(max(l, 0.0), 1.0/3.0); m = pow(max(m, 0.0), 1.0/3.0); s = pow(max(s, 0.0), 1.0/3.0);
//         return vec3(0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
//       }

//       vec3 oklabToLinear(vec3 c) {
//         float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
//         float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
//         float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
//         l = l * l * l; m = m * m * m; s = s * s * s;
//         return vec3(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
//       }

//       vec3 oklabToLch(vec3 lab) { return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y)); }
//       vec3 lchToOklab(vec3 lch) { return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z)); }

//       vec3 mixLch(vec3 lab0, vec3 lab1, float t) {
//         vec3 lch0 = oklabToLch(lab0); vec3 lch1 = oklabToLch(lab1);
//         if (lch0.y < 0.05) lch0.z = lch1.z; if (lch1.y < 0.05) lch1.z = lch0.z;
//         float dh = lch1.z - lch0.z;
//         if (dh > 3.14159265) dh -= 6.28318530; if (dh < -3.14159265) dh += 6.28318530;
//         return lchToOklab(vec3(mix(lch0.x, lch1.x, t), mix(lch0.y, lch1.y, t), lch0.z + dh * t));
//       }

//       vec3 getColor(int idx) {
//         if (u_colors_length < 1) return vec3(0.0);
//         int safeIdx = clamp(idx, 0, u_colors_length - 1);
//         return u_colors[safeIdx].rgb;
//       }

//       vec3 paletteN(float t, int count) {
//         if (count < 1) return vec3(0.0); if (count < 2) return toLinear(getColor(0));
//         float segmentSize = 1.0 / float(count - 1);
//         t = clamp(t, 0.0, 1.0);
//         int idx = min(int(floor(t / segmentSize)), count - 2);
//         float localT = clamp((t - float(idx) * segmentSize) / segmentSize, 0.0, 1.0);
//         vec3 lab0 = linearToOklab(toLinear(getColor(idx)));
//         vec3 lab1 = linearToOklab(toLinear(getColor(idx + 1)));
//         return oklabToLinear(mixLch(lab0, lab1, localT));
//       }

//       float IGN(vec2 uv) { return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715)))); }
//       float quickNoise(vec2 I) { return fract(sin(dot(I, vec2(12.9898, 78.233))) * 43758.5453); }

//       float getDither(vec2 I, float mode) {
//         if (mode < 0.5) return 0.5;
//         if (mode < 1.5) return IGN(I);
//         return quickNoise(I);
//       }

//       vec3 softGamutMap(vec3 linearRgb) {
//         float maxC = max(linearRgb.r, max(linearRgb.g, linearRgb.b));
//         float minC = min(linearRgb.r, min(linearRgb.g, linearRgb.b));
//         if (minC >= 0.0 && maxC <= 1.0) return linearRgb;
//         vec3 lab = linearToOklab(max(linearRgb, 0.0));
//         float L = clamp(lab.x, 0.0, 1.0); float C = length(lab.yz); float h = atan(lab.z, lab.y);
//         float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));
//         if (C > maxChroma * 0.7) {
//           float knee = maxChroma * 0.7;
//           C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
//         }
//         return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
//       }

//       vec3 applyContrastSaturation(vec3 linearRgb, float contrast, float saturation) {
//         vec3 lab = linearToOklab(linearRgb);
//         float C = length(lab.yz); float h = atan(lab.z, lab.y);
//         lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
//         C *= saturation; lab.y = C * cos(h); lab.z = C * sin(h);
//         return oklabToLinear(lab);
//       }

//       void main() {
//         vec2 fragCoord = gl_FragCoord.xy; // GỐC: Chạy trực tiếp tọa độ màn hình thực tế không qua v_uv nhân phân giải
//         vec2 r = u_resolution * u_pixelRatio;
//         vec2 p = (fragCoord * 2.0 - r) / r.y;

//         p.y += 0.38;

//         int colorCount = u_colors_length;
//         if (colorCount < 1) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

//         float t = u_time * u_speed;

//         vec3 seedOffset = seedRandom(u_seed); vec3 seedOffset2 = seedRandom(u_seed + 100.0);
//         float seedAngle = u_seed * GOLDEN_ANGLE; vec2 seedPhase = (seedOffset2.xy - 0.5) * TAU;

//         float cs = cos(seedAngle); float sn = sin(seedAngle);
//         p = mat2(cs, -sn, sn, cs) * p;

//         // QUAN TRỌNG: Loại bỏ hàm floor() chia tỉ lệ rườm rà, bốc thẳng pixel gốc giúp hạt cát co nhỏ li ti mịn màng
//         float ditherVal = getDither(fragCoord, u_ditherMode);

//         float totalVal = 0.0; float totalWeight = 0.0;
//         int turbIter = int(u_turbIter);
//         float freq = 1.0 / max(u_turbFreq, 0.01);

//         for (float i = 0.0; i < 4.0; i++) {
//           float eph = i / 4.0;
//           vec2 q = p * u_scale;

//           q.x -= t * 0.8;
//           q.y += t * 0.2;

//           float sq = eph * eph;
//           float jellifyFactor = 1.0;
//           if (u_jellify > 0.5) { jellifyFactor = mix(1.0, 0.5, 1.0 - exp(sq * -1.0)); }
//           vec2 shiftedQ = vec2(q.x, q.y * jellifyFactor);

//           float a = seedPhase.x; float d = seedPhase.y;
//           for (int j = 2; j < 13; j++) {
//             if (j >= turbIter) break;
//             float fj = float(j);
//             shiftedQ += u_turbAmp * sin(vec2(shiftedQ.y, shiftedQ.x) / freq * fj + t * 2.2 + vec2(a, d) + seedOffset.xy * fj) / fj;
//             a += cos(fj + d * 1.2 + shiftedQ.x * 2.0 - t * 1.5 + seedOffset2.z);
//             d += sin(fj * shiftedQ.y + a + seedOffset.z + t * 1.8 + seedOffset2.y);
//           }
//           float v = 0.5 + 0.5 * sin(length(vec2(shiftedQ.y, shiftedQ.x) + vec2(a, d) * 0.2) * u_waveFreq + i * i + seedOffset.x);
//           float weight = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
//           totalVal += v * weight; totalWeight += weight;
//         }
//         float val = totalVal / totalWeight;
//         val = clamp((val - 0.3) / 0.4, 0.0, 1.0);
//         val = pow(val, exp(-u_distBias));

//         // Trộn hạt cát thô ráp bám phủ đồng điệu
//         val = clamp(val + (ditherVal - 0.5) * u_dither, 0.0, 1.0);

//         vec3 col = paletteN(val, colorCount);
//         col *= u_exposure;
//         col = applyContrastSaturation(col, u_contrast, u_saturation);
//         col = softGamutMap(col);
//         col = toSrgb(col);
//         fragColor = vec4(col, 1.0);
//       }
//     `;

//     const vs = gl.createShader(gl.VERTEX_SHADER)!;
//     gl.shaderSource(vs, vsSource);
//     gl.compileShader(vs);
//     const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
//     gl.shaderSource(fs, fsSource);
//     gl.compileShader(fs);
//     const program = gl.createProgram()!;
//     gl.attachShader(program, vs);
//     gl.attachShader(program, fs);
//     gl.linkProgram(program);
//     gl.useProgram(program);

//     const vertices = new Float32Array([
//       -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1,
//       1,
//     ]);
//     const buffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//     const posLoc = gl.getAttribLocation(program, "a_position");
//     gl.enableVertexAttribArray(posLoc);
//     gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

//     const texLoc = gl.getAttribLocation(program, "a_texCoord");
//     gl.enableVertexAttribArray(texLoc);
//     gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

//     // FIX UNIFORMS: Đưa ditherMode về 2.0 để lấy Grain gốc mảnh mai nhất
//     const setUni = (name: string, val: number) =>
//       gl.uniform1f(gl.getUniformLocation(program, name), val);
//     setUni("u_seed", 0.0);
//     setUni("u_speed", 0.15);
//     setUni("u_loop", 0.0);
//     setUni("u_scale", 1.0);
//     setUni("u_turbAmp", 0.342);
//     setUni("u_turbFreq", 0.655);
//     setUni("u_turbIter", 5.0);
//     setUni("u_waveFreq", 2.222);
//     setUni("u_distBias", -0.171);
//     setUni("u_jellify", 1.0);
//     setUni("u_ditherMode", 2.0); // <--- BẬT ĐÚNG CHẾ ĐỘ GRAIN GỐC CỦA ĐỒ HỌA
//     setUni("u_dither", 0.075); // <--- ĐIỀU CHỈNH ĐỘ ĐẬM MỊN: Để 0.075 là cát bám cực kỳ tinh tế không loang sọc
//     setUni("u_exposure", 1.0);
//     setUni("u_contrast", 1.0);
//     setUni("u_saturation", 1.0);
//     gl.uniform1f(
//       gl.getUniformLocation(program, "u_pixelRatio"),
//       window.devicePixelRatio || 1,
//     );

//     const colorsLoc = gl.getUniformLocation(program, "u_colors");
//     const colorsLenLoc = gl.getUniformLocation(program, "u_colors_length");

//     const scalarExactTokens = [
//       [0.0039, 0.0, 0.0157, 1.0],
//       [0.0, 0.0314, 0.1804, 1.0],
//       [0.0, 0.1686, 0.5412, 1.0],
//       [0.0588, 0.3569, 1.0, 1.0],
//       [0.7294, 0.7961, 1.0, 1.0],
//       [1.0, 1.0, 1.0, 1.0],
//       [0.1098, 0.1098, 0.1216, 1.0],
//       [0.0, 0.0, 0.0, 1.0],
//     ];
//     const flatColors = new Float32Array(scalarExactTokens.flat());
//     gl.uniform4fv(colorsLoc, flatColors);
//     gl.uniform1i(colorsLenLoc, scalarExactTokens.length);

//     const resLoc = gl.getUniformLocation(program, "u_resolution");
//     const timeLoc = gl.getUniformLocation(program, "u_time");

//     const resize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       gl.viewport(0, 0, canvas.width, canvas.height);
//     };
//     window.addEventListener("resize", resize);
//     resize();

//     let animId: number;
//     const render = (time: number) => {
//       gl.uniform2f(resLoc, canvas.width, canvas.height);
//       gl.uniform1f(timeLoc, time * 0.001);
//       gl.drawArrays(gl.TRIANGLES, 0, 6);
//       animId = requestAnimationFrame(render);
//     };
//     animId = requestAnimationFrame(render);

//     return () => {
//       cancelAnimationFrame(animId);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   return (
//     <div className="relative min-h-screen w-screen overflow-hidden">
//       <canvas ref={canvasRef} className="absolute inset-0 h-full w-full z-0" />
//       <div className="relative z-10 min-h-screen w-full"></div>
//     </div>
//   );
// }
// [src/app/page.js] - Landing Page sử dụng background động

// [src/app/page.tsx] - Landing Page utilizing the dynamic background

// import FluidBackground from "@/components/FluidBackground";
// import { JSX } from "react/jsx-runtime";

// export default function Home(): JSX.Element {
//   return (
//     <main className="relative min-h-screen text-white bg-black/20 font-sans overflow-x-hidden">
//       {/* Background chạy bằng WebGL Shader siêu mượt và Framer Motion fade-in */}
//       <FluidBackground />

//       {/* Content đè lên trên background fixed */}
//       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
//         <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl drop-shadow-lg text-slate-100">
//           Tranvux
//         </h1>
//         <p className="mt-6 text-xl text-slate-200 max-w-lg drop-shadow hover:text-white transition cursor-default">
//           Hiệu ứng sinh động mượt mà sử dụng Coarse Grain Shader thô-hạt kịch
//           tính, hoàn tất chuyển đổi sang TypeScript.
//         </p>
//         {/* <button className="mt-10 px-8 py-3 bg-white text-blue-800 rounded-full font-bold text-lg hover:bg-slate-100 transition duration-300 transform hover:scale-105 shadow-xl">
//          Hello
//         </button> */}
//       </div>
//     </main>
//   );
// }

// [src/app/page.tsx] - Landing Page utilizing the dynamic background

import FluidBackground from "@/components/FluidBackground";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative  text-white  font-sans overflow-x-hidden">
      {/* Background chạy bằng WebGL Shader siêu mượt và Framer Motion fade-in */}

      <FluidBackground />

      {/* Content đè lên trên background fixed */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl drop-shadow-lg text-slate-100">
          Film Grain
        </h1>
        <p className="mt-6 text-xl text-slate-200 max-w-lg drop-shadow">
          Film Grain / Noise Animation
        </p>
        <Button variant="default">Get Started</Button>
      </div>
    </main>
  );
}

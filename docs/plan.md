# SAAS ARCHITECTURE & BUSINESS PLAN: MICRO-LANDING BUILDER

Tài liệu thiết kế hệ thống, tối ưu hóa hiệu năng đồ họa và chiến lược phát triển sản phẩm SaaS dành cho Tech Lead.

- **Stack áp dụng:** Next.js (Frontend/Editor) + Golang (Core API/Automation) + Supabase (PostgreSQL).

---

## PHẦN 1: BẢO MẬT FRONTEND & CHỐNG ĐÁNH CẮP CHẤT XÁM

Bản chất của Client-Side Web là phải trả mã nguồn về trình duyệt, nên mục tiêu ở đây là **tối đa hóa độ khó (Obfuscation)** để chặn AI dịch ngược hoặc chặn dev vặt copy dạo.

### 1. Mã hóa Tailwind ClassName thành Chuỗi Băm (Hashed Classes)

Sử dụng plugin `postcss-hashed-classnames` để quét toàn bộ file CSS sau khi Tailwind build, cấu hình webpack đổi tên các class tường minh thành mã băm ngẫu nhiên.

- Cấu hình file `postcss.config.js`:
  ```javascript
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      "postcss-hashed-classnames": {
        template: "[hash:base64:5]", // Biến 'flex items-center' thành 'a1b2c x9z8y'
        ignorePattern: /^nextjs-/,
      },
    },
  };
  ```

### 2. Chặn Tương Tác DevTools Của Newbie (Anti-F12 Script)

Chèn đoạn script Client-Side này vào file `layout.js` (hoặc bọc ngoài trang global) để vô hiệu hóa các phím tắt và menu chuột phải cơ bản.

```javascript
"use client";
import { useEffect } from "react";

export default function AntiF12() {
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.keyCode === 123 || // Chặn phím F12
        (e.ctrlKey &&
          e.shiftKey &&
          (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)) || // Ctrl+Shift+I/C/J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U (Xem source)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return null;
}
```

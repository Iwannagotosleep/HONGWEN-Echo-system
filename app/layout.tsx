import React from 'react';

export const metadata = {
  title: 'ECHO 校园诉求与回音壁',
  description: '100% 匿名保护 · 6位专属查询码 · 多部门限时流转公示',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
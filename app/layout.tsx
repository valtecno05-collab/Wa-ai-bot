import React from 'react';

export const metadata = {
  title: 'WhatsApp AI Dashboard',
  description: 'Liquid Glass AI WhatsApp Gateway Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  title: "L3DX — 3D принтиране по поръчка",
  description: "Услуги за 3D печат и малки серии. PLA, PETG, ABS, ASA, TPU.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <head>
        {/* Tailwind via CDN for zero-config styling */}
        <script src="https://cdn.tailwindcss.com"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}

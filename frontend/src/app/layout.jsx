import './globals.css';

export const metadata = {
  title: 'Try Map Feature',
  description: 'Map-focused event exploration app shell'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

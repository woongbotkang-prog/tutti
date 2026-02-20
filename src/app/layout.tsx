import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://tutti-kohl.vercel.app'),
  title: {
    template: '%s | TUTTI - 클래식 연주자 매칭',
    default: 'TUTTI - 클래식 연주자 매칭',
  },
  description: "클래식 연주자를 위한 매칭 플랫폼. 함께 연주할 동료를 찾아보세요.",
  keywords: ['클래식', '연주자', '악기', '매칭', '음악', '협주', '실내악'],
  authors: [{ name: 'TUTTI' }],
  creator: 'TUTTI',
  publisher: 'TUTTI',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://tutti-kohl.vercel.app',
    siteName: 'TUTTI - 클래식 연주자 매칭',
    title: 'TUTTI - 클래식 연주자 매칭',
    description: '클래식 연주자를 위한 매칭 플랫폼. 함께 연주할 동료를 찾아보세요.',
    images: [
      {
        url: 'https://tutti-kohl.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TUTTI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TUTTI - 클래식 연주자 매칭',
    description: '클래식 연주자를 위한 매칭 플랫폼. 함께 연주할 동료를 찾아보세요.',
    images: ['https://tutti-kohl.vercel.app/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TUTTI',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'TUTTI',
              description: '클래식 연주자를 위한 매칭 플랫폼',
              url: 'https://tutti-kohl.vercel.app',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://tutti-kohl.vercel.app/musicians?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

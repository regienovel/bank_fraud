import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from './ClientLayout'

export const metadata: Metadata = {
  title: 'AI Fraud Detection — Live Demo',
  description:
    'AI-powered banking transaction fraud detection demo for Ghana. Real-time transaction monitoring, risk scoring, and fraud pattern detection — inspired by Mastercard Decision Intelligence.',
  keywords: [
    'fraud detection',
    'AI',
    'banking',
    'Ghana',
    'machine learning',
    'transaction monitoring',
    'risk scoring',
  ],
  authors: [{ name: 'FraudShield AI' }],
  openGraph: {
    title: 'AI Fraud Detection — Live Demo',
    description:
      'Watch AI detect banking fraud in real time. Live transaction monitoring with risk scoring across Ghana\'s financial landscape.',
    type: 'website',
    locale: 'en_GH',
    siteName: 'FraudShield AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Fraud Detection — Live Demo',
    description:
      'Watch AI detect banking fraud in real time. Live transaction monitoring with risk scoring across Ghana\'s financial landscape.',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

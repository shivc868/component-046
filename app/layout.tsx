import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GSAP ScrollTrigger Image Fold Animation — Made for Award',
  description: 'A scroll gallery where each image folds open with GSAP ScrollTrigger and SplitText titles, with Lenis smooth scroll.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;450;500;600&display=swap" />
      </head>
      <body className="bg-[#0a0a0b] antialiased">{children}</body>
    </html>
  )
}

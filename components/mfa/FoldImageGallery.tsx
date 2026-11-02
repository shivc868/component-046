'use client'

import {useEffect} from 'react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import FoldItem, {type FoldOptions, type FoldProject} from './fold-image-gallery/FoldItem'
import './fold-image-gallery.css'

gsap.registerPlugin(ScrollTrigger)

const img = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=1600&auto=format&fit=crop`

export const DEFAULT_PROJECTS: FoldProject[] = [
  {
    title: 'Glass Ledger',
    text: 'A bank headquarters stacked as five tilted boxes, each turned to catch the low winter sun across the harbour.',
    image: img('1487958449943-2429e8be8625'),
    alt: 'White angular building with glass boxes against a pale sky',
    meta: [
      ['Location', 'Copenhagen'],
      ['Year', '2025'],
      ['Area', '41,000 m²'],
    ],
  },
  {
    title: 'Tidal Rings',
    text: 'Two residential towers wrapped in continuous balconies that pull apart at the top and frame the sky between them.',
    image: img('1518005020951-eccb494ad742'),
    alt: 'Two curving blue and white towers seen from below',
    meta: [
      ['Location', 'Rotterdam'],
      ['Year', '2024'],
      ['Area', '28,500 m²'],
    ],
  },
  {
    title: 'Fog Index',
    text: 'A study of the financial district on its forty foggiest mornings, measuring how much of each tower the weather keeps.',
    image: img('1449157291145-7efd050a4d0e'),
    alt: 'Dark glass skyscrapers disappearing into fog',
    meta: [
      ['Location', 'Toronto'],
      ['Year', '2024'],
      ['Type', 'Research'],
    ],
  },
  {
    title: 'Dusk House',
    text: 'A family house of blackened timber, planned around one old oak and a kitchen that glows when the garden goes dark.',
    image: img('1600585154340-be6161a56a0c'),
    alt: 'Modern dark timber house lit from inside at dusk, under a large tree',
    meta: [
      ['Location', 'Melbourne'],
      ['Year', '2023'],
      ['Area', '310 m²'],
    ],
  },
  {
    title: 'Quiet Rooms',
    text: 'A flat renovation that took out three walls and added nothing back: herringbone oak, north light, one blue sofa.',
    image: img('1493809842364-78817add7ffb'),
    alt: 'Bright living room with herringbone floor and a blue sofa',
    meta: [
      ['Location', 'Berlin'],
      ['Year', '2023'],
      ['Area', '96 m²'],
    ],
  },
]

export type FoldImageGalleryProps = {
  projects?: FoldProject[]
  /** Creates a Lenis smooth-scroll instance. Turn off if your site already runs one. */
  smoothScroll?: boolean
  className?: string
} & FoldOptions

/**
 * A list of projects that alternate left and right. Each picture is folded
 * into strips like a sheet of paper and unfolds as it scrolls into view;
 * its caption lines rise out of masks in a stagger. Two columns from 1024px;
 * phones and portrait tablets stack the caption under the picture.
 * Font: Inter Tight.
 */
export default function FoldImageGallery({
  projects = DEFAULT_PROJECTS,
  smoothScroll = true,
  strips,
  angle,
  className = '',
}: FoldImageGalleryProps) {
  useEffect(() => {
    if (!smoothScroll || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [smoothScroll])

  return (
    <section
      className={`bg-[var(--fold-stage)] px-[var(--fold-gap)] text-[var(--fold-ink)] antialiased [--fold-gap:1.25rem] [--fold-ink:#f2f0ed] [--fold-muted:rgb(242_240_237/0.5)] [--fold-perspective:1800px] [--fold-radius:0.875rem] [--fold-rule:rgb(242_240_237/0.12)] [--fold-stage:#0a0a0b] [font-family:'Inter_Tight',sans-serif] max-md:[--fold-gap:0.75rem] max-md:[--fold-radius:0.625rem] md:max-lg:[--fold-gap:2rem] ${className}`}
    >
      <div className="mx-auto grid max-w-[90rem] gap-y-[clamp(6rem,24vh,15rem)] pt-[clamp(8rem,55vh,30rem)] pb-[clamp(6rem,22vh,14rem)]">
        {projects.map((project, i) => (
          <FoldItem
            key={project.title}
            project={project}
            index={i}
            total={projects.length}
            flip={i % 2 === 1}
            strips={strips}
            angle={angle}
          />
        ))}
      </div>
    </section>
  )
}

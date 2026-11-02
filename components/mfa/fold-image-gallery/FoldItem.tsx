'use client'

import {useCallback, useRef} from 'react'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {SplitText} from 'gsap/SplitText'
import {CustomEase} from 'gsap/CustomEase'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase)

export type FoldProject = {
  title: string
  text: string
  image: string
  alt: string
  /** label → value rows under the text, e.g. Location, Year */
  meta: [string, string][]
}

export type FoldOptions = {
  /** strips the picture is folded into (3–12) */
  strips?: number
  /** how far each crease is folded when closed, in degrees (10–85) */
  angle?: number
}

/* Each strip starts unfolding a little after the one above it and takes
   SPAN of the whole progress, so the paper opens in a ripple. */
const SPAN = 0.42
const BREATH = 7 // degrees each crease opens on hover
const MAX_SHADE = 0.5
const MAX_LIGHT = 0.16

CustomEase.create('fold-signature', '0.625, 0.05, 0, 1')
CustomEase.create('fold-reveal', '0.16, 1, 0.3, 1')

/** Callback refs for a mapped list; `list()` returns the mounted elements in order. */
function useListRefs<T extends Element>() {
  const items = useRef<(T | null)[]>([])
  const set = useCallback(
    (i: number) => (el: T | null) => {
      items.current[i] = el
    },
    [],
  )
  const list = useCallback(() => items.current.filter((el): el is T => el != null), [])
  return [set, list] as const
}

/** The strips, each nested in the one above (that nesting is what folds). */
function Strips({
  i,
  count,
  src,
  setStrip,
  setShade,
}: {
  i: number
  count: number
  src: string
  setStrip: (i: number) => (el: HTMLDivElement | null) => void
  setShade: (i: number) => (el: HTMLDivElement | null) => void
}) {
  if (i >= count) return null
  return (
    <div ref={setStrip(i)} className="fold-strip" style={{['--i' as string]: i}}>
      <div className="fold-face">
        <img src={src} alt="" decoding="async" className="fold-face-image" />
        {/* faces tilted towards the light get a highlight, the others a shadow */}
        <div ref={setShade(i)} className={`pointer-events-none absolute inset-0 opacity-0 ${i % 2 ? 'bg-black' : 'bg-white'}`} />
      </div>
      <Strips i={i + 1} count={count} src={src} setStrip={setStrip} setShade={setShade} />
    </div>
  )
}

/**
 * One project: a picture folded into strips that unfold as it scrolls into
 * view (and breathe open a little on hover), next to a caption whose lines
 * rise out of masks in a stagger. `flip` puts the picture on the right.
 */
export default function FoldItem({
  project,
  index,
  total,
  flip,
  strips = 6,
  angle = 72,
}: {project: FoldProject; index: number; total: number; flip: boolean} & FoldOptions) {
  const root = useRef<HTMLElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const caption = useRef<HTMLElement>(null)
  const [setStrip, stripEls] = useListRefs<HTMLDivElement>()
  const [setShade, shadeEls] = useListRefs<HTMLDivElement>()
  const [setText, textEls] = useListRefs<HTMLElement>()

  const count = gsap.utils.clamp(3, 12, strips)
  const fold = gsap.utils.clamp(10, 85, angle)
  const pad = (n: number) => String(n).padStart(2, '0')

  useGSAP(
    () => {
      const {clamp, mapRange} = gsap.utils
      const ease = gsap.parseEase('fold-signature')
      const lag = (1 - SPAN) / (count - 1)
      const setRotation = stripEls().map((el) => gsap.quickSetter(el, 'rotationX', 'deg'))
      const setShadeOpacity = shadeEls().map((el) => gsap.quickSetter(el, 'opacity'))
      const state = {fold: 1, hover: 0}

      // Absolute angles zigzag (+a, −a, +a …). Each strip applies only the
      // difference from its parent, because the parent's rotation is inherited.
      const render = () => {
        const open = 1 - state.fold
        let previous = 0
        for (let i = 0; i < count; i++) {
          const start = i * lag
          const local = ease(clamp(0, 1, mapRange(start, start + SPAN, 0, 1, open)))
          const side = i % 2 ? -1 : 1
          const absolute = side * (fold * (1 - local) + BREATH * state.hover)
          setRotation[i](absolute - previous)
          setShadeOpacity[i](Math.abs(Math.sin((absolute * Math.PI) / 180)) * (side > 0 ? MAX_LIGHT : MAX_SHADE))
          previous = absolute
        }
      }

      const mm = gsap.matchMedia()
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
          hover: '(hover: hover) and (pointer: fine)',
        },
        ({conditions}) => {
          if (conditions?.reduced) {
            state.fold = 0
            state.hover = 0
            render()
            return
          }

          state.fold = 1
          render()
          gsap.to(state, {
            fold: 0,
            ease: 'none',
            onUpdate: render,
            scrollTrigger: {trigger: media.current, start: 'top 75%', end: 'center 45%', scrub: 0.8},
          })

          // index, title, text and every meta row: lines rise out of their
          // masks in one cascade
          const split = SplitText.create(textEls(), {
            type: 'lines',
            mask: 'lines',
            linesClass: 'fold-line',
            aria: 'none',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1,
                ease: 'fold-reveal',
                stagger: 0.06,
                scrollTrigger: {trigger: caption.current, start: 'top 72%', toggleActions: 'play none none reverse'},
              }),
          })

          const el = media.current
          const breathe = (value: number) => () =>
            gsap.to(state, {
              hover: value,
              duration: 0.9,
              ease: value ? 'fold-reveal' : 'fold-signature',
              overwrite: 'auto',
              onUpdate: render,
            })
          const open = breathe(1)
          const close = breathe(0)
          if (conditions?.hover && el) {
            el.addEventListener('pointerenter', open)
            el.addEventListener('pointerleave', close)
          }

          return () => {
            split.revert()
            el?.removeEventListener('pointerenter', open)
            el?.removeEventListener('pointerleave', close)
          }
        },
      )
    },
    {scope: root, dependencies: [count, fold]},
  )

  return (
    <figure ref={root} className="m-0 grid grid-cols-1 items-end gap-y-5 lg:grid-cols-12 lg:gap-x-[var(--fold-gap)]">
      <div
        ref={media}
        role="img"
        aria-label={project.alt}
        className={`fold-media relative aspect-[16/10] [perspective-origin:50%_0%] [perspective:var(--fold-perspective)] lg:row-start-1 ${
          flip ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-7 lg:col-start-1'
        }`}
        style={{['--fold-count' as string]: count}}
      >
        <Strips i={0} count={count} src={project.image} setStrip={setStrip} setShade={setShade} />
      </div>

      <figcaption
        ref={caption}
        className={`grid gap-4 max-lg:max-w-[36rem] lg:row-start-1 ${flip ? 'lg:col-span-4 lg:col-start-1' : 'lg:col-span-4 lg:col-start-9'}`}
      >
        <span ref={setText(0)} className="text-[0.75rem] tracking-[0.01em] tabular-nums text-[var(--fold-muted)]">
          {pad(index + 1)} / {pad(total)}
        </span>
        <h2 ref={setText(1)} className="m-0 text-[clamp(2.25rem,4.6vw,4.75rem)] leading-[0.9] font-medium tracking-[-0.045em]">
          {project.title}
        </h2>
        <p ref={setText(2)} className="m-0 max-w-[34ch] text-[0.95rem] leading-[1.5] text-[var(--fold-muted)]">
          {project.text}
        </p>
        <dl className="m-0 mt-2 grid border-t border-[var(--fold-rule)] text-[0.8rem]">
          {/* label and value are split on their own, so the row keeps its layout */}
          {project.meta.map(([label, value], m) => (
            <div key={label} className="flex justify-between gap-4 border-b border-[var(--fold-rule)] py-2.5">
              <dt ref={setText(3 + m * 2)} className="text-[var(--fold-muted)]">
                {label}
              </dt>
              <dd ref={setText(4 + m * 2)} className="m-0 text-right">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  )
}

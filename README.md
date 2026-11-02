# GSAP ScrollTrigger Image Fold Animation

A scroll gallery where each image folds open with GSAP ScrollTrigger and SplitText titles, with Lenis smooth scroll.

Free and open source, from [Made for Award](https://www.madeforaward.com/collections/component-0046/gsap-scrolltrigger-image-fold-animation-splittext-nextjs/code) — live preview and copy-paste code on the site.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Use it in your project

Copy these into your Next.js / React + Tailwind CSS v4 project:

- `components/mfa/FoldImageGallery.tsx`
- `components/mfa/fold-image-gallery.css`
- `components/mfa/fold-image-gallery/FoldItem.tsx`

Install the dependencies:

```bash
npm install gsap @gsap/react lenis
```

Then:

```tsx
import FoldImageGallery from '@/components/mfa/FoldImageGallery'

export default function Page() {
  return <FoldImageGallery smoothScroll />
}
```

## License

MIT — use it in personal and client work. Images are from Unsplash and load remotely.

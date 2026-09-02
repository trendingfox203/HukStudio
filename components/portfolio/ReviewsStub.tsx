import Image from "next/image";

export type DisplayReview = {
  id: string;
  quote: string;
  author: string;
  platform: string;
  rating: number;
  avatarSrc: string;
};

function ReviewCard({ review }: { review: DisplayReview }) {
  return (
    <div className="relative w-[85%] shrink-0 snap-start overflow-hidden bg-[#2a2827] px-8 py-10 sm:w-[420px]">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2 left-4 -z-0 line-clamp-1 max-w-full overflow-hidden font-serif text-7xl font-bold whitespace-nowrap text-white/5 uppercase"
      >
        {review.platform}
      </span>

      <div className="relative flex items-start justify-between gap-4">
        <p className="font-serif text-xl font-bold tracking-wide text-[#c9a876] uppercase">
          {review.platform}
        </p>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[#c9a876]">
          <Image src={review.avatarSrc} alt={review.author} fill className="object-cover" />
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2">
        <span className="text-sm text-white/90">{review.author}</span>
        <span className="text-sm tracking-widest text-[#c9a876]">
          {"★".repeat(review.rating)}
        </span>
      </div>

      <p className="relative mt-6 line-clamp-6 text-sm leading-relaxed text-white/85">
        {review.quote}
      </p>

      <p className="relative mt-8 text-[10px] tracking-[0.3em] text-white/40 uppercase">Review</p>
    </div>
  );
}

export default function ReviewsStub({ reviews }: { reviews: DisplayReview[] }) {
  return (
    <section id="reviews" className="scroll-mt-20 px-6 py-16 sm:px-12">
      <h2 className="mb-12 text-center font-serif text-3xl font-semibold text-[#3d3d3d] uppercase sm:text-6xl md:text-[78px] lg:text-[82px]">
        Reviews
      </h2>
      <div className="mx-auto flex max-w-5xl snap-x gap-8 overflow-x-auto pb-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

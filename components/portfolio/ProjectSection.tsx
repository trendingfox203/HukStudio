import ProjectCard, { type DisplayProjectItem } from "@/components/portfolio/ProjectCard";
import Reveal from "@/components/common/Reveal";

export default function ProjectSection({
  id,
  heading,
  items,
}: {
  id: string;
  heading: string;
  items: DisplayProjectItem[];
}) {
  return (
    <section id={id} className="scroll-mt-20 px-6 py-16 sm:px-12">
      <h2 className="mb-12 text-center font-serif text-3xl font-semibold text-[#3d3d3d] uppercase sm:text-6xl md:text-[78px] lg:text-[82px]">
        {heading}
      </h2>
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-x-[76px] gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={item.id} delay={(index % 3) * 120}>
            <ProjectCard item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

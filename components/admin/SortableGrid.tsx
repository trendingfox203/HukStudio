"use client";

import { useId, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`touch-none ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      {children}
    </li>
  );
}

export type SortableEntry = { id: string; node: React.ReactNode };

export default function SortableGrid({
  items,
  onReorder,
  className = "",
  layout = "grid",
}: {
  items: SortableEntry[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  className?: string;
  layout?: "grid" | "list";
}) {
  const dndId = useId();
  const [prevItems, setPrevItems] = useState(items);
  const [ordered, setOrdered] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setOrdered(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((i) => i.id === active.id);
    const newIndex = ordered.findIndex((i) => i.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    onReorder(next.map((i) => i.id));
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={ordered.map((i) => i.id)}
        strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <ul className={className}>
          {ordered.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {item.node}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

import { ReactNode } from "react";

interface CardCarouselProps {
  children: ReactNode[];
  ariaLabel?: string;
}

/**
 * Carrossel horizontal (swipe) usado só no mobile para grids de cards da landing —
 * evita empilhar 4+ cards na vertical sem cortar nenhum conteúdo (TASK-126).
 * No desktop o grid original continua sendo usado (este componente fica oculto via d-md-none).
 */
export default function CardCarousel({ children, ariaLabel = "Mais itens — deslize para o lado" }: CardCarouselProps) {
  return (
    <div
      className="card-carousel d-flex d-md-none"
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      style={{
        gap: 16,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        scrollPaddingInline: 4,
        WebkitOverflowScrolling: "touch",
        paddingBottom: 8,
      }}
    >
      {children.map((child, index) => (
        <div
          key={index}
          style={{ flex: "0 0 85%", minWidth: 0, scrollSnapAlign: "start" }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

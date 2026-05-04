type Variant = "horizontal" | "icon" | "stacked";

const DEFAULTS: Record<Variant, { width: number; height: number }> = {
  horizontal: { width: 210, height: 44 },
  icon: { width: 40, height: 40 },
  stacked: { width: 160, height: 84 },
};

interface BrandLogoProps {
  variant?: Variant;
  width?: number;
  height?: number;
  priority?: boolean;
  alt?: string;
  className?: string;
}

export default function BrandLogo({
  variant = "horizontal",
  width,
  height,
  priority,
  alt = "Easy Maintenance",
  className,
}: BrandLogoProps) {
  const { width: defaultWidth, height: defaultHeight } = DEFAULTS[variant];
  const w = width ?? defaultWidth;
  const h = height ?? defaultHeight;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/brand/logos/logo-${variant}.svg`}
      alt={alt}
      width={w}
      height={h}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ display: "block", objectFit: "contain" }}
      className={className}
    />
  );
}

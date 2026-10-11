/* eslint-disable @next/next/no-img-element -- these are fixed-size design assets
   exported from Figma, not content images; next/image would add a request
   pipeline around a 300-byte inline-able SVG for no benefit. */

type IconProps = {
  /** File name inside /public/icons, without the extension. */
  name: string;
  /** Rendered at the asset's own intrinsic size from the design. */
  size: number;
  width?: number;
  className?: string;
};

export function Icon({ name, size, width, className }: IconProps) {
  return (
    <img
      src={`/icons/${name}.svg`}
      alt=""
      aria-hidden="true"
      width={width ?? size}
      height={size}
      className={className}
    />
  );
}

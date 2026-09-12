export function Logo({ size = 64 }: { size?: number }) {
  return (
    <img
      src="/icon.png"
      alt="Professionle"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="rounded-xl"
    />
  );
}
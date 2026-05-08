const cells = Array.from({ length: 96 }, (_, index) => index);

export function GridHoverEffect() {
  return (
    <div className="grid-hover-effect" aria-hidden="true">
      {cells.map((cell) => (
        <span className="grid-hover-effect__cell" key={cell} />
      ))}
    </div>
  );
}

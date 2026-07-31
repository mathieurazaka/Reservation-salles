const VARIANTS = {
  primary: "btn btn-primary",
  outline: "btn btn-outline",
  green: "btn btn-green",
  redOutline: "btn btn-red-outline",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button className={`${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default function Title({
  title,
  subtitle,
  wrapperClass = "flex flex-col text-black ml-3",
  titleClass = "text-sm font-bold",
  subtitleClass = "text-[6px] italic",
}) {
  return (
    <div className={wrapperClass}>
      <h1 className={titleClass}>{title}</h1>
      {subtitle && <h2 className={subtitleClass}>{subtitle}</h2>}
    </div>
  );
}

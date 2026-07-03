import backgroundImage from "../assets/images/background.png";

// AuthLayout: chỉ cung cấp nền, children bám trực tiếp lên
// AuthLayout: background only, children render directly on top — no extra layers
export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Nền duy nhất, nằm sau tất cả — Single background, behind everything */}
      <img
        src={backgroundImage}
        alt="Background"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />

      {/* Children bám thẳng lên nền — Children sit directly on background */}
      {children}
    </div>
  );
}

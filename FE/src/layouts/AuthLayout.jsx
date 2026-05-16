import backgroundImage from "../assets/images/background.png";
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative w-full">
      <img
        src={backgroundImage}
        alt="Background"
        className="w-full object-cover h-screen absolute top-0 left-0 -z-10"
      />
      {children}
    </div>
  );
}

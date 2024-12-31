export default function Card({ children, className = "", noPad = false }) {
  return (
    <div className={`card ${noPad ? "p-0" : "p-5"} ${className}`}>
      {children}
    </div>
  );
}

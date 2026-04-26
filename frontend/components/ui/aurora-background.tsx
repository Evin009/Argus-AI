import { type ReactNode } from "react";

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function AuroraBackground({
  children,
  className = "",
}: AuroraBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="aurora-blob-1 absolute left-1/4 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/4 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, #ecbca7 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="aurora-blob-2 absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, #634131 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="aurora-blob-3 absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, #4e453e 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      </div>
      {children}
    </div>
  );
}

export function BackgroundGradient() {
  return (
    <div className="-z-10 absolute inset-0 overflow-hidden bg-gray-950 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem]">
      <svg
        className="-bottom-48 lg:-right-40 absolute left-[-40%] h-[80rem] w-[180%] lg:top-[-40%] lg:bottom-auto lg:left-auto lg:h-[180%] lg:w-[80rem]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={"glow-desktop"} cx="100%">
            <stop offset="0%" stopColor="rgba(255, 0, 0, 0.3)" />
            <stop offset="53.95%" stopColor="rgba(255, 0, 0, 0.09)" />
            <stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
          </radialGradient>
          <radialGradient id={"glow-mobile"} cy="100%">
            <stop offset="0%" stopColor="rgba(255, 0, 0, 0.3)" />
            <stop offset="53.95%" stopColor="rgba(255, 0, 0, 0.09)" />
            <stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
          </radialGradient>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={"url(#glow-desktop)"}
          className="hidden lg:block"
        />
        <rect
          width="100%"
          height="100%"
          fill={"url(#glow-mobile)"}
          className="lg:hidden"
        />
      </svg>
      <div className="absolute inset-x-0 right-0 bottom-0 h-px bg-white mix-blend-overlay lg:top-0 lg:left-auto lg:h-auto lg:w-px" />
    </div>
  );
}

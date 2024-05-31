import { Button } from "~/ui/button";
import { Link } from "~/ui/link";
import { Logo } from "~/ui/logo";

export function Hero(props: Readonly<{ children?: React.ReactNode }>) {
  return (
    <>
      <div>
        <Link href="/" className="flex items-center gap-2">
          <Logo className="inline-block h-8 w-auto" />
          <span className="font-cal text-3xl text-white tracking-tight">
            Time Report
          </span>
        </Link>
      </div>

      <h1 className="mt-14 font-display font-light text-4xl/tight text-white">
        Time Reporting App <br />
        <span className="text-red-300">for indie contractors</span>
      </h1>

      <p className="mt-4 text-gray-300 text-sm/6">
        Time Report is a lightweight, simple time tracking app for indie
        contractors who needs to track time for many clients.
      </p>

      {props.children}
    </>
  );
}

export function Footer() {
  return (
    <p className="flex items-center gap-x-2 text-[0.8125rem]/6 text-gray-500">
      Brought to you by{" "}
      <Button asChild variant={"ghost"}>
        <Link href="https://x.com/jullerino">
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mr-2 size-4 fill-current"
          >
            <path d="M9.51762 6.77491L15.3459 0H13.9648L8.90409 5.88256L4.86212 0H0.200195L6.31244 8.89547L0.200195 16H1.58139L6.92562 9.78782L11.1942 16H15.8562L9.51728 6.77491H9.51762ZM7.62588 8.97384L7.00658 8.08805L2.07905 1.03974H4.20049L8.17706 6.72795L8.79636 7.61374L13.9654 15.0075H11.844L7.62588 8.97418V8.97384Z" />
          </svg>
          Julius Marminge
        </Link>
      </Button>
    </p>
  );
}

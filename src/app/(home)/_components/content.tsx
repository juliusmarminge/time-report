import { Button } from "~/ui/button";
import { XIcon } from "~/ui/icons";
import { Link } from "~/ui/link";
import { LogoIcon } from "~/ui/icons";

export function Hero(props: Readonly<{ children?: React.ReactNode }>) {
  return (
    <>
      <div>
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="inline-block h-8 w-auto" />
          <span className="font-cal text-3xl text-white tracking-tight">
            Time Report
          </span>
        </Link>
      </div>

      <h1 className="mt-14 font-cal font-light text-4xl/tight text-white">
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
          <XIcon className="mr-2 size-4" />
          Julius Marminge
        </Link>
      </Button>
    </p>
  );
}

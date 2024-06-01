import { cn } from "~/lib/cn";

export function DashboardShell(props: {
  title: React.ReactNode;
  description?: React.ReactNode;
  headerActions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          {typeof props.title === "string" ? (
            <h1 className="font-cal font-semibold text-xl leading-none">
              {props.title}
            </h1>
          ) : (
            props.title
          )}
          {typeof props.description === "string" ? (
            <h2 className="text-base text-muted-foreground">
              {props.description}
            </h2>
          ) : (
            props.description ?? null
          )}
        </div>
        {Array.isArray(props.headerActions) ? (
          <ul className="flex items-center gap-4">
            {props.headerActions.map((action, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <li key={i}>{action}</li>
            ))}
          </ul>
        ) : (
          props.headerActions
        )}
      </header>
      <div className={cn("flex flex-col", props.className)}>
        {props.children}
      </div>
    </>
  );
}

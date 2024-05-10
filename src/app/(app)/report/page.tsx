import { redirect } from "next/navigation";

export default function Report() {
  redirect(
    `/report/${Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "2-digit",
    })
      .format(Date.now())
      .replace(" ", "")}`,
  );
}

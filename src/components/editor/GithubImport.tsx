import { CheckCircle, Github, WarningTriangle } from "iconoir-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  fetchRepo,
  fetchUser,
  GithubError,
  type GithubRepo,
  type GithubUser,
  getLastRateLimit,
  type RateLimit,
} from "../../lib/github/api";
import { parseGithubInput } from "../../lib/github/parse";
import { Button } from "../ui/Button";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string; warning?: string }
  | { kind: "error"; message: string };

type Props =
  | {
      mode: "user";
      onImport: (user: GithubUser, signal: AbortSignal) => Promise<string | undefined>;
    }
  | {
      mode: "repo";
      onImport: (repo: GithubRepo, signal: AbortSignal) => Promise<string | undefined>;
    };

function rateText(rate: RateLimit | null): string | null {
  if (!rate?.limit) return null;
  return `${rate.remaining} of ${rate.limit} unauthenticated requests left this hour.`;
}

/**
 * Looks up public GitHub data. Requests are cached for ten minutes and any
 * in-flight request is aborted when a new one starts or the panel unmounts.
 */
export function GithubImport(props: Props) {
  const id = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [rate, setRate] = useState<RateLimit | null>(getLastRateLimit);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const placeholder =
    props.mode === "user" ? "octocat or github.com/octocat" : "owner/repository or URL";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const target = parseGithubInput(value);
    if (!target) {
      setStatus({
        kind: "error",
        message: "That doesn't look like a GitHub username or repository.",
      });
      return;
    }
    if (props.mode === "repo" && target.kind !== "repo") {
      setStatus({ kind: "error", message: "Enter a repository as owner/name, e.g. vitejs/vite." });
      return;
    }
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setStatus({ kind: "loading" });
    try {
      let warning: string | undefined;
      if (props.mode === "user") {
        const username = target.kind === "user" ? target.username : target.owner;
        const user = await fetchUser(username, ctrl.signal);
        warning = await props.onImport(user, ctrl.signal);
        if (!ctrl.signal.aborted) {
          setStatus({ kind: "success", message: `Imported @${user.login}.`, warning });
        }
      } else if (target.kind === "repo") {
        const repo = await fetchRepo(target.owner, target.repo, ctrl.signal);
        warning = await props.onImport(repo, ctrl.signal);
        if (!ctrl.signal.aborted) {
          setStatus({ kind: "success", message: `Imported ${repo.full_name}.`, warning });
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      const message =
        error instanceof GithubError
          ? error.kind === "not-found"
            ? props.mode === "user"
              ? "No public GitHub user with that name."
              : "No public repository with that name. Private repositories can't be read without a token."
            : error.message
          : "Something went wrong while importing.";
      setStatus({ kind: "error", message });
    } finally {
      setRate(getLastRateLimit());
      if (controller.current === ctrl) controller.current = null;
    }
  }

  const rateLimited = status.kind === "error" && /limit/i.test(status.message);
  return (
    <form onSubmit={submit} className="flex flex-col gap-2" noValidate>
      <label htmlFor={id} className="text-[12px] font-medium text-ink-2">
        {props.mode === "user" ? "Import from a GitHub profile" : "Import from a GitHub repository"}
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Github
            width={14}
            height={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-3"
            aria-hidden
          />
          <input
            id={id}
            className="control pl-8"
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setValue(e.target.value)}
            aria-describedby={`${id}-status`}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={status.kind === "loading" || !value.trim()}
        >
          {status.kind === "loading" ? "Fetching…" : "Import"}
        </Button>
      </div>
      <div id={`${id}-status`} aria-live="polite" className="text-[11.5px] leading-snug">
        {status.kind === "error" ? (
          <p className="flex gap-1.5 text-danger">
            <WarningTriangle width={13} height={13} className="mt-px shrink-0" aria-hidden />
            <span>{status.message}</span>
          </p>
        ) : null}
        {status.kind === "success" ? (
          <div className="flex flex-col gap-1">
            <p className="flex gap-1.5 text-accent">
              <CheckCircle width={13} height={13} className="mt-px shrink-0" aria-hidden />
              <span>{status.message} Fields below were updated and remain editable.</span>
            </p>
            {status.warning ? <p className="text-ink-2">{status.warning}</p> : null}
          </div>
        ) : null}
        <p className="mt-1 text-ink-3">
          {rateText(rate) ??
            "Uses GitHub's public API without a token, limited to 60 requests per hour per network."}
          {rateLimited
            ? " Your edits are safe; you can keep editing fields by hand."
            : " Results are cached for 10 minutes."}
        </p>
      </div>
    </form>
  );
}

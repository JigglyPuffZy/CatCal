import { useCallback, useState } from "react";

/** Runs async work with loading state that paints before the await. */
export function useAsyncAction(defaultMessage?: string) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  const run = useCallback(
    async <T,>(
      action: () => Promise<T>,
      options?: { message?: string }
    ): Promise<T | undefined> => {
      if (loading) return undefined;
      if (options?.message) setMessage(options.message);
      setLoading(true);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      try {
        return await action();
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  return { loading, message, run, setMessage };
}

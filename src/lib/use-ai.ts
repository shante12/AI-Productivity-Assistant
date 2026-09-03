import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { runAi, type AiMessage } from "@/lib/ai.functions";

export function useAi() {
  const call = useServerFn(runAi);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(system: string, messages: AiMessage[]): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const result = await call({ data: { system, messages } });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return null;
      }
      return result.text;
    } catch {
      const message = "Something went wrong while contacting the assistant. Please try again.";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, error };
}

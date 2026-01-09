import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UseTauriCommandOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useTauriCommand<T = any, Args extends any[] = any[]>(
  command: string,
  options?: UseTauriCommandOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await invoke<T>(command, args.length > 0 ? args[0] : {});
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [command, options]
  );

  return { data, loading, error, execute };
}

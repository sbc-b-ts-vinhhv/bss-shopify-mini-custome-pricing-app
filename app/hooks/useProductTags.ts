import { useCallback, useEffect, useState } from "react";

import {
  addProductTagToCache,
  getProductTags,
} from "../services/product-tags.service";

export function useProductTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    getProductTags()
      .then((result) => {
        if (cancelled) return;
        setTags(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Unable to load product tags",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const registerTag = useCallback((tag: string) => {
    addProductTagToCache(tag);
    setTags((current) => (current.includes(tag) ? current : [...current, tag]));
  }, []);

  return { tags, loading, error, registerTag };
}

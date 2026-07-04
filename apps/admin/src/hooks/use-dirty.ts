import { useEffect, useRef, useState } from "react";

/**
 * Local dirty-state tracker. Compares JSON-serialized current vs saved.
 */
export function useDirty<T>(saved: T) {
  const [draft, setDraft] = useState<T>(saved);
  const savedRef = useRef(saved);

  useEffect(() => {
    savedRef.current = saved;
    setDraft(saved);
  }, [JSON.stringify(saved)]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = JSON.stringify(draft) !== JSON.stringify(savedRef.current);

  function reset() {
    setDraft(savedRef.current);
  }

  return { draft, setDraft, dirty, reset };
}

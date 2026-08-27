"use client";

import { useEffect, useState } from "react";
import { isFavorite, onLibraryChange, pushRecent, toggleFavorite } from "@/lib/localLibrary";

export function FavoriteButton({ id, title }: { id: string; title: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    // Reads localStorage (unavailable during SSR) — post-mount sync is unavoidable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFav(isFavorite(id));
    pushRecent({ id, title });
    return onLibraryChange(() => setFav(isFavorite(id)));
  }, [id, title]);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite({ id, title })}
      aria-label={fav ? "Тэмдэглэснээс хасах" : "Тэмдэглэх"}
      title={fav ? "Тэмдэглэснээс хасах" : "Тэмдэглэх"}
      className="text-[18px] leading-none transition-colors"
      style={{ color: fav ? "var(--brd)" : "var(--s-l)" }}
    >
      {fav ? "★" : "☆"}
    </button>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

// Tracks the set of favorited house IDs for the logged-in tenant,
// and exposes a toggle function that calls the backend and updates local state.
export const useFavorites = () => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || user.role !== "tenant") {
        setFavoriteIds(new Set());
        setLoaded(true);
        return;
      }
      try {
        const { data } = await api.getFavorites();
        setFavoriteIds(new Set(data.map((h) => h._id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    };
    fetchFavorites();
  }, [user]);

  const isFavorite = useCallback((houseId) => favoriteIds.has(houseId), [favoriteIds]);

  const toggleFavorite = useCallback(async (houseId) => {
    try {
      const { data } = await api.toggleFavorite(houseId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(houseId);
        else next.delete(houseId);
        return next;
      });
      return data.favorited;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  // Only show the favorite heart for logged-in tenants
  const canFavorite = !!user && user.role === "tenant";

  return { favoriteIds, isFavorite, toggleFavorite, canFavorite, loaded };
};

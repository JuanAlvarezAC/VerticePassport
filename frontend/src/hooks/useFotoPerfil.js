import { useState, useEffect } from "react";

export function useFotoPerfil(perfil, matricula) {
  const [fotoPexels, setFotoPexels] = useState(null);

  useEffect(() => {
    if (!perfil?.foto_url && matricula) {
      fetch(`https://api.pexels.com/v1/search?query=person+portrait&per_page=20&orientation=square`, {
        headers: { Authorization: import.meta.env.VITE_PEXELS_API_KEY }
      })
        .then(r => r.json())
        .then(data => {
          if (data.photos?.length > 0) {
            const index = matricula % data.photos.length;
            setFotoPexels(data.photos[index].src.medium);
          }
        })
        .catch(() => {});
    }
  }, [perfil, matricula]);

  return perfil?.foto_url || fotoPexels || "src/images/leahplaceholder.jpeg";
}
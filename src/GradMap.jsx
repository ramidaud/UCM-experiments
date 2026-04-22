import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import locations from "./locations.js";

// Fix Leaflet's default marker icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

export default function GradMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [41.1528, -81.3430],
      zoom: 16,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    locations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng])
        .addTo(mapInstance.current)
        .bindTooltip(loc.name, { permanent: false, direction: "top" });

      marker.on("click", () => {
        setSelected(loc);
        mapInstance.current.setView([loc.lat, loc.lng], 17, { animate: true });
      });

      markersRef.current[loc.id] = marker;
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  function handleCardClick(loc) {
    setSelected(loc);
    mapInstance.current?.setView([loc.lat, loc.lng], 17, { animate: true });
    markersRef.current[loc.id]?.openTooltip();
  }

  return (
    <div className="grad-map-wrapper">
      <aside className="grad-map-sidebar" aria-label="Graduation photo locations">
        <h1 className="sidebar-title">KSU Graduation Photo Spots</h1>
        <p className="sidebar-subtitle">
          Click a location to jump to it on the map.
        </p>
        <ul className="location-list" role="list">
          {locations.map((loc) => (
            <li key={loc.id}>
              <button
                className={`location-card${selected?.id === loc.id ? " location-card--active" : ""}`}
                onClick={() => handleCardClick(loc)}
                aria-pressed={selected?.id === loc.id}
              >
                {loc.image && (
                  <img
                    className="card-image"
                    src={loc.image}
                    alt={loc.name}
                    loading="lazy"
                  />
                )}
                <div className="card-body">
                  <h2 className="card-name">{loc.name}</h2>
                  <p className="card-description">{loc.description}</p>
                  {selected?.id === loc.id && loc.tip && (
                    <p className="card-tip">
                      <span aria-hidden="true">📸 </span>
                      <strong>Tip:</strong> {loc.tip}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div
        className="grad-map-container"
        ref={mapRef}
        role="application"
        aria-label="Interactive campus map"
      />
    </div>
  );
}

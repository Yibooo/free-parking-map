"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Doc } from "../../../convex/_generated/dataModel";
import { TOKYO_CENTER, DEFAULT_ZOOM, PARKING_CATEGORIES, FACILITY_CATEGORIES } from "@/lib/constants";

type Props = {
  facilities: Doc<"facilities">[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

function makeIcon(parkingCategory: string) {
  const color = PARKING_CATEGORIES[parkingCategory as keyof typeof PARKING_CATEGORIES]?.color ?? "#64748b";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="7" fill="white" opacity="0.9"/>
      <text x="14" y="18" text-anchor="middle" font-size="9" font-weight="bold" fill="${color}">${parkingCategory}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
    className: "",
  });
}

export function LeafletMap({ facilities, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [TOKYO_CENTER.lat, TOKYO_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existingIds = new Set(markersRef.current.keys());
    const newIds = new Set(facilities.map((f) => String(f._id)));

    // 削除
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    }

    // 追加
    for (const facility of facilities) {
      const fid = String(facility._id);
      if (markersRef.current.has(fid)) continue;

      const category = FACILITY_CATEGORIES[facility.category];
      const parking = PARKING_CATEGORIES[facility.parkingCategory];
      const marker = L.marker([facility.lat, facility.lng], {
        icon: makeIcon(facility.parkingCategory),
      });

      marker.bindPopup(`
        <div style="min-width:200px">
          <p style="font-weight:600;margin:0 0 4px">${facility.name}</p>
          <p style="font-size:12px;color:#666;margin:0 0 4px">${category.icon} ${category.label}</p>
          <span style="display:inline-block;background:${parking.color};color:white;font-size:11px;padding:1px 6px;border-radius:4px;margin-bottom:4px">
            ${facility.parkingCategory}：${parking.label}
          </span>
          <p style="font-size:12px;margin:4px 0 0">${facility.address}</p>
          <a href="/facilities/${fid}" style="font-size:12px;color:#2563eb">詳細を見る →</a>
        </div>
      `);

      marker.on("click", () => onSelect?.(fid));
      marker.addTo(map);
      markersRef.current.set(fid, marker);
    }
  }, [facilities, onSelect]);

  // 選択施設にフォーカス
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current.get(selectedId);
    if (marker) {
      mapRef.current.setView(marker.getLatLng(), 15, { animate: true });
      marker.openPopup();
    }
  }, [selectedId]);

  return <div ref={containerRef} className="w-full h-full" />;
}

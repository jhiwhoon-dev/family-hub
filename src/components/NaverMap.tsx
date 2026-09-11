"use client";

import { useEffect, useRef, useState } from "react";
import { Place, PLACE_CATEGORY_COLOR, PLACE_CATEGORY_LABEL } from "@/types/database";

const SCRIPT_ID = "naver-maps-sdk";
// 대한민국 중심 대략 좌표 (서울시청) - 등록된 장소가 없을 때 기본 표시 위치
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

function loadNaverMapsScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    if (window.naver?.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function NaverMap({ places }: { places: Place[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setError(
        "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 설정되지 않았습니다."
      );
      return;
    }

    let cancelled = false;

    loadNaverMapsScript(clientId)
      .then(() => {
        if (cancelled || !mapRef.current) return;

        mapInstance.current = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(
            DEFAULT_CENTER.lat,
            DEFAULT_CENTER.lng
          ),
          zoom: 11,
        });
        renderMarkers();
      })
      .catch(() => {
        if (!cancelled) {
          setError("네이버 지도 스크립트를 불러오지 못했습니다.");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (mapInstance.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  function renderMarkers() {
    // 기존 마커 제거
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    const withCoords = places.filter((p) => p.lat != null && p.lng != null);
    if (withCoords.length === 0) return;

    const bounds = new window.naver.maps.LatLngBounds();

    withCoords.forEach((place) => {
      const position = new window.naver.maps.LatLng(place.lat!, place.lng!);
      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstance.current,
        title: place.name,
        icon: {
          content: `<div style="background:${PLACE_CATEGORY_COLOR[place.category]};color:#fff;border-radius:9999px;padding:4px 8px;font-size:12px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3)">${place.name}</div>`,
          anchor: new window.naver.maps.Point(10, 10),
        },
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div style="padding:8px 10px;font-size:13px;min-width:140px">
          <strong>${place.name}</strong><br/>
          <span style="color:#666">${PLACE_CATEGORY_LABEL[place.category]}${
          place.address ? " · " + place.address : ""
        }</span>
        </div>`,
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markers.current.push(marker);
      bounds.extend(position);
    });

    mapInstance.current.fitBounds(bounds);
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="h-64 w-full overflow-hidden rounded-xl border border-neutral-200 sm:h-96"
    />
  );
}

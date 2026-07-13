"use client"

import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet"
import { useTheme } from "next-themes"

// Carto tiles: light + dark variants that match the app palette
const TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
}

type LatLng = [number, number]

function MapUpdater({
  origin,
  destination,
}: {
  origin: LatLng
  destination: LatLng | null
}) {
  const map = useMap()
  useEffect(() => {
    if (destination) {
      map.fitBounds([origin, destination], { padding: [44, 44], maxZoom: 15 })
    } else {
      map.setView(origin, 13)
    }
  }, [map, origin, destination])
  return null
}

export default function MapInner({
  origin,
  destination,
}: {
  origin: LatLng
  destination: LatLng | null
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== "light"
  const accent = isDark ? "#34d399" : "#059669"
  const originFill = isDark ? "#0a0a0a" : "#ffffff"

  return (
    <MapContainer
      center={origin}
      zoom={13}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
      className="h-full w-full"
    >
      <TileLayer
        key={isDark ? "dark" : "light"}
        url={isDark ? TILES.dark : TILES.light}
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <MapUpdater origin={origin} destination={destination} />

      {destination && (
        <Polyline
          key={`${destination[0]},${destination[1]}`}
          positions={[origin, destination]}
          pathOptions={{ color: accent, weight: 4, opacity: 0.95 }}
        />
      )}

      {/* Origin marker */}
      <CircleMarker
        center={origin}
        radius={8}
        pathOptions={{
          color: accent,
          weight: 3,
          fillColor: originFill,
          fillOpacity: 1,
        }}
      >
        <Tooltip direction="top" offset={[0, -8]}>
          <span style={{ fontWeight: 600 }}>Origen</span>
        </Tooltip>
      </CircleMarker>

      {/* Destination marker */}
      {destination && (
        <CircleMarker
          center={destination}
          radius={9}
          pathOptions={{
            color: accent,
            weight: 3,
            fillColor: accent,
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <span style={{ fontWeight: 600 }}>Destino</span>
          </Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  )
}

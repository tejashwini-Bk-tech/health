"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import type { RiskLevel } from "@/lib/data"
import { useLanguage } from "@/hooks/use-language"

export interface MapVillage {
  id: string
  name: string
  district: string
  riskLevel: RiskLevel
  activeCases: number
  coordinates: { lat: number; lng: number }
}

interface MapComponentProps {
  villages: MapVillage[]
  selectedVillage: MapVillage | null
  onSelectVillage: (village: MapVillage | null) => void
}

function MapUpdater({ selectedVillage }: { selectedVillage: MapVillage | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedVillage) {
      map.flyTo([selectedVillage.coordinates.lat, selectedVillage.coordinates.lng], 12, {
        duration: 1.5
      })
    }
  }, [selectedVillage, map])

  return null
}

export default function MapComponent({ villages, selectedVillage, onSelectVillage }: MapComponentProps) {
  const { t } = useLanguage()

  // Default center for Northeast India
  const center: [number, number] = [26.2006, 92.9376] // Central Assam
  const zoom = 7

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case "critical": return "#ef4444" // red-500
      case "high": return "#f97316" // orange-500
      case "moderate": return "#f59e0b" // amber-500
      case "low": return "#10b981" // emerald-500
      default: return "#3b82f6" // blue-500
    }
  }

  // Create custom circle icons
  const createCustomIcon = (riskLevel: RiskLevel) => {
    const color = getRiskColor(riskLevel)
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4); ${riskLevel === 'critical' ? 'animation: custom-pulse 2s infinite;' : ''}"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {villages.map((village) => (
          <Marker
            key={village.id}
            position={[village.coordinates.lat, village.coordinates.lng]}
            icon={createCustomIcon(village.riskLevel)}
            eventHandlers={{
              click: () => onSelectVillage(village),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[120px]">
                <h3 className="font-semibold text-sm">{village.name}</h3>
                <p className="text-xs text-slate-500 mb-2">{village.district}</p>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span>{t.map.activeCases}:</span>
                  <span className="font-bold">{village.activeCases}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>{t.map.riskLevel}:</span>
                  <span className="font-medium capitalize" style={{ color: getRiskColor(village.riskLevel) }}>
                    {t.risk[village.riskLevel]}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapUpdater selectedVillage={selectedVillage} />
      </MapContainer>
      <style jsx global>{`
        @keyframes custom-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  )
}

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapDisplayProps {
  coordinates: string;
  title: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ 
  coordinates, 
  title, 
  onClose, 
  isModal = false 
}) => {
  const parseCoordinates = (coords: string): [number, number] | null => {
    try {
      const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()));
      if (isNaN(lat) || isNaN(lng)) return null;
      return [lat, lng];
    } catch {
      return null;
    }
  };

  const position = parseCoordinates(coordinates);

  if (!position) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Некорректные координаты</p>
        </div>
      </div>
    );
  }

  const mapContent = (
    <div className={`relative ${isModal ? 'h-96' : 'h-64'} w-full rounded-lg overflow-hidden`}>
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-[1000] bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}
      
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <strong>{title}</strong>
              <br />
              <span className="text-sm text-gray-600">
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            {mapContent}
            <div className="mt-4 text-sm text-gray-600 text-center">
              Координаты: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return mapContent;
};

// Компонент для кнопки открытия карты
interface MapButtonProps {
  coordinates: string;
  title: string;
  variant?: 'start' | 'end';
}

export const MapButton: React.FC<MapButtonProps> = ({ 
  coordinates, 
  title, 
  variant = 'start' 
}) => {
  const [showMap, setShowMap] = React.useState(false);

  if (!coordinates) return null;

  const buttonColor = variant === 'start' ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700';

  return (
    <>
      <button
        onClick={() => setShowMap(true)}
        className={`${buttonColor} hover:bg-gray-50 p-1 rounded transition-colors`}
        title="Показать на карте"
      >
        <MapPin className="w-4 h-4" />
      </button>
      
      {showMap && (
        <MapDisplay
          coordinates={coordinates}
          title={title}
          onClose={() => setShowMap(false)}
          isModal={true}
        />
      )}
    </>
  );
};
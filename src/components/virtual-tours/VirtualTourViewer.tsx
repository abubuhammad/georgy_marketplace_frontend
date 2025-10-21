import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Settings,
  Eye,
  Home,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VirtualTourHotspot {
  id: string;
  x: number; // Percentage position
  y: number; // Percentage position
  type: 'navigation' | 'information' | 'media';
  title: string;
  description?: string;
  targetScene?: string;
  icon?: string;
  content?: {
    type: 'text' | 'image' | 'video';
    data: string;
  };
}

interface VirtualTourScene {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  audioUrl?: string;
  hotspots: VirtualTourHotspot[];
  initialView?: {
    yaw: number;
    pitch: number;
    fov: number;
  };
}

interface VirtualTour {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  scenes: VirtualTourScene[];
  startScene: string;
  settings: {
    autoRotate: boolean;
    showHotspots: boolean;
    allowZoom: boolean;
    showMinimap: boolean;
  };
}

interface VirtualTourViewerProps {
  tour: VirtualTour;
  className?: string;
  onSceneChange?: (sceneId: string) => void;
  onHotspotClick?: (hotspot: VirtualTourHotspot) => void;
}

export function VirtualTourViewer({ 
  tour, 
  className, 
  onSceneChange, 
  onHotspotClick 
}: VirtualTourViewerProps) {
  const [currentScene, setCurrentScene] = useState<VirtualTourScene>(
    tour.scenes.find(s => s.id === tour.startScene) || tour.scenes[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState(0);
  const [showHotspots, setShowHotspots] = useState(tour.settings.showHotspots);
  const [selectedHotspot, setSelectedHotspot] = useState<VirtualTourHotspot | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [viewMode, setViewMode] = useState<'360' | 'panoramic' | 'standard'>('360');

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && currentScene.audioUrl) {
      audioRef.current.volume = volume[0] / 100;
      if (isPlaying && !isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted, volume, currentScene.audioUrl]);

  const handleSceneChange = (sceneId: string) => {
    const scene = tour.scenes.find(s => s.id === sceneId);
    if (scene) {
      setCurrentScene(scene);
      setRotation(0);
      setZoom([100]);
      onSceneChange?.(sceneId);
    }
  };

  const handleHotspotClick = (hotspot: VirtualTourHotspot) => {
    if (hotspot.type === 'navigation' && hotspot.targetScene) {
      handleSceneChange(hotspot.targetScene);
    } else {
      setSelectedHotspot(hotspot);
    }
    onHotspotClick?.(hotspot);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleRotation = (direction: 'left' | 'right') => {
    setRotation(prev => {
      const newRotation = direction === 'left' ? prev - 15 : prev + 15;
      return newRotation % 360;
    });
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'navigation': return Navigation;
      case 'information': return Eye;
      case 'media': return Play;
      default: return Eye;
    }
  };

  const getHotspotColor = (type: string) => {
    switch (type) {
      case 'navigation': return 'bg-blue-500 hover:bg-blue-600';
      case 'information': return 'bg-green-500 hover:bg-green-600';
      case 'media': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Tour Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{tour.title}</CardTitle>
              {tour.description && (
                <p className="text-gray-600 mt-1">{tour.description}</p>
              )}
            </div>
            <Badge variant="outline">{viewMode.toUpperCase()}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Viewer */}
      <div
        ref={containerRef}
        className={cn(
          "relative bg-black rounded-lg overflow-hidden",
          isFullscreen ? "fixed inset-0 z-50" : "aspect-video"
        )}
      >
        {/* Scene Image/Video */}
        <div className="relative w-full h-full overflow-hidden">
          {currentScene.videoUrl ? (
            <video
              className={cn(
                "w-full h-full object-cover transition-transform duration-300",
                viewMode === '360' && "transform-gpu"
              )}
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom[0] / 100})`,
                transformOrigin: 'center center'
              }}
              src={currentScene.videoUrl}
              poster={currentScene.imageUrl}
              autoPlay={isPlaying}
              muted={isMuted}
              loop
            />
          ) : (
            <img
              ref={imageRef}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300",
                viewMode === '360' && "transform-gpu"
              )}
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom[0] / 100})`,
                transformOrigin: 'center center'
              }}
              src={currentScene.imageUrl}
              alt={currentScene.title}
            />
          )}

          {/* Hotspots */}
          {showHotspots && currentScene.hotspots.map((hotspot) => {
            const Icon = getHotspotIcon(hotspot.type);
            return (
              <button
                key={hotspot.id}
                className={cn(
                  "absolute w-10 h-10 rounded-full text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 z-10",
                  getHotspotColor(hotspot.type)
                )}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`
                }}
                onClick={() => handleHotspotClick(hotspot)}
                title={hotspot.title}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}

          {/* Loading Overlay */}
          {isPlaying && currentScene.videoUrl && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              {currentScene.audioUrl && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="w-20"
                  />
                </div>
              )}
            </div>

            {/* Center Info */}
            <div className="text-center">
              <h3 className="font-medium">{currentScene.title}</h3>
              {currentScene.description && (
                <p className="text-sm text-gray-300">{currentScene.description}</p>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {tour.settings.allowZoom && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setZoom([Math.max(50, zoom[0] - 10)])}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setZoom([Math.min(200, zoom[0] + 10)])}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => handleRotation('left')}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => handleRotation('right')}
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32 bg-black/50 text-white border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="360">360° View</SelectItem>
              <SelectItem value="panoramic">Panoramic</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setShowHotspots(!showHotspots)}
          >
            <Eye className={cn("h-4 w-4", !showHotspots && "opacity-50")} />
          </Button>
        </div>
      </div>

      {/* Scene Navigation */}
      {tour.scenes.length > 1 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Tour Scenes ({tour.scenes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tour.scenes.map((scene) => (
                <button
                  key={scene.id}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                    scene.id === currentScene.id 
                      ? "border-red-500 ring-2 ring-red-500/20" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => handleSceneChange(scene.id)}
                >
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                    <p className="text-xs font-medium truncate">{scene.title}</p>
                  </div>
                  {scene.id === currentScene.id && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="text-xs">
                        Current
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotspot Details Modal */}
      {selectedHotspot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedHotspot.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedHotspot(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedHotspot.description && (
                <p className="text-gray-600 mb-4">{selectedHotspot.description}</p>
              )}
              
              {selectedHotspot.content && (
                <div className="mb-4">
                  {selectedHotspot.content.type === 'image' && (
                    <img
                      src={selectedHotspot.content.data}
                      alt={selectedHotspot.title}
                      className="w-full rounded-lg"
                    />
                  )}
                  {selectedHotspot.content.type === 'video' && (
                    <video
                      src={selectedHotspot.content.data}
                      controls
                      className="w-full rounded-lg"
                    />
                  )}
                  {selectedHotspot.content.type === 'text' && (
                    <p className="text-gray-800">{selectedHotspot.content.data}</p>
                  )}
                </div>
              )}

              <Button
                onClick={() => setSelectedHotspot(null)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audio Element */}
      {currentScene.audioUrl && (
        <audio
          ref={audioRef}
          src={currentScene.audioUrl}
          loop
          preload="auto"
        />
      )}
    </div>
  );
}

export default VirtualTourViewer;

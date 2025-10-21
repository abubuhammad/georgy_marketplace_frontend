import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  Save, 
  Eye, 
  Settings, 
  Move, 
  MapPin,
  Camera,
  Video,
  Volume2,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface VirtualTourHotspot {
  id: string;
  x: number;
  y: number;
  type: 'navigation' | 'information' | 'media';
  title: string;
  description?: string;
  targetScene?: string;
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

interface VirtualTourBuilderProps {
  tour?: VirtualTour;
  onSave: (tour: VirtualTour) => void;
  onPreview: (tour: VirtualTour) => void;
  className?: string;
}

export function VirtualTourBuilder({ 
  tour, 
  onSave, 
  onPreview, 
  className 
}: VirtualTourBuilderProps) {
  const [currentTour, setCurrentTour] = useState<VirtualTour>(
    tour || {
      id: `tour-${Date.now()}`,
      title: 'New Virtual Tour',
      description: '',
      thumbnail: '',
      scenes: [],
      startScene: '',
      settings: {
        autoRotate: false,
        showHotspots: true,
        allowZoom: true,
        showMinimap: false
      }
    }
  );

  const [selectedScene, setSelectedScene] = useState<VirtualTourScene | null>(
    currentTour.scenes[0] || null
  );
  const [selectedHotspot, setSelectedHotspot] = useState<VirtualTourHotspot | null>(null);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [hotspotPosition, setHotspotPosition] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const updateTour = (updates: Partial<VirtualTour>) => {
    setCurrentTour(prev => ({ ...prev, ...updates }));
  };

  const addScene = () => {
    const newScene: VirtualTourScene = {
      id: `scene-${Date.now()}`,
      title: `Scene ${currentTour.scenes.length + 1}`,
      description: '',
      imageUrl: '',
      hotspots: []
    };

    const updatedScenes = [...currentTour.scenes, newScene];
    updateTour({ 
      scenes: updatedScenes,
      startScene: currentTour.startScene || newScene.id
    });
    setSelectedScene(newScene);
  };

  const updateScene = (sceneId: string, updates: Partial<VirtualTourScene>) => {
    const updatedScenes = currentTour.scenes.map(scene =>
      scene.id === sceneId ? { ...scene, ...updates } : scene
    );
    updateTour({ scenes: updatedScenes });
    
    if (selectedScene?.id === sceneId) {
      setSelectedScene({ ...selectedScene, ...updates });
    }
  };

  const deleteScene = (sceneId: string) => {
    const updatedScenes = currentTour.scenes.filter(scene => scene.id !== sceneId);
    updateTour({ 
      scenes: updatedScenes,
      startScene: currentTour.startScene === sceneId ? updatedScenes[0]?.id || '' : currentTour.startScene
    });
    
    if (selectedScene?.id === sceneId) {
      setSelectedScene(updatedScenes[0] || null);
    }
  };

  const handleImageUpload = (file: File, type: 'scene' | 'thumbnail') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      if (type === 'thumbnail') {
        updateTour({ thumbnail: imageUrl });
      } else if (selectedScene) {
        updateScene(selectedScene.id, { imageUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const videoUrl = e.target?.result as string;
      if (selectedScene) {
        updateScene(selectedScene.id, { videoUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const audioUrl = e.target?.result as string;
      if (selectedScene) {
        updateScene(selectedScene.id, { audioUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSceneImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingHotspot || !selectedScene) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setHotspotPosition({ x, y });
  };

  const addHotspot = (hotspotData: Omit<VirtualTourHotspot, 'id' | 'x' | 'y'>) => {
    if (!selectedScene || !hotspotPosition) return;

    const newHotspot: VirtualTourHotspot = {
      id: `hotspot-${Date.now()}`,
      x: hotspotPosition.x,
      y: hotspotPosition.y,
      ...hotspotData
    };

    const updatedHotspots = [...selectedScene.hotspots, newHotspot];
    updateScene(selectedScene.id, { hotspots: updatedHotspots });
    
    setIsAddingHotspot(false);
    setHotspotPosition(null);
  };

  const updateHotspot = (hotspotId: string, updates: Partial<VirtualTourHotspot>) => {
    if (!selectedScene) return;

    const updatedHotspots = selectedScene.hotspots.map(hotspot =>
      hotspot.id === hotspotId ? { ...hotspot, ...updates } : hotspot
    );
    updateScene(selectedScene.id, { hotspots: updatedHotspots });
    
    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot({ ...selectedHotspot, ...updates });
    }
  };

  const deleteHotspot = (hotspotId: string) => {
    if (!selectedScene) return;

    const updatedHotspots = selectedScene.hotspots.filter(h => h.id !== hotspotId);
    updateScene(selectedScene.id, { hotspots: updatedHotspots });
    
    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot(null);
    }
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'navigation': return Navigation;
      case 'information': return Eye;
      case 'media': return Video;
      default: return MapPin;
    }
  };

  const getHotspotColor = (type: string) => {
    switch (type) {
      case 'navigation': return 'bg-blue-500';
      case 'information': return 'bg-green-500';
      case 'media': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Virtual Tour Builder</CardTitle>
              <p className="text-gray-600">Create immersive 360° property tours</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onPreview(currentTour)}
                disabled={currentTour.scenes.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={() => onSave(currentTour)}
                disabled={!currentTour.title || currentTour.scenes.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Tour
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tour Title</Label>
              <Input
                value={currentTour.title}
                onChange={(e) => updateTour({ title: e.target.value })}
                placeholder="Enter tour title..."
              />
            </div>
            <div>
              <Label>Start Scene</Label>
              <Select
                value={currentTour.startScene}
                onValueChange={(value) => updateTour({ startScene: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start scene" />
                </SelectTrigger>
                <SelectContent>
                  {currentTour.scenes.map((scene) => (
                    <SelectItem key={scene.id} value={scene.id}>
                      {scene.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={currentTour.description}
                onChange={(e) => updateTour({ description: e.target.value })}
                placeholder="Tour description..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scene List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scenes ({currentTour.scenes.length})</CardTitle>
              <Button size="sm" onClick={addScene}>
                <Plus className="h-4 w-4 mr-1" />
                Add Scene
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentTour.scenes.map((scene) => (
              <div
                key={scene.id}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all",
                  selectedScene?.id === scene.id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setSelectedScene(scene)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium truncate">{scene.title}</h4>
                  <div className="flex gap-1">
                    {scene.id === currentTour.startScene && (
                      <Badge variant="destructive" className="text-xs">Start</Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(scene.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {scene.imageUrl && (
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full h-16 object-cover rounded"
                  />
                )}
                
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{scene.hotspots.length} hotspots</span>
                  {scene.videoUrl && <Video className="h-3 w-3" />}
                  {scene.audioUrl && <Volume2 className="h-3 w-3" />}
                </div>
              </div>
            ))}

            {currentTour.scenes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No scenes added yet</p>
                <Button size="sm" variant="outline" onClick={addScene} className="mt-2">
                  Add Your First Scene
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scene Editor */}
        <Card className="lg:col-span-2">
          {selectedScene ? (
            <Tabs defaultValue="scene" className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editing: {selectedScene.title}</CardTitle>
                  <TabsList>
                    <TabsTrigger value="scene">Scene</TabsTrigger>
                    <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="scene" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Scene Title</Label>
                      <Input
                        value={selectedScene.title}
                        onChange={(e) => updateScene(selectedScene.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={selectedScene.description || ''}
                        onChange={(e) => updateScene(selectedScene.id, { description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Scene Image</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'scene')}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedScene.imageUrl ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </div>
                    <div>
                      <Label>Video (Optional)</Label>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        {selectedScene.videoUrl ? 'Change Video' : 'Add Video'}
                      </Button>
                    </div>
                    <div>
                      <Label>Audio (Optional)</Label>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => audioInputRef.current?.click()}
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        {selectedScene.audioUrl ? 'Change Audio' : 'Add Audio'}
                      </Button>
                    </div>
                  </div>

                  {/* Scene Preview */}
                  {selectedScene.imageUrl && (
                    <div className="relative">
                      <Label>Scene Preview</Label>
                      <div
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border cursor-crosshair"
                        onClick={handleSceneImageClick}
                      >
                        <img
                          src={selectedScene.imageUrl}
                          alt={selectedScene.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Hotspots */}
                        {selectedScene.hotspots.map((hotspot) => {
                          const Icon = getHotspotIcon(hotspot.type);
                          return (
                            <button
                              key={hotspot.id}
                              className={cn(
                                "absolute w-8 h-8 rounded-full text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110",
                                getHotspotColor(hotspot.type),
                                selectedHotspot?.id === hotspot.id && "ring-2 ring-white"
                              )}
                              style={{
                                left: `${hotspot.x}%`,
                                top: `${hotspot.y}%`
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHotspot(hotspot);
                              }}
                            >
                              <Icon className="w-4 h-4 mx-auto" />
                            </button>
                          );
                        })}

                        {/* Add Hotspot Indicator */}
                        {isAddingHotspot && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <p className="text-white font-medium bg-blue-500 px-3 py-1 rounded">
                              Click to place hotspot
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant={isAddingHotspot ? "destructive" : "outline"}
                          onClick={() => setIsAddingHotspot(!isAddingHotspot)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {isAddingHotspot ? 'Cancel' : 'Add Hotspot'}
                        </Button>
                        <span className="text-sm text-gray-500">
                          {selectedScene.hotspots.length} hotspots
                        </span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="hotspots" className="space-y-4">
                  {selectedScene.hotspots.length > 0 ? (
                    <div className="space-y-3">
                      {selectedScene.hotspots.map((hotspot) => (
                        <Card key={hotspot.id} className={cn(
                          "p-3",
                          selectedHotspot?.id === hotspot.id && "ring-2 ring-red-500"
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", getHotspotColor(hotspot.type))}>
                                {React.createElement(getHotspotIcon(hotspot.type), { className: "w-3 h-3 text-white" })}
                              </div>
                              <span className="font-medium">{hotspot.title}</span>
                              <Badge variant="outline" className="text-xs">{hotspot.type}</Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => setSelectedHotspot(hotspot)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => deleteHotspot(hotspot.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {hotspot.description && (
                            <p className="text-sm text-gray-600">{hotspot.description}</p>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hotspots added yet</p>
                      <p className="text-sm">Click on the scene image to add hotspots</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Rotate</Label>
                        <p className="text-sm text-gray-500">Automatically rotate the scene</p>
                      </div>
                      <Switch
                        checked={currentTour.settings.autoRotate}
                        onCheckedChange={(checked) => 
                          updateTour({ 
                            settings: { ...currentTour.settings, autoRotate: checked }
                          })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Hotspots</Label>
                        <p className="text-sm text-gray-500">Display interactive hotspots</p>
                      </div>
                      <Switch
                        checked={currentTour.settings.showHotspots}
                        onCheckedChange={(checked) => 
                          updateTour({ 
                            settings: { ...currentTour.settings, showHotspots: checked }
                          })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Zoom</Label>
                        <p className="text-sm text-gray-500">Enable zoom controls</p>
                      </div>
                      <Switch
                        checked={currentTour.settings.allowZoom}
                        onCheckedChange={(checked) => 
                          updateTour({ 
                            settings: { ...currentTour.settings, allowZoom: checked }
                          })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Minimap</Label>
                        <p className="text-sm text-gray-500">Display navigation minimap</p>
                      </div>
                      <Switch
                        checked={currentTour.settings.showMinimap}
                        onCheckedChange={(checked) => 
                          updateTour({ 
                            settings: { ...currentTour.settings, showMinimap: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          ) : (
            <CardContent className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Select a scene to edit</p>
                <p className="text-sm">or add your first scene to get started</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Hotspot Creation Modal */}
      {hotspotPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Add Hotspot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hotspot Title</Label>
                <Input placeholder="Enter hotspot title..." id="hotspot-title" />
              </div>
              
              <div>
                <Label>Type</Label>
                <Select defaultValue="information">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="information">Information</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Description (Optional)</Label>
                <Textarea placeholder="Hotspot description..." id="hotspot-description" />
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    const title = (document.getElementById('hotspot-title') as HTMLInputElement)?.value;
                    const type = 'information'; // Get from select
                    const description = (document.getElementById('hotspot-description') as HTMLTextAreaElement)?.value;
                    
                    if (title) {
                      addHotspot({
                        title,
                        type: type as any,
                        description: description || undefined
                      });
                    }
                  }}
                >
                  Add Hotspot
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingHotspot(false);
                    setHotspotPosition(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default VirtualTourBuilder;

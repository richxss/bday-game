import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

const LevelEditor = ({ onLevelUpdate, currentLevel }) => {
  const [platforms, setPlatforms] = useState(currentLevel.platforms);
  const [gifts, setGifts] = useState(currentLevel.gifts);
  const [newPlatform, setNewPlatform] = useState({ x: 0, y: 0, width: 200, height: 20 });
  const [newGift, setNewGift] = useState({ x: 0, y: 0, width: 40, height: 40 });

  const addPlatform = () => {
    const platform = { ...newPlatform };
    setPlatforms([...platforms, platform]);
    setNewPlatform({ x: 0, y: 0, width: 200, height: 20 });
  };

  const addGift = () => {
    const gift = { ...newGift, collected: false };
    setGifts([...gifts, gift]);
    setNewGift({ x: 0, y: 0, width: 40, height: 40 });
  };

  const removePlatform = (index) => {
    setPlatforms(platforms.filter((_, i) => i !== index));
  };

  const removeGift = (index) => {
    setGifts(gifts.filter((_, i) => i !== index));
  };

  const applyChanges = () => {
    onLevelUpdate({ platforms, gifts });
  };

  const exportLevel = () => {
    const levelData = {
      platforms,
      gifts: gifts.map(gift => ({ ...gift, collected: false }))
    };
    const dataStr = JSON.stringify(levelData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'birthday_game_level.json';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Level Editor</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Platform Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Platforms ({platforms.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="platform-x">X Position</Label>
                    <Input
                      id="platform-x"
                      type="number"
                      value={newPlatform.x}
                      onChange={(e) => setNewPlatform({...newPlatform, x: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform-y">Y Position</Label>
                    <Input
                      id="platform-y"
                      type="number"
                      value={newPlatform.y}
                      onChange={(e) => setNewPlatform({...newPlatform, y: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform-width">Width</Label>
                    <Input
                      id="platform-width"
                      type="number"
                      value={newPlatform.width}
                      onChange={(e) => setNewPlatform({...newPlatform, width: parseInt(e.target.value) || 200})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform-height">Height</Label>
                    <Input
                      id="platform-height"
                      type="number"
                      value={newPlatform.height}
                      onChange={(e) => setNewPlatform({...newPlatform, height: parseInt(e.target.value) || 20})}
                    />
                  </div>
                </div>
                <Button onClick={addPlatform} className="w-full">
                  Add Platform
                </Button>
                
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {platforms.map((platform, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {platform.x}, {platform.y} ({platform.width}×{platform.height})
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePlatform(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gift Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Gifts ({gifts.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="gift-x">X Position</Label>
                    <Input
                      id="gift-x"
                      type="number"
                      value={newGift.x}
                      onChange={(e) => setNewGift({...newGift, x: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gift-y">Y Position</Label>
                    <Input
                      id="gift-y"
                      type="number"
                      value={newGift.y}
                      onChange={(e) => setNewGift({...newGift, y: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <Button onClick={addGift} className="w-full">
                  Add Gift
                </Button>
                
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {gifts.map((gift, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {gift.x}, {gift.y}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeGift(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button onClick={applyChanges} className="flex-1">
              Apply Changes to Game
            </Button>
            <Button onClick={exportLevel} variant="outline" className="flex-1">
              Export Level Data
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Close Editor
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Level Editor Instructions:</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Coordinate (0,0) is at the top-left of the game world</li>
              <li>• Player starts at position (100, 300)</li>
              <li>• Girlfriend appears at position (1800, 350)</li>
              <li>• Make sure platforms are positioned so the player can reach all gifts</li>
              <li>• Recommended platform height: 20px, width: 150-300px</li>
              <li>• Gift size is fixed at 40×40px</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelEditor;
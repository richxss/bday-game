import React, { useRef, useEffect, useState, useCallback } from 'react';
import LevelEditor from './LevelEditor';

const PlatformerGame = () => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    player: {
      x: 100,
      y: 300,
      width: 50,
      height: 50,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      speed: 3,
      jumpPower: 12,
      jumpsRemaining: 2, // Allow double jump
      maxJumps: 2
    },
    camera: {
      x: 0,
      y: 0
    },
    gifts: [
      { x: 300, y: 250, width: 40, height: 40, collected: false },
      { x: 600, y: 150, width: 40, height: 40, collected: false },
      { x: 900, y: 200, width: 40, height: 40, collected: false },
      { x: 1200, y: 100, width: 40, height: 40, collected: false },
      { x: 1500, y: 250, width: 40, height: 40, collected: false }
    ],
    platforms: [
      { x: 0, y: 400, width: 400, height: 20 },
      { x: 250, y: 300, width: 200, height: 20 },
      { x: 500, y: 200, width: 200, height: 20 },
      { x: 800, y: 250, width: 200, height: 20 },
      { x: 1100, y: 150, width: 200, height: 20 },
      { x: 1400, y: 300, width: 200, height: 20 },
      { x: 1700, y: 400, width: 200, height: 20 }
    ],
    girlfriend: {
      x: 1800,
      y: 350,
      width: 50,
      height: 50,
      visible: false
    },
    keys: {},
    gravity: 0.5,
    score: 0,
    gameWon: false,
    levelWidth: 2000
  });

  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showLevelEditor, setShowLevelEditor] = useState(false);
  const [sprites, setSprites] = useState({
    boyfriend: null,
    gift: null,
    girlfriend: null
  });

  // Preload provided sprites
  useEffect(() => {
    const loadSprites = async () => {
      const spriteUrls = {
        boyfriend: 'https://customer-assets.emergentagent.com/job_love-platformer/artifacts/sdn8l7dd_boyfriend.png.jpg',
        gift: 'https://customer-assets.emergentagent.com/job_love-platformer/artifacts/x1rc9vp3_gift.png.jpg',
        girlfriend: 'https://customer-assets.emergentagent.com/job_love-platformer/artifacts/wu3ydof9_girlfriend.png.jpg'
      };

      const loadedSprites = {};
      
      for (const [key, url] of Object.entries(spriteUrls)) {
        try {
          const img = new Image();
          // Try without crossOrigin first
          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log(`✅ Loaded ${key} sprite successfully`);
              resolve();
            };
            img.onerror = (error) => {
              console.error(`❌ Failed to load ${key} sprite:`, error);
              reject(error);
            };
            img.src = url;
          });
          loadedSprites[key] = img;
        } catch (error) {
          console.warn(`Failed to load ${key} sprite:`, error);
          // Keep the sprite as null, fallback will be used
        }
      }
      
      console.log('Loaded sprites:', Object.keys(loadedSprites));
      setSprites(prev => ({ ...prev, ...loadedSprites }));
    };

    loadSprites();
  }, []);

  // Handle level updates from editor
  const handleLevelUpdate = useCallback((newLevelData) => {
    gameStateRef.current.platforms = newLevelData.platforms;
    gameStateRef.current.gifts = newLevelData.gifts;
    setShowLevelEditor(false);
    resetGame();
  }, []);

  // Handle sprite loading
  const loadSprite = useCallback((spriteKey, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSprites(prev => ({
          ...prev,
          [spriteKey]: img
        }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback((e) => {
    gameStateRef.current.keys[e.code] = true;
  }, []);

  const handleKeyUp = useCallback((e) => {
    gameStateRef.current.keys[e.code] = false;
  }, []);

  // Update game physics
  const updateGame = useCallback(() => {
    const gameState = gameStateRef.current;
    const { player, keys, gravity, platforms, gifts, girlfriend } = gameState;

    // Handle input
    if (keys['ArrowLeft']) {
      player.velocityX = -player.speed;
    } else if (keys['ArrowRight']) {
      player.velocityX = player.speed;
    } else {
      player.velocityX *= 0.8; // Friction
    }

    if (keys['Space'] && player.onGround) {
      player.velocityY = -player.jumpPower;
      player.onGround = false;
    }

    // Apply gravity
    player.velocityY += gravity;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Platform collision
    player.onGround = false;
    platforms.forEach(platform => {
      if (player.x < platform.x + platform.width &&
          player.x + player.width > platform.x &&
          player.y < platform.y + platform.height &&
          player.y + player.height > platform.y) {
        
        // Landing on top of platform
        if (player.velocityY > 0 && player.y < platform.y) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.onGround = true;
        }
        // Hitting platform from below
        else if (player.velocityY < 0 && player.y > platform.y) {
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        }
        // Hitting platform from sides
        else if (player.velocityX > 0 && player.x < platform.x) {
          player.x = platform.x - player.width;
        } else if (player.velocityX < 0 && player.x > platform.x) {
          player.x = platform.x + platform.width;
        }
      }
    });

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.y > 600) {
      // Reset player position if they fall
      player.x = 100;
      player.y = 300;
      player.velocityX = 0;
      player.velocityY = 0;
    }

    // Gift collection
    gifts.forEach(gift => {
      if (!gift.collected &&
          player.x < gift.x + gift.width &&
          player.x + player.width > gift.x &&
          player.y < gift.y + gift.height &&
          player.y + player.height > gift.y) {
        gift.collected = true;
        gameState.score++;
        setScore(gameState.score);
      }
    });

    // Check if all gifts collected
    const allGiftsCollected = gifts.every(gift => gift.collected);
    if (allGiftsCollected && !girlfriend.visible) {
      girlfriend.visible = true;
    }

    // Check win condition
    if (girlfriend.visible &&
        player.x < girlfriend.x + girlfriend.width &&
        player.x + player.width > girlfriend.x &&
        player.y < girlfriend.y + girlfriend.height &&
        player.y + player.height > girlfriend.y) {
      gameState.gameWon = true;
      setGameWon(true);
    }

    // Update camera to follow player
    const canvas = canvasRef.current;
    if (canvas) {
      gameState.camera.x = Math.max(0, Math.min(
        player.x - canvas.width / 2,
        gameState.levelWidth - canvas.width
      ));
    }
  }, []);

  // Render game
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gameState = gameStateRef.current;
    const { player, camera, platforms, gifts, girlfriend } = gameState;

    // Clear canvas with light blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw gifts
    gifts.forEach(gift => {
      if (!gift.collected) {
        if (sprites.gift) {
          ctx.drawImage(sprites.gift, gift.x, gift.y, gift.width, gift.height);
        } else {
          // Fallback placeholder
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(gift.x, gift.y, gift.width, gift.height);
          // Add a simple gift bow effect
          ctx.fillStyle = '#FF6347';
          ctx.fillRect(gift.x + 15, gift.y + 5, 10, 5);
        }
      }
    });

    // Draw player (boyfriend)
    if (sprites.boyfriend) {
      ctx.drawImage(sprites.boyfriend, player.x, player.y, player.width, player.height);
    } else {
      // Fallback placeholder
      ctx.fillStyle = '#4169E1';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      // Simple face
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
      ctx.fillRect(player.x + 32, player.y + 10, 8, 8);
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x + 20, player.y + 30, 10, 5);
    }

    // Draw girlfriend if visible
    if (girlfriend.visible) {
      if (sprites.girlfriend) {
        ctx.drawImage(sprites.girlfriend, girlfriend.x, girlfriend.y, girlfriend.width, girlfriend.height);
      } else {
        // Fallback placeholder
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(girlfriend.x, girlfriend.y, girlfriend.width, girlfriend.height);
        // Simple face
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(girlfriend.x + 10, girlfriend.y + 10, 8, 8);
        ctx.fillRect(girlfriend.x + 32, girlfriend.y + 10, 8, 8);
        ctx.fillStyle = '#000000';
        ctx.fillRect(girlfriend.x + 20, girlfriend.y + 30, 10, 5);
      }
    }

    ctx.restore();

    // Draw UI elements (not affected by camera)
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.fillText(`Gifts: ${gameState.score}/${gifts.length}`, 20, 40);

    // Draw win message
    if (gameState.gameWon) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Happy Birthday!!', canvas.width / 2, canvas.height / 2);
      ctx.textAlign = 'left';
    }
  }, [sprites]); // Add sprites as dependency

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateGame();
      renderGame();
      requestAnimationFrame(gameLoop);
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    // Initial setup
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start game loop
    const gameLoopId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(gameLoopId);
    };
  }, [updateGame, renderGame, handleKeyDown, handleKeyUp]);

  const resetGame = () => {
    const gameState = gameStateRef.current;
    gameState.player.x = 100;
    gameState.player.y = 300;
    gameState.player.velocityX = 0;
    gameState.player.velocityY = 0;
    gameState.camera.x = 0;
    gameState.score = 0;
    gameState.gameWon = false;
    gameState.girlfriend.visible = false;
    gameState.gifts.forEach(gift => gift.collected = false);
    setScore(0);
    setGameWon(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sky-300">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Game Controls UI */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-bold text-lg mb-2">Controls</h3>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">←→</span> Move</div>
          <div><span className="font-semibold">Space</span> Jump</div>
        </div>
        <div className="mt-3 space-y-2">
          <button
            onClick={resetGame}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reset Game
          </button>
          <button
            onClick={() => setShowLevelEditor(true)}
            className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Level Editor
          </button>
        </div>
      </div>

      {/* Sprite Status UI - Hidden, but keeping custom upload option */}
      {/* 
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-bold text-lg mb-2">Sprites Loaded</h3>
        <div className="space-y-1 text-sm">
          <div className={`flex items-center gap-2 ${sprites.boyfriend ? 'text-green-600' : 'text-red-600'}`}>
            <span>{sprites.boyfriend ? '✅' : '❌'}</span> Boyfriend
          </div>
          <div className={`flex items-center gap-2 ${sprites.gift ? 'text-green-600' : 'text-red-600'}`}>
            <span>{sprites.gift ? '✅' : '❌'}</span> Gift
          </div>
          <div className={`flex items-center gap-2 ${sprites.girlfriend ? 'text-green-600' : 'text-red-600'}`}>
            <span>{sprites.girlfriend ? '✅' : '❌'}</span> Girlfriend
          </div>
        </div>
        
        <details className="mt-3">
          <summary className="text-xs cursor-pointer text-gray-600">Custom Sprites</summary>
          <div className="mt-2 space-y-2 text-xs">
            <div>
              <label htmlFor="boyfriend-sprite" className="block font-semibold mb-1">
                Boyfriend Override
              </label>
              <input
                id="boyfriend-sprite"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && loadSprite('boyfriend', e.target.files[0])}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label htmlFor="gift-sprite" className="block font-semibold mb-1">
                Gift Override
              </label>
              <input
                id="gift-sprite"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && loadSprite('gift', e.target.files[0])}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label htmlFor="girlfriend-sprite" className="block font-semibold mb-1">
                Girlfriend Override
              </label>
              <input
                id="girlfriend-sprite"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && loadSprite('girlfriend', e.target.files[0])}
                className="w-full text-xs"
              />
            </div>
          </div>
        </details>
      </div>
      */}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-md">
        <h3 className="font-bold mb-2">Mission</h3>
        <p className="text-sm">
          Collect the gifts to reach your girlfriend!
        </p>
        <div className="mt-2 text-xs text-gray-600">
          Score: {score}/{gameStateRef.current.gifts.length}
        </div>
      </div>

      {/* Level Editor Modal */}
      {showLevelEditor && (
        <LevelEditor
          currentLevel={{
            platforms: gameStateRef.current.platforms,
            gifts: gameStateRef.current.gifts
          }}
          onLevelUpdate={handleLevelUpdate}
        />
      )}
    </div>
  );
};

export default PlatformerGame;
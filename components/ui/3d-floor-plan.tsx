'use client'

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { throttle } from 'lodash';

interface FloorPlan3DProps {
  className?: string;
  lowPerformanceMode?: boolean;
}

export const FloorPlan3D: React.FC<FloorPlan3DProps> = ({ 
  className = "",
  lowPerformanceMode = true // Default to low performance mode for better overall site performance
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const lightsRef = useRef<THREE.Light[]>([]);
  const animationIdRef = useRef<number>();
  const controlsRef = useRef<any>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [cameraPosition, setCameraPosition] = useState({ x: -25, y: 35, z: 25 });
  const [cameraTarget, setCameraTarget] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with dark atmospheric background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    
    // Reduce fog complexity in low performance mode
    if (!lowPerformanceMode) {
      scene.fog = new THREE.Fog(0x050505, 20, 80);
    }
    
    sceneRef.current = scene;

    // Camera setup - positioned to match the reference image perspective
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    cameraRef.current = camera;

    // Enhanced renderer setup with better quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: lowPerformanceMode ? "low-power" : "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(lowPerformanceMode ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !lowPerformanceMode;
    
    if (!lowPerformanceMode) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    }
    
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Enhanced Materials with better textures and lighting response
    const materials = {
      // Walls - darker, more realistic
      wall: new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.9
      }),
      
      // Flooring with more realistic colors
      woodFloor: new THREE.MeshBasicMaterial({ 
        color: 0x3d2314
      }),
      
      tileFloor: new THREE.MeshBasicMaterial({ 
        color: 0x222222
      }),
      
      carpetFloor: new THREE.MeshBasicMaterial({ 
        color: 0x1e1e1e
      }),
      
      // Furniture colors - more realistic
      bedBlue: new THREE.MeshBasicMaterial({ 
        color: 0x1a3b6e
      }),
      
      sofaGray: new THREE.MeshBasicMaterial({ 
        color: 0x0a0a0a
      }),
      
      kitchenBlue: new THREE.MeshBasicMaterial({ 
        color: 0x2a5080
      }),
      
      woodFurniture: new THREE.MeshBasicMaterial({ 
        color: 0x2d1e10
      }),
      
      whiteFurniture: new THREE.MeshBasicMaterial({ 
        color: 0x444444
      }),
      
      // Accent wall (brick pattern) - warmer tone
      brickWall: new THREE.MeshBasicMaterial({ 
        color: 0x5a4306
      }),
      
      // Glass doors - more realistic
      glass: new THREE.MeshBasicMaterial({
        color: 0x1a3b6e,
        transparent: true,
        opacity: 0.3
      }),
      
      // Door frames
      doorFrame: new THREE.MeshBasicMaterial({ 
        color: 0x3d2314
      }),
      
      // Door material
      door: new THREE.MeshBasicMaterial({ 
        color: 0x2a1a0a
      })
    };

    // Enhanced floor plan structure
    const createFloorPlan = () => {
      const group = new THREE.Group();

      // Main floor base with better geometry
      const floorGeometry = new THREE.PlaneGeometry(24, 18);
      const floor = new THREE.Mesh(floorGeometry, materials.tileFloor);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      group.add(floor);

      // Enhanced wall specifications
      const wallHeight = 3.2;
      const wallThickness = 0.15;

      // Comprehensive wall structure
      const walls = [
        // Exterior walls
        { pos: [0, wallHeight/2, -9], size: [24, wallHeight, wallThickness] },
        { pos: [0, wallHeight/2, 9], size: [24, wallHeight, wallThickness] },
        { pos: [-12, wallHeight/2, 0], size: [wallThickness, wallHeight, 18] },
        { pos: [12, wallHeight/2, 0], size: [wallThickness, wallHeight, 18] },
        
        // Interior walls - more detailed layout
        { pos: [-6, wallHeight/2, -3], size: [wallThickness, wallHeight, 12] },
        { pos: [6, wallHeight/2, -6], size: [12, wallHeight, wallThickness] },
        { pos: [3, wallHeight/2, -3], size: [wallThickness, wallHeight, 6] },
        { pos: [-3, wallHeight/2, 3], size: [6, wallHeight, wallThickness] },
        { pos: [-9, wallHeight/2, 6], size: [wallThickness, wallHeight, 6] },
        { pos: [0, wallHeight/2, 0], size: [wallThickness, wallHeight, 6] },
        { pos: [9, wallHeight/2, 3], size: [wallThickness, wallHeight, 12] }
      ];

      // Create walls with shadows
      walls.forEach(wall => {
        const wallGeometry = new THREE.BoxGeometry(...wall.size);
        const wallMesh = new THREE.Mesh(wallGeometry, materials.wall);
        wallMesh.position.set(...wall.pos);
        wallMesh.castShadow = !lowPerformanceMode;
        wallMesh.receiveShadow = !lowPerformanceMode;
        group.add(wallMesh);
      });

      // Add doors to the floor plan
      const doors = [
        // Main entrance door
        { pos: [12, wallHeight/4, -6], size: [wallThickness*1.2, wallHeight/2, 2], rotation: [0, Math.PI/2, 0] },
        
        // Bedroom door
        { pos: [-6, wallHeight/4, -7], size: [wallThickness*1.2, wallHeight/2, 1.8], rotation: [0, 0, 0] },
        
        // Bathroom door
        { pos: [-9, wallHeight/4, 3], size: [wallThickness*1.2, wallHeight/2, 1.6], rotation: [0, Math.PI/2, 0] },
        
        // Kitchen door
        { pos: [3, wallHeight/4, -3], size: [wallThickness*1.2, wallHeight/2, 1.8], rotation: [0, Math.PI/2, 0] },
        
        // Living room door
        { pos: [6, wallHeight/4, 0], size: [wallThickness*1.2, wallHeight/2, 1.8], rotation: [0, 0, 0] }
      ];
      
      // Create doors
      doors.forEach(door => {
        // Door frame
        const frameGeometry = new THREE.BoxGeometry(door.size[0] * 1.2, door.size[1] * 1.1, door.size[2] * 1.1);
        const frameMesh = new THREE.Mesh(frameGeometry, materials.doorFrame);
        frameMesh.position.set(...door.pos);
        frameMesh.rotation.set(...door.rotation);
        frameMesh.castShadow = !lowPerformanceMode;
        frameMesh.receiveShadow = !lowPerformanceMode;
        group.add(frameMesh);
        
        // Door
        const doorGeometry = new THREE.BoxGeometry(...door.size);
        const doorMesh = new THREE.Mesh(doorGeometry, materials.door);
        doorMesh.position.set(...door.pos);
        doorMesh.rotation.set(...door.rotation);
        // Slightly offset the door to avoid z-fighting
        doorMesh.position.x += door.rotation[1] === 0 ? 0 : 0.02;
        doorMesh.position.z += door.rotation[1] === 0 ? 0.02 : 0;
        doorMesh.castShadow = !lowPerformanceMode;
        doorMesh.receiveShadow = !lowPerformanceMode;
        group.add(doorMesh);
      });
      // Enhanced accent brick wall
      const brickWall = new THREE.Mesh(
        new THREE.BoxGeometry(6, wallHeight, wallThickness),
        materials.brickWall
      );
      brickWall.position.set(6, wallHeight/2, 3);
      brickWall.castShadow = !lowPerformanceMode;
      brickWall.receiveShadow = !lowPerformanceMode;
      group.add(brickWall);

      // Enhanced room flooring with proper positioning
      const roomFloors = [
        { pos: [-9, 0.02, -3], size: [6, 0.04, 12], material: materials.woodFloor },
        { pos: [7.5, 0.02, -4.5], size: [9, 0.04, 9], material: materials.tileFloor },
        { pos: [6, 0.02, 3], size: [12, 0.04, 12], material: materials.carpetFloor },
        { pos: [-6, 0.02, 6], size: [6, 0.04, 6], material: materials.tileFloor }
      ];

      roomFloors.forEach(roomFloor => {
        const floorGeometry = new THREE.BoxGeometry(...roomFloor.size);
        const floorMesh = new THREE.Mesh(floorGeometry, roomFloor.material);
        floorMesh.position.set(...roomFloor.pos);
        floorMesh.receiveShadow = !lowPerformanceMode;
        group.add(floorMesh);
      });

      return group;
    };

    // Enhanced furniture with more detail
    const createFurniture = () => {
      const group = new THREE.Group();

      // BEDROOM - Complete furniture set
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.6, 5),
        materials.bedBlue
      );
      bed.position.set(-9, 0.3, -5);
      bed.castShadow = !lowPerformanceMode;
      bed.receiveShadow = !lowPerformanceMode;
      group.add(bed);

      // Bedside tables
      const bedside1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.8),
        materials.woodFurniture
      );
      bedside1.position.set(-11, 0.3, -6);
      bedside1.castShadow = !lowPerformanceMode;
      group.add(bedside1);

      const bedside2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.8),
        materials.woodFurniture
      );
      bedside2.position.set(-7, 0.3, -6);
      bedside2.castShadow = !lowPerformanceMode;
      group.add(bedside2);

      // LIVING ROOM - Complete set
      const sofa = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.8, 2.5),
        materials.sofaGray
      );
      sofa.position.set(8, 0.4, 5);
      sofa.castShadow = !lowPerformanceMode;
      sofa.receiveShadow = !lowPerformanceMode;
      group.add(sofa);

      // Coffee table
      const coffeeTable = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.3, 16),
        materials.woodFurniture
      );
      coffeeTable.position.set(7, 0.15, 3.5);
      coffeeTable.castShadow = !lowPerformanceMode;
      coffeeTable.receiveShadow = !lowPerformanceMode;
      group.add(coffeeTable);

      // TV Stand
      const tvStand = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.5, 1),
        materials.woodFurniture
      );
      tvStand.position.set(8.5, 0.25, 7.5);
      tvStand.castShadow = !lowPerformanceMode;
      group.add(tvStand);

      // TV
      const tv = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.5, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x000000 })
      );
      tv.position.set(8.5, 1.25, 7.6);
      tv.castShadow = !lowPerformanceMode;
      group.add(tv);

      // DINING ROOM - Complete set
      const diningTable = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 4),
        materials.whiteFurniture
      );
      diningTable.position.set(3, 0.75, 3);
      diningTable.castShadow = !lowPerformanceMode;
      diningTable.receiveShadow = !lowPerformanceMode;
      group.add(diningTable);

      // Dining chairs
      for (let i = 0; i < 4; i++) {
        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.8, 0.5),
          materials.whiteFurniture
        );
        const angle = (i * Math.PI) / 2;
        chair.position.set(
          3 + Math.cos(angle) * 1.8,
          0.4,
          3 + Math.sin(angle) * 2.5
        );
        chair.castShadow = !lowPerformanceMode;
        group.add(chair);
      }

      // KITCHEN - Complete kitchen setup
      const island = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.9, 2),
        materials.kitchenBlue
      );
      island.position.set(6, 0.45, -3);
      island.castShadow = !lowPerformanceMode;
      island.receiveShadow = !lowPerformanceMode;
      group.add(island);

      const cabinets = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.9, 0.6),
        materials.kitchenBlue
      );
      cabinets.position.set(8, 0.45, -7.5);
      cabinets.castShadow = !lowPerformanceMode;
      group.add(cabinets);

      // Upper cabinets
      const upperCabinets = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.6, 0.4),
        materials.kitchenBlue
      );
      upperCabinets.position.set(8, 2.2, -7.7);
      upperCabinets.castShadow = !lowPerformanceMode;
      group.add(upperCabinets);

      // Refrigerator
      const fridge = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.2, 1.2),
        materials.whiteFurniture
      );
      fridge.position.set(11, 1.1, -6);
      fridge.castShadow = !lowPerformanceMode;
      group.add(fridge);

      // Stove
      const stove = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.9, 1.5),
        new THREE.MeshLambertMaterial({ color: 0x2c2c2c })
      );
      stove.position.set(5, 0.45, -7.5);
      stove.castShadow = !lowPerformanceMode;
      group.add(stove);

      return group;
    };

    // Enhanced lighting setup with dramatic atmosphere
    const setupLighting = () => {
      const lights: THREE.Light[] = [];
      
      // Increase ambient light in low performance mode to compensate for fewer lights
      const ambientLight = new THREE.AmbientLight(0x111111, lowPerformanceMode ? 0.4 : 0.2);
      scene.add(ambientLight);
      lights.push(ambientLight);

      // Simplified directional light in low performance mode
      const directionalLight = new THREE.DirectionalLight(0x3366ff, lowPerformanceMode ? 0.4 : 0.6);
      directionalLight.position.set(20, 30, 20);
      
      if (!lowPerformanceMode) {
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024; // Reduced from 2048
        directionalLight.shadow.mapSize.height = 1024; // Reduced from 2048
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
      }
      
      scene.add(directionalLight);
      lights.push(directionalLight);

      // Only add room lights in high performance mode
      if (!lowPerformanceMode) {
        const roomLights = [
          { pos: [-9, 2.8, -3], color: 0x5e8eff, intensity: 1.2, name: 'bedroom' },
          { pos: [6, 2.8, 3], color: 0xff9c41, intensity: 1.0, name: 'living' },
          { pos: [7, 2.8, -4], color: 0x66ffcc, intensity: 1.1, name: 'kitchen' },
          { pos: [3, 2.8, 3], color: 0xffcc66, intensity: 0.9, name: 'dining' },
          { pos: [-6, 2.8, 6], color: 0xcc66ff, intensity: 0.8, name: 'bathroom' }
        ];

        roomLights.forEach((lightData, index) => {
          const light = new THREE.PointLight(lightData.color, lightData.intensity, 12);
          light.position.set(...lightData.pos);
          light.castShadow = true;
          light.shadow.mapSize.width = 512; // Reduced from 1024
          light.shadow.mapSize.height = 512; // Reduced from 1024
          light.userData = { 
            isRoomLight: true, 
            originalIntensity: lightData.intensity,
            isOn: true,
            index,
            name: lightData.name
          };
          scene.add(light);
          lights.push(light);

          // Enhanced light fixtures
          const fixture = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 6), // Reduced geometry complexity
            new THREE.MeshBasicMaterial({ 
              color: lightData.color,
              transparent: true,
              opacity: 0.9
            })
          );
          fixture.position.copy(light.position);
          fixture.userData = { lightIndex: index, isLightFixture: true };
          scene.add(fixture);

          // Light glow effect - simplified
          const glowGeometry = new THREE.SphereGeometry(0.3, 8, 6); // Reduced geometry complexity
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: lightData.color,
            transparent: true,
            opacity: 0.1
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.copy(light.position);
          scene.add(glow);
        });
      }

      lightsRef.current = lights;
    };

    // Enhanced mouse controls for camera movement
    const handleMouseDown = throttle((event: MouseEvent) => {
      setIsDragging(true);
      setLastMousePosition({ x: event.clientX, y: event.clientY });
    }, 50);

    const handleMouseMove = throttle((event: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - lastMousePosition.x;
      const deltaY = event.clientY - lastMousePosition.y;

      // Rotate camera around the scene
      const spherical = new THREE.Spherical();
      const vector = new THREE.Vector3();
      vector.copy(camera.position).sub(new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z));
      spherical.setFromVector3(vector);

      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      vector.setFromSpherical(spherical);
      const newPosition = vector.add(new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z));
      
      setCameraPosition({ x: newPosition.x, y: newPosition.y, z: newPosition.z });
      camera.position.copy(newPosition);
      camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);

      setLastMousePosition({ x: event.clientX, y: event.clientY });
    }, 50);

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Zoom controls
    const handleWheel = throttle((event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = 0.1;
      const newZoom = Math.max(0.5, Math.min(3.0, zoom + (event.deltaY > 0 ? zoomSpeed : -zoomSpeed)));
      setZoom(newZoom);
      
      const direction = new THREE.Vector3();
      direction.subVectors(camera.position, new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z));
      direction.normalize();
      
      const distance = 50 / newZoom;
      const newPosition = new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z).add(direction.multiplyScalar(distance));
      
      setCameraPosition({ x: newPosition.x, y: newPosition.y, z: newPosition.z });
      camera.position.copy(newPosition);
      camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    }, 100);

    // Enhanced click handler for lights
    const handleClick = throttle((event: MouseEvent) => {
      if (isDragging) return;
      
      // Skip light interaction in low performance mode
      if (lowPerformanceMode) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const lightFixtures = scene.children.filter(child => 
        child.userData && child.userData.isLightFixture
      );
      
      const intersects = raycaster.intersectObjects(lightFixtures);
      
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const lightIndex = intersect.object.userData.lightIndex;
        const roomLights = lightsRef.current.filter(light => light.userData.isRoomLight);
        const light = roomLights[lightIndex];
        
        if (light) {
          light.userData.isOn = !light.userData.isOn;
          light.intensity = light.userData.isOn ? light.userData.originalIntensity : 0;
          
          const fixture = intersect.object as THREE.Mesh;
          const material = fixture.material as THREE.MeshBasicMaterial;
          material.opacity = light.userData.isOn ? 0.9 : 0.3;
          material.emissiveIntensity = light.userData.isOn ? 0.3 : 0;
        }
      }
    }, 200);

    // Build the enhanced scene
    const floorPlan = createFloorPlan();
    const furniture = createFurniture();
    
    scene.add(floorPlan);
    scene.add(furniture);
    setupLighting();

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('click', handleClick);

    // Optimized animation loop with lower frame rate in low performance mode
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Render at lower frame rate in low performance mode
      if (lowPerformanceMode && animationIdRef.current % 2 !== 0) {
        return;
      }
      
      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate();
    setIsLoaded(true);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleClick);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
  }, [isDragging, lastMousePosition, cameraPosition, cameraTarget, zoom]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: '600px' }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="text-white text-lg font-medium mb-2">Loading Interactive 3D Floor Plan...</div>
            <div className="text-gray-400 text-sm">Preparing immersive experience</div>
          </div>
        </div>
      )}
      
      {/* Enhanced controls panel */}
      {!lowPerformanceMode && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-xl backdrop-blur-sm border border-gray-800">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span className="font-semibold text-primary">Interactive Controls</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">🖱️</span>
                <span>Drag to rotate view</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">🔍</span>
                <span>Scroll to zoom in/out</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">💡</span>
                <span>Click lights to toggle</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-600">
              Zoom: {zoom.toFixed(1)}x
            </div>
          </div>
        </div>
      )}

      {/* Enhanced room labels 
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-xl backdrop-blur-sm border border-gray-700">
        <div className="space-y-2">
          <div className="font-semibold text-primary mb-3 flex items-center">
            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
            Floor Plan Layout
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">🛏️</span>
              <span>Master Bedroom</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">🛋️</span>
              <span>Living Room</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">🍽️</span>
              <span>Dining Area</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">👨‍🍳</span>
              <span>Modern Kitchen</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400">🚿</span>
              <span>Bathroom</span>
            </div>
          </div>
        </div>
      </div>*/}

      {/* Zoom indicator 
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-700">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-primary">🔍</span>
          <span>Zoom: {zoom.toFixed(1)}x</span>
        </div>
      </div>*/}
    </div>
  );
};
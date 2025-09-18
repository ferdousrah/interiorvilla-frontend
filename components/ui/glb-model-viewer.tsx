'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize2, Minimize2 } from 'lucide-react';

interface ModelViewerProps {
  className?: string;
  modelPath?: string; // defaults to /3dmodel/scene.gltf
}

export const GLBModelViewer: React.FC<ModelViewerProps> = ({
  className = '',
  modelPath = '/3dmodel/scene.gltf',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const modelRef = useRef<THREE.Group>();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 3, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controlsRef.current = controls;

    // lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // GLTF Loader
    const loader = new GLTFLoader();
    
    // Set up loading manager for better error handling
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      setLoadingProgress(progress);
    };
    
    loadingManager.onError = (url) => {
      console.error('Loading error for:', url);
      setError(`Failed to load resource: ${url}`);
      setIsLoading(false);
    };
    
    const gltfLoader = new GLTFLoader(loadingManager);

    // Load the complete model path
    gltfLoader.load(
      modelPath, // Use the full path directly
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // center + scale model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.scale.setScalar(5 / size);

        scene.add(model);

        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
        console.log('✅ 3D model loaded successfully');
      },
      (xhr) => {
        if (xhr.total) {
          setLoadingProgress((xhr.loaded / xhr.total) * 100);
        }
      },
      (err) => {
        console.error('❌ Error loading GLTF:', err);
        console.error('Model path attempted:', modelPath);
        setError(`Failed to load 3D model. Please check if the model file exists at: ${modelPath}`);
        setIsLoading(false);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [modelPath]);

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
      setIsAutoRotating(controlsRef.current.autoRotate);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full bg-black" style={{ minHeight: '600px' }} />

      {/* Loading UI */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white">{Math.round(loadingProgress)}% Loading</div>
          </div>
        </div>
      )}

      {/* Error UI */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          {error}
        </div>
      )}

      {/* Controls */}
      {isLoaded && (
        <div className="absolute bottom-6 left-6 flex gap-2 bg-black/70 p-3 rounded-lg">
          <button onClick={toggleAutoRotate} title="Toggle auto rotate">
            <RotateCw className={`w-5 h-5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={toggleFullscreen} title="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
};

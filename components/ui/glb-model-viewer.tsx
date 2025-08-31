'use client'

import React, { useRef, useEffect, useState, Suspense } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize2, Minimize2 } from 'lucide-react';

// Lazy load Three.js components
const GLTFLoader = React.lazy(() => 
  import('three/examples/jsm/loaders/GLTFLoader.js').then(module => ({ default: module.GLTFLoader }))
);

const OrbitControls = React.lazy(() => 
  import('three/examples/jsm/controls/OrbitControls.js').then(module => ({ default: module.OrbitControls }))
);

interface GLBModelViewerProps {
  className?: string;
  modelPath?: string;
}

const ModelViewerFallback = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-white text-lg font-medium [font-family:'Fahkwang',Helvetica]">Loading 3D Experience</div>
    </div>
  </div>
);

export const GLBModelViewer: React.FC<GLBModelViewerProps> = ({ 
  className = "",
  modelPath = "/intro.glb"
}) => {
  return (
    <Suspense fallback={<ModelViewerFallback />}>
      <ModelViewerInner className={className} modelPath={modelPath} />
    </Suspense>
  );
};

const ModelViewerInner: React.FC<GLBModelViewerProps> = ({ 
  className = "",
  modelPath = "/intro.glb"
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const modelRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!mountRef.current) return;

    const initializeViewer = async () => {
      try {
        // Dynamically import Three.js components
        const [{ GLTFLoader }, { OrbitControls }] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/controls/OrbitControls.js')
        ]);

        if (!mounted) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60, // Reduced FOV for more focused view
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(-3, 4, 6); // Front-left position to show staircase clearly
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
        const controls = new OrbitControls.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false; // Disable mouse scroll zoom
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 2; // Closer minimum for detailed view
    controls.maxDistance = 15; // Reduced max distance for better control
    controls.maxPolarAngle = Math.PI;
    controls.minPolarAngle = 0;
    controlsRef.current = controls;

    // Enhanced lighting setup
    const setupLighting = () => {
      // Ambient light for overall illumination
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      scene.add(ambientLight);

      // Main directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
      directionalLight.position.set(15, 15, 10);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -15;
      directionalLight.shadow.camera.right = 15;
      directionalLight.shadow.camera.top = 15;
      directionalLight.shadow.camera.bottom = -15;
      scene.add(directionalLight);

      // Fill light from opposite side
      const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.6);
      fillLight.position.set(-8, 8, -8);
      scene.add(fillLight);

      // Rim light for dramatic effect
      const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
      rimLight.position.set(0, 15, -15);
      scene.add(rimLight);

      // Additional point lights for better illumination
      const pointLight1 = new THREE.PointLight(0x75BF44, 0.5, 50);
      pointLight1.position.set(10, 10, 10);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xEE5428, 0.3, 30);
      pointLight2.position.set(-10, 5, -10);
      scene.add(pointLight2);
    };

    setupLighting();

    // Load GLB model
        const loader = new GLTFLoader.GLTFLoader();
    
    // Loading manager for progress tracking
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      setLoadingProgress(progress);
    };

    loader.manager = loadingManager;

    loader.load(
      modelPath,
      (gltf) => {
        if (!mounted) return;
        const model = gltf.scene;
        modelRef.current = model;

        // Enable shadows for all meshes
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Enhance materials if needed
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.envMapIntensity = 1.0;
                    mat.roughness = Math.min(mat.roughness, 0.8);
                    mat.metalness = Math.max(mat.metalness, 0.1);
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = 1.0;
                child.material.roughness = Math.min(child.material.roughness, 0.8);
                child.material.metalness = Math.max(child.material.metalness, 0.1);
              }
            }
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model
        model.position.sub(center);

        // Scale the model to fit nicely in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 12 / maxDim; // Even larger scale for more detailed view
        model.scale.setScalar(scale);

        scene.add(model);
        
        // Set optimal camera position focused on staircase area
        const optimalDistance = maxDim * 0.6; // Much closer for detailed view
        camera.position.set(
          -optimalDistance * 0.8, // Front-left position (negative X for left side)
          optimalDistance * 0.9,   // Higher Y position for better top-down angle
          optimalDistance * 1.2    // Forward Z position for front view
        );
        
        // Focus camera on the staircase area (slightly above center)
        const focusPoint = new THREE.Vector3(0, size.y * 0.2, 0); // Focus slightly above center
        controls.target.copy(focusPoint);
        controls.update();

        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      },
      (progress) => {
        const percentComplete = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
        setLoadingProgress(percentComplete);
      },
      (error) => {
        console.error('Error loading GLB model:', error);
        if (mounted) {
          setError('Failed to load intro.glb. Please ensure the file is placed in the public folder.');
        }
        setIsLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      if (!mounted) return;
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (controls) {
        controls.update();
      }
      
      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !mounted) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate();
      } catch (error) {
        console.error('Failed to initialize 3D viewer:', error);
        if (mounted) {
          setError('Failed to initialize 3D viewer');
          setIsLoading(false);
        }
      }
    };

    initializeViewer();

    // Cleanup
    return () => {
      mounted = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      scene?.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material?.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
      
      renderer?.dispose();
      controls?.dispose();
    };
  }, [modelPath]);

  // Control functions
  const zoomIn = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const currentDistance = controls.getDistance();
      const newDistance = Math.max(currentDistance * 0.7, controls.minDistance); // More aggressive zoom in
      
      const direction = new THREE.Vector3();
      cameraRef.current.getWorldDirection(direction);
      const targetPosition = new THREE.Vector3().copy(controls.target).add(direction.multiplyScalar(-newDistance));
      
      gsap.to(cameraRef.current.position, {
        duration: 0.5,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: "power2.out"
      });
      controls.update();
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const currentDistance = controls.getDistance();
      const newDistance = Math.min(currentDistance * 1.4, controls.maxDistance); // More aggressive zoom out
      
      const direction = new THREE.Vector3();
      cameraRef.current.getWorldDirection(direction);
      const targetPosition = new THREE.Vector3().copy(controls.target).add(direction.multiplyScalar(-newDistance));
      
      gsap.to(cameraRef.current.position, {
        duration: 0.5,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: "power2.out"
      });
      controls.update();
    }
  };

  const resetView = () => {
    if (controlsRef.current && cameraRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      
      // Smooth reset animation
      gsap.to(camera.position, {
        duration: 1.5,
        x: -3, // Front-left position
        y: 4,  // Higher for better angle
        z: 6,  // Forward position
        ease: "power2.inOut"
      });
      
      gsap.to(controls.target, {
        duration: 1.5,
        x: 0,
        y: 1, // Focus slightly above ground level
        z: 0,
        ease: "power2.inOut",
        onUpdate: () => controls.update()
      });
      
      // Stop auto rotation
      controls.autoRotate = false;
      setIsAutoRotating(false);
      controls.update();
    }
  };

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

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing bg-gradient-to-br from-gray-900 via-black to-gray-800"
        style={{ minHeight: '600px' }}
        role="img"
        aria-label="3D model viewer showing interior design"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-secondary/30 rounded-full mx-auto animate-pulse"></div>
            </div>
            <div className="text-white text-xl font-medium mb-3 [font-family:'Fahkwang',Helvetica]">Loading 3D Experience</div>
            <div className="text-gray-400 text-base mb-6 [font-family:'Fahkwang',Helvetica]">Preparing your immersive journey...</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
                role="progressbar"
                aria-valuenow={loadingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="text-gray-400 text-sm mt-3 [font-family:'Fahkwang',Helvetica]">{Math.round(loadingProgress)}% Complete</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-white text-xl font-medium mb-3 [font-family:'Fahkwang',Helvetica]">Failed to Load 3D Model</div>
            <div className="text-gray-400 text-base mb-4 [font-family:'Fahkwang',Helvetica]">{error}</div>
            <div className="text-gray-500 text-sm mb-6 [font-family:'Fahkwang',Helvetica]">
              Make sure intro.glb is placed in the public folder
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-300 hover:scale-105 [font-family:'Fahkwang',Helvetica] font-medium"
            >
              Retry Loading
            </button>
          </div>
        </div>
      )}
      
      {/* Controls panel */}
      {isLoaded && (
        <div className="absolute bottom-6 left-6 bg-black/90 backdrop-blur-md text-white p-5 rounded-2xl border border-gray-600/50 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
              <span className="font-semibold text-primary text-base [font-family:'Fahkwang',Helvetica]">3D Controls</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={zoomIn}
                className="w-10 h-10 bg-gray-700/60 hover:bg-primary/70 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 border border-gray-600/30"
                title="Zoom In"
                aria-label="Zoom in on 3D model"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              
              <button
                onClick={zoomOut}
                className="w-10 h-10 bg-gray-700/60 hover:bg-primary/70 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 border border-gray-600/30"
                title="Zoom Out"
                aria-label="Zoom out on 3D model"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              
              <button
                onClick={resetView}
                className="w-10 h-10 bg-gray-700/60 hover:bg-secondary/70 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-secondary/30 border border-gray-600/30"
                title="Reset View"
                aria-label="Reset 3D model view"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleAutoRotate}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-600/30 ${
                  isAutoRotating 
                    ? 'bg-primary/70 hover:bg-primary/80 shadow-lg shadow-primary/30' 
                    : 'bg-gray-700/60 hover:bg-primary/70 hover:shadow-lg hover:shadow-primary/30'
                }`}
                title={isAutoRotating ? "Stop Auto Rotate" : "Start Auto Rotate"}
                aria-label={isAutoRotating ? "Stop auto rotation" : "Start auto rotation"}
              >
                <RotateCw className={`w-5 h-5 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              </button>
            </div>
            
            <div className="pt-3 border-t border-gray-600/30">
              <button
                onClick={toggleFullscreen}
                className="w-full h-10 bg-gray-700/60 hover:bg-secondary/70 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary/30 border border-gray-600/30 mb-3"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
            
            
          </div>
        </div>
      )}

      

     {/* Scroll Down Arrow Indicator */}
     {isLoaded && (
       <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
         <button
           onClick={() => {
             const nextSection = document.querySelector('[data-next-section]');
             if (nextSection) {
               nextSection.scrollIntoView({ behavior: 'smooth' });
             } else {
               // Fallback: scroll down by viewport height
               window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
             }
           }}
           className="group flex flex-col items-center space-y-2 bg-black/80 backdrop-blur-md text-white px-4 py-3 rounded-2xl border border-gray-600/50 shadow-xl hover:bg-black/90 transition-all duration-300 hover:scale-105"
           title="Scroll to next section"
           aria-label="Scroll to next section"
         >
           
           <div className="relative">
             <div className="w-8 h-8 border-2 border-primary rounded-full flex items-center justify-center group-hover:border-white transition-colors duration-300">
               <svg 
                 className="w-4 h-4 text-primary group-hover:text-white transition-colors duration-300 animate-bounce" 
                 fill="none" 
                 stroke="currentColor" 
                 viewBox="0 0 24 24"
                 style={{ animationDuration: '2s' }}
                 aria-hidden="true"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
               </svg>
             </div>
             {/* Pulsing ring effect */}
             <div className="absolute inset-0 w-8 h-8 border-2 border-primary rounded-full animate-ping opacity-30 group-hover:border-white"></div>
           </div>
         </button>
       </div>
     )}
    </div>
  );
};
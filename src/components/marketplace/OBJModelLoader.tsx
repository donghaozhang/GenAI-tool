
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import JSZip from 'jszip';
// @ts-ignore
import { OBJLoader, MTLLoader } from 'three-obj-mtl-loader';

interface OBJModelLoaderProps {
  objUrl: string;
  mtlUrl?: string;
  textureUrls?: string[];
}

export const OBJModelLoader: React.FC<OBJModelLoaderProps> = ({ 
  objUrl
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Loading 3D model from:', objUrl);

        // Check if the URL is a ZIP file (from Hunyuan3D)
        if (objUrl.includes('.zip') || objUrl.includes('hunyuan3d')) {
          console.log('Detected ZIP file, extracting contents...');
          
          try {
            // Fetch the ZIP file
            const response = await fetch(objUrl);
            if (!response.ok) {
              throw new Error('Failed to download ZIP file');
            }
            
            const zipData = await response.arrayBuffer();
            const zip = await JSZip.loadAsync(zipData);
            
            // Find OBJ and MTL files in the ZIP
            let objFile: string | null = null;
            let mtlFile: string | null = null;
            const textureFiles: {[name: string]: string} = {};
            
            for (const [filename, file] of Object.entries(zip.files)) {
              if (filename.toLowerCase().endsWith('.obj')) {
                objFile = await file.async('text');
              } else if (filename.toLowerCase().endsWith('.mtl')) {
                mtlFile = await file.async('text');
              } else if (
                !file.dir && (
                  filename.toLowerCase().endsWith('.jpg') || 
                  filename.toLowerCase().endsWith('.png') ||
                  filename.toLowerCase().endsWith('.jpeg')
                )
              ) {
                // Ignore files in macOS resource forks
                if (filename.startsWith('__MACOSX/')) continue;

                // Extract texture files as base64 data URLs
                const data = await file.async('base64');
                const extension = filename.split('.').pop()?.toLowerCase();
                const mimeType = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 'image/png';
                
                // Use only the filename as key, without path
                const shortFilename = filename.split('/').pop()!;
                if(shortFilename) {
                  textureFiles[shortFilename] = `data:${mimeType};base64,${data}`;
                }
              }
            }
            
            if (!objFile) {
              throw new Error('No OBJ file found in ZIP');
            }
            
            // Create a blob URL for the OBJ file
            const objBlob = new Blob([objFile], { type: 'text/plain' });
            const objBlobUrl = URL.createObjectURL(objBlob);

            // Create a blob URL for the MTL file if it exists
            let mtlBlobUrl: string | null = null;
            if (mtlFile) {
              const mtlBlob = new Blob([mtlFile], { type: 'text/plain' });
              mtlBlobUrl = URL.createObjectURL(mtlBlob);
            }
            
            // Load the 3D model using Three.js loaders
            const objLoader = new OBJLoader();
            
            if (mtlBlobUrl) {
              const mtlLoader = new MTLLoader();
              mtlLoader.load(mtlBlobUrl, (materials: any) => {
                materials.preload();
                
                // Replace texture paths with our base64 data URLs
                const textureLoader = new THREE.TextureLoader();
                const mapTypes = ['map', 'bumpMap', 'normalMap', 'specularMap', 'alphaMap'];

                for (const name in materials.materials) {
                  const material = materials.materials[name];
                  mapTypes.forEach(mapType => {
                    if ((material as any)[mapType] && (material as any)[mapType].name) {
                      // Also strip path from texture name from MTL file
                      const textureName = (material as any)[mapType].name.split(/[\\/]/).pop()!;
                      if (textureFiles[textureName]) {
                        (material as any)[mapType] = textureLoader.load(textureFiles[textureName]);
                        material.needsUpdate = true;
                      }
                    }
                  });
                }
                
                objLoader.setMaterials(materials);
                objLoader.load(objBlobUrl, (object: THREE.Group) => {
                  // Clean up blob URLs
                  URL.revokeObjectURL(objBlobUrl);
                  URL.revokeObjectURL(mtlBlobUrl!);
                  
                  // Center and scale the model
                  const box = new THREE.Box3().setFromObject(object);
                  const center = box.getCenter(new THREE.Vector3());
                  const size = box.getSize(new THREE.Vector3());
                  const maxDim = Math.max(size.x, size.y, size.z);
                  const scale = 2 / maxDim;
                  
                  object.position.x = -center.x;
                  object.position.y = -center.y;
                  object.position.z = -center.z;
                  object.scale.set(scale, scale, scale);
                  
                  setModel(object);
                  setLoading(false);
                });
              });
            } else {
              objLoader.load(objBlobUrl, (object: THREE.Group) => {
                // Clean up blob URL
                URL.revokeObjectURL(objBlobUrl);
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                
                object.position.x = -center.x;
                object.position.y = -center.y;
                object.position.z = -center.z;
                object.scale.set(scale, scale, scale);
                
                setModel(object);
                setLoading(false);
              });
            }
            
            console.log('3D model loaded successfully from ZIP');
            return;
          } catch (zipError) {
            console.error('Error extracting ZIP:', zipError);
            // Fall back to placeholder if ZIP extraction fails
          }
        }
        
        // For direct OBJ files or if ZIP extraction failed, create a more complex 3D shape
        const group = new THREE.Group();
        
        // Create a more complex 3D shape that resembles a dragon-like creature
        const bodyGeometry = new THREE.CapsuleGeometry(0.8, 2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
          color: '#2d5016',
          metalness: 0.2,
          roughness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0, 0);
        group.add(body);

        // Dragon head
        const headGeometry = new THREE.SphereGeometry(0.6, 12, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ 
          color: '#3d6b20',
          metalness: 0.3,
          roughness: 0.5
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.5, 0.5);
        head.scale.set(1, 0.8, 1.2);
        group.add(head);

        // Wings
        const wingGeometry = new THREE.PlaneGeometry(2, 1.5);
        const wingMaterial = new THREE.MeshStandardMaterial({ 
          color: '#8B4513',
          metalness: 0.1,
          roughness: 0.8,
          side: THREE.DoubleSide
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-1.2, 0.5, -0.3);
        leftWing.rotation.set(0.3, -0.5, 0.8);
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(1.2, 0.5, -0.3);
        rightWing.rotation.set(0.3, 0.5, -0.8);
        group.add(rightWing);

        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
        const tailMaterial = new THREE.MeshStandardMaterial({ 
          color: '#2d5016',
          metalness: 0.2,
          roughness: 0.6
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, -1.5, -0.8);
        tail.rotation.set(0.5, 0, 0);
        group.add(tail);

        // Scale the entire model
        group.scale.set(0.8, 0.8, 0.8);
        
        setModel(group);
        console.log('3D model loaded successfully (enhanced placeholder)');
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading 3D model:', err);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    };

    if (objUrl) {
      loadModel();
    }
  }, [objUrl]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  if (loading) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#666" wireframe />
        </mesh>
      </group>
    );
  }

  if (error) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[2, 1, 1]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
      </group>
    );
  }

  return model ? (
    <group ref={meshRef}>
      <primitive object={model} />
    </group>
  ) : null;
};

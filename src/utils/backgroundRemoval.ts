export const processBackgroundRemoval = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Starting background removal process...');
    
    // Import transformers dynamically
    const { pipeline, env } = await import('@huggingface/transformers');
    
    // Configure transformers.js
    env.allowLocalModels = false;
    env.useBrowserCache = false;
    
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // Convert to canvas and resize if needed
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    const MAX_SIZE = 1024;
    let { width, height } = img;
    
    if (width > MAX_SIZE || height > MAX_SIZE) {
      if (width > height) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    // Process with segmentation model
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create output canvas with transparent background
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply mask to alpha channel
    const outputImageData = outputCtx.getImageData(0, 0, width, height);
    const data = outputImageData.data;
    
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert mask to keep subject, remove background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    // Convert to data URL
    return outputCanvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

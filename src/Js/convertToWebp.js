const convertToWebP = async (file, maxWidth = 720, maxHeight = 720, quality = 0.3) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
  
          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
  
          // Crear canvas con el nuevo tamaño
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convertir a WebP con calidad ajustada
          canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
        };
      };
    });
  };
  
  export default convertToWebP;
  
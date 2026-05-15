/**
 * Robust file download utility that handles both Web and Mobile (Flutter WebView)
 * 
 * @param {Object} options
 * @param {Blob|ArrayBuffer|String} options.data - The file content
 * @param {String} options.filename - The name of the file to save as
 * @param {String} options.type - The MIME type of the file
 */
export const downloadFile = ({ data, filename, type }) => {
  console.log(`[DownloadUtils] Starting download: ${filename} (${type})`);

  // 1. Create a blob from the data if it's not already one
  const blob = data instanceof Blob ? data : new Blob([data], { type });

  // 2. Detect if we are on a mobile device or in a potential WebView
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                   (navigator.maxTouchPoints > 0 && /Safari/i.test(navigator.userAgent));
  
  const isFlutter = !!window.flutter_inappwebview;
  
  console.log(`[DownloadUtils] Environment: isMobile=${isMobile}, isFlutter=${isFlutter}`);

  // 3. If in Flutter WebView, try to use the native bridge first
  if (isFlutter && typeof window.flutter_inappwebview.callHandler === "function") {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64data = reader.result; // This is a data URL: data:application/pdf;base64,...
        console.log(`[DownloadUtils] Sending file to Flutter bridge...`);
        
        await window.flutter_inappwebview.callHandler("downloadFile", {
          base64Data: base64data,
          filename: filename,
          mimeType: type
        });
        console.log(`[DownloadUtils] Flutter bridge call successful`);
      } catch (err) {
        console.error(`[DownloadUtils] Flutter bridge error:`, err);
        // Fallback to standard mobile approach if bridge fails
        triggerMobileDownload(blob, filename);
      }
    };
    reader.readAsDataURL(blob);
    return;
  }

  if (isMobile) {
    triggerMobileDownload(blob, filename);
  } else {
    // 4. Desktop approach: Use URL.createObjectURL
    console.log(`[DownloadUtils] Using desktop download approach`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    
    link.style.display = "none";
    document.body.appendChild(link);
    
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
};

/**
 * Helper to trigger mobile-specific download using Data URL
 */
const triggerMobileDownload = (blob, filename) => {
  console.log(`[DownloadUtils] Using mobile download approach (Data URL)`);
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64data = reader.result;
    const link = document.createElement("a");
    link.href = base64data;
    link.download = filename;
    
    link.style.display = "none";
    document.body.appendChild(link);
    
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1000);
  };
  reader.readAsDataURL(blob);
};


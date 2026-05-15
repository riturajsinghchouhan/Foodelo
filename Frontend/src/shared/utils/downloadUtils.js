import { toast } from "sonner";

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
  
  // Create a blob from the data if it's not already one
  const blob = data instanceof Blob ? data : new Blob([data], { type });

  // Detect environment
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                   (navigator.maxTouchPoints > 0 && /Safari/i.test(navigator.userAgent));
  
  const isFlutter = !!window.flutter_inappwebview;
  
  console.log(`[DownloadUtils] Environment: isMobile=${isMobile}, isFlutter=${isFlutter}`);

  // If in Flutter WebView, try to use the native bridge first
  if (isFlutter && typeof window.flutter_inappwebview.callHandler === "function") {
    toast.info(`Attempting mobile download: ${filename}...`);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64data = reader.result; 
        console.log(`[DownloadUtils] Sending file to Flutter bridge...`);
        
        // Race the bridge call against a timeout
        const bridgePromise = window.flutter_inappwebview.callHandler("downloadFile", {
          base64Data: base64data,
          filename: filename,
          mimeType: type
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Bridge timeout")), 3000)
        );

        await Promise.race([bridgePromise, timeoutPromise]);
        
        console.log(`[DownloadUtils] Flutter bridge call successful`);
        toast.success("Download started (Mobile App)");
      } catch (err) {
        console.warn(`[DownloadUtils] Flutter bridge failed or not implemented, falling back:`, err);
        triggerMobileDownload(blob, filename, true);
      }
    };
    reader.onerror = () => {
      console.error("[DownloadUtils] FileReader error");
      triggerMobileDownload(blob, filename, true);
    };
    reader.readAsDataURL(blob);
    return;
  }

  if (isMobile) {
    triggerMobileDownload(blob, filename, false);
  } else {
    // Desktop approach: Use URL.createObjectURL
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
const triggerMobileDownload = (blob, filename, isFallback) => {
  console.log(`[DownloadUtils] Using mobile download approach (Data URL). Fallback=${isFallback}`);
  if (isFallback) {
    toast.info("Preparing download...");
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64data = reader.result;
    const link = document.createElement("a");
    
    // Set properties to encourage mobile OS to handle as download
    link.href = base64data;
    link.download = filename;
    link.target = "_blank"; // Often helps in WebViews
    
    link.style.display = "none";
    document.body.appendChild(link);
    
    // Trigger click
    link.click();
    
    if (isFallback) {
      toast.success("Download triggered. If nothing happens, check app permissions.");
    }

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1000);
  };
  reader.onerror = () => {
    toast.error("Failed to read file for download");
  };
  reader.readAsDataURL(blob);
};



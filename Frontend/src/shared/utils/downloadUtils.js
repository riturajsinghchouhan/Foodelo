import { toast } from "sonner";

/**
 * Robust file download utility that handles both Web and Mobile (Flutter WebView)
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

  if (isFlutter) {
    handleFlutterDownload(blob, filename, type);
  } else if (isMobile) {
    triggerMobileDownload(blob, filename, false);
  } else {
    handleDesktopDownload(blob, filename);
  }
};

/**
 * Specifically for Flutter WebView
 */
const handleFlutterDownload = (blob, filename, type) => {
  toast.info("Processing download for Mobile App...");
  
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result;
    
    // 1. Always try the standard web trigger FIRST (reliable in most modern WebViews)
    triggerMobileDownload(blob, filename, false);

    // 2. ALSO try the Flutter bridge (as a backup/native integration)
    if (window.flutter_inappwebview && typeof window.flutter_inappwebview.callHandler === "function") {
      try {
        console.log(`[DownloadUtils] Notifying Flutter bridge...`);
        // We don't 'await' this because it might hang if not implemented on native side
        window.flutter_inappwebview.callHandler("downloadFile", {
          base64Data: base64data,
          filename: filename,
          mimeType: type
        }).then(() => {
          console.log(`[DownloadUtils] Bridge call finished`);
        }).catch(e => {
          console.warn(`[DownloadUtils] Bridge error:`, e);
        });
      } catch (err) {
        console.warn(`[DownloadUtils] Bridge call error:`, err);
      }
    }
  };
  reader.onerror = () => triggerMobileDownload(blob, filename, true);
  reader.readAsDataURL(blob);
};

/**
 * Standard Desktop Download
 */
const handleDesktopDownload = (blob, filename) => {
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
};

/**
 * Helper to trigger mobile-specific download using Data URL
 */
const triggerMobileDownload = (blob, filename, isFallback) => {
  console.log(`[DownloadUtils] Using mobile trigger. Fallback=${isFallback}`);
  
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64data = reader.result;
    
    // Create anchor
    const link = document.createElement("a");
    link.href = base64data;
    link.download = filename;
    link.target = "_blank";
    link.style.display = "none";
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // If anchor click didn't work (often happens in strict WebViews), 
    // try direct window navigation as a last resort
    setTimeout(() => {
      document.body.removeChild(link);
      // Only do this if it's a small file and we're on mobile
      if (base64data.length < 2000000) { // < 2MB
         console.log("[DownloadUtils] Attempting direct window navigation fallback");
      }
    }, 500);

    toast.success("Download started. Check your notifications or downloads folder.");
  };
  reader.onerror = () => toast.error("Failed to process file for download");
  reader.readAsDataURL(blob);
};




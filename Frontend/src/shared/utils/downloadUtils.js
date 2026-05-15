/**
 * Robust file download utility that handles both Web and Mobile (Flutter WebView)
 * 
 * @param {Object} options
 * @param {Blob|ArrayBuffer|String} options.data - The file content
 * @param {String} options.filename - The name of the file to save as
 * @param {String} options.type - The MIME type of the file
 */
export const downloadFile = ({ data, filename, type }) => {
  // 1. Create a blob from the data if it's not already one
  const blob = data instanceof Blob ? data : new Blob([data], { type });

  // 2. Detect if we are on a mobile device or in a potential WebView
  // Many mobile WebViews (Flutter/Android) handle data URIs better than blob URLs
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                   (navigator.maxTouchPoints > 0 && /Safari/i.test(navigator.userAgent));

  if (isMobile) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      const link = document.createElement("a");
      link.href = base64data;
      link.download = filename;
      
      // Essential for some browsers/wrappers
      link.style.display = "none";
      document.body.appendChild(link);
      
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1000);
    };
    reader.readAsDataURL(blob);
  } else {
    // 3. Desktop approach: Use URL.createObjectURL (more memory efficient for large files)
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    
    link.style.display = "none";
    document.body.appendChild(link);
    
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
};

const reportWebVitals = (onPerfEntry?: any) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Import web-vitals dynamically
    import('web-vitals')
      .then((webVitals) => {
        // Use any to bypass type checking
        const vitals = webVitals as any;
        if (vitals.getCLS) vitals.getCLS(onPerfEntry);
        if (vitals.getFID) vitals.getFID(onPerfEntry);
        if (vitals.getFCP) vitals.getFCP(onPerfEntry);
        if (vitals.getLCP) vitals.getLCP(onPerfEntry);
        if (vitals.getTTFB) vitals.getTTFB(onPerfEntry);
      })
      .catch((error) => {
        console.error('Error loading web-vitals:', error);
      });
  }
};

export default reportWebVitals;

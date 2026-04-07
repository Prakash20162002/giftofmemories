const Loader = ({ size = "md", color = "#C9A24D" }) => {
  // Made sizes slightly responsive so they don't overpower small mobile screens
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 sm:h-10 sm:w-10 border-[3px]", // Slightly tightened desktop md size for elegance
    lg: "h-12 w-12 sm:h-16 sm:w-16 border-4",
  };

  // Fallback to 'md' if an invalid size string is accidentally passed
  const appliedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div 
      className="flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div
        // Simple border-solid class. The magic happens in the style tag below!
        className={`animate-spin rounded-full ${appliedSize} border-solid`}
        style={{ 
          // Creates a faint 20% opacity track around the whole circle
          borderColor: `${color}33`, 
          // Creates the solid 100% opacity spinning head
          borderTopColor: color 
        }} 
      />
      {/* Screen reader text for accessibility */}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
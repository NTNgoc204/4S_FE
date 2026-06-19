import React from "react";

function Skeleton({
  className = "",
  width,
  height,
  borderRadius,
  variant = "text",
}) {
  // Base classes for a premium dark-themed glassmorphic skeleton
  const baseClass = "premium-skeleton inline-block";

  let variantClass = "";
  if (variant === "circle") {
    variantClass = "rounded-full";
  } else if (variant === "rect") {
    variantClass = "rounded-2xl";
  } else {
    // text
    variantClass = "rounded-[4px] h-[1em] w-full";
  }

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  if (borderRadius) style.borderRadius = borderRadius;

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
    />
  );
}

export default Skeleton;

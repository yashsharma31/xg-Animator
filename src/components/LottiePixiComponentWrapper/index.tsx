import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import lottie from "lottie-web";

const CombinedCanvasComponent = () => {
  const pixiContainer = useRef(null);

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window === "undefined" || !pixiContainer.current) return;

    // Initialize PIXI Application
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundAlpha: 0, // Transparent background to overlay Lottie animation
    });
    pixiContainer.current.appendChild(app.view);

    // Setup Lottie Animation
    const lottieCanvas = document.createElement("canvas");
    lottieCanvas.width = 800;
    lottieCanvas.height = 600;

    const lottieAnimation = lottie.loadAnimation({
      container: lottieCanvas,
      renderer: "canvas",
      loop: true,
      autoplay: true,
      path: "/lottie-animation.json", // Update this path
    });

    // Create a PIXI sprite to display the Lottie animation
    const texture = PIXI.Texture.from(lottieCanvas);
    const sprite = new PIXI.Sprite(texture);
    app.stage.addChild(sprite);

    // Update the PIXI texture on each frame
    app.ticker.add(() => {
      texture.update();
    });

    return () => {
      app.destroy(true);
      lottieAnimation.destroy();
    };
  }, []);

  return <div ref={pixiContainer}></div>;
};

export default CombinedCanvasComponent;

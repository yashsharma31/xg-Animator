// components/PixiComponent.tsx
import { useEffect, useRef, useState } from "react";

const PixiComponent = () => {
  const pixiContainer = useRef<HTMLDivElement>(null);
  //   const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    // setIsSSR(false);
    console.log("<<<<<<<<<<<<<<<");
    if (!pixiContainer.current) return;

    // Dynamically import the PixiJS module
    import("pixi.js").then((PIXI) => {
      const app = new PIXI.Application({
        width: 40,
        height: 40,
        backgroundColor: 0x1099bb,
        preserveDrawingBuffer: true,
      });
      pixiContainer.current?.appendChild(app.view);

      // Example of adding a sprite
      const bunny = PIXI.Sprite.from(
        "https://pixijs.io/examples/examples/assets/bunny.png"
      );
      bunny.anchor.set(0.5);
      bunny.x = app.screen.width / 2;
      bunny.y = app.screen.height / 2;
      app.stage.addChild(bunny);

      app.ticker.add((delta) => {
        bunny.rotation += 0.1 * delta;
      });

      // Cleanup
      return () => {
        app.destroy(true, true);
      };
    });
  }, []);

  //   if (isSSR) return null; // Render nothing on the server

  return (
    <div
      className="border-red-300 border-4 absolute left-0"
      ref={pixiContainer}
    ></div>
  );
};

export default PixiComponent;

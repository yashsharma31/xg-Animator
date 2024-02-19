// components/LottieComponent.tsx
import { useEffect, useRef } from "react";

const LottieComponent = () => {
  const animationContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This ensures `lottie-web` is only imported in a browser environment
    if (typeof window !== "undefined") {
      import("lottie-web").then((lottie) => {
        if (animationContainer.current) {
          const animation = lottie.default.loadAnimation({
            container: animationContainer.current, // the dom element
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/lottie-animation.json", // the path to the animation json
          });

          // Cleanup
          return () => animation.destroy();
        }
      });
    }
  }, []);

  return (
    <div
      ref={animationContainer}
      className="border-2 border-blue-500 absolute left-0"
      style={{ width: 100, height: 200 }}
    ></div>
  );
};

export default LottieComponent;

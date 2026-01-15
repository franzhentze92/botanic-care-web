import { useEffect } from 'react';

const Chatbot: React.FC = () => {
  useEffect(() => {
    // Inicializar Chatbase
    (function() {
      if (!(window as any).chatbase || (window as any).chatbase("getState") !== "initialized") {
        (window as any).chatbase = (...args: any[]) => {
          if (!(window as any).chatbase.q) {
            (window as any).chatbase.q = [];
          }
          (window as any).chatbase.q.push(args);
        };
        (window as any).chatbase = new Proxy((window as any).chatbase, {
          get(target: any, prop: string) {
            if (prop === "q") {
              return target.q;
            }
            return (...args: any[]) => target(prop, ...args);
          }
        });
      }

      const onLoad = function() {
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "RoXLSfVKQcEbXGknybwdn";
        (script as any).domain = "www.chatbase.co";
        document.body.appendChild(script);
      };

      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    })();

    // Cleanup function
    return () => {
      // Remover el script si existe
      const existingScript = document.getElementById("RoXLSfVKQcEbXGknybwdn");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // Este componente no renderiza nada visualmente
};

export default Chatbot;


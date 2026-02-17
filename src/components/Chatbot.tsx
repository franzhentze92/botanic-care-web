import { useEffect } from 'react';

const Chatbot: React.FC = () => {
  useEffect(() => {
    // Verificar si el script ya existe
    const existingScript = document.getElementById("RoXLSfVKQcEbXGknybwdn");
    if (existingScript) {
      // El script ya está cargado, no hacer nada
      return;
    }

    // Inicializar la cola de Chatbase antes de cargar el script
    (window as any).chatbase = (window as any).chatbase || function(...args: any[]) {
      ((window as any).chatbase.q = (window as any).chatbase.q || []).push(args);
    };

    // Función para cargar el script
    const loadChatbaseScript = () => {
      // Verificar nuevamente si el script ya fue agregado
      if (document.getElementById("RoXLSfVKQcEbXGknybwdn")) {
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "RoXLSfVKQcEbXGknybwdn";
      script.async = true;
      script.defer = true;
      (script as any).domain = "www.chatbase.co";
      
      // Manejar errores del script
      script.onerror = () => {
        console.error('Error al cargar el script de Chatbase');
      };

      document.body.appendChild(script);
    };

    // Cargar el script
    if (document.readyState === "complete" || document.readyState === "interactive") {
      // El DOM ya está listo, cargar inmediatamente
      setTimeout(loadChatbaseScript, 0);
    } else {
      // Esperar a que el DOM esté listo
      window.addEventListener("DOMContentLoaded", loadChatbaseScript);
    }

    // Cleanup function
    return () => {
      // No remover el script en el cleanup para evitar que se recargue constantemente
      // El script debe permanecer cargado mientras el componente existe
    };
  }, []);

  return null; // Este componente no renderiza nada visualmente
};

export default Chatbot;


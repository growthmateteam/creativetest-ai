import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
      <div className="relative text-center">
        <h1 className="bg-gradient-primary bg-clip-text text-7xl font-bold tracking-tight text-transparent">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">Oops! We couldn't find that page.</p>
        <a href="/" className="mt-6 inline-block text-primary underline-offset-4 hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

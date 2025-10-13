import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <Heart className="h-12 w-12 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-6xl font-bold mb-2">404</h1>
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Oops! Looks like this page wandered off. Don't worry, your pets are safe — let's get you back home.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="default" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Heart className="h-8 w-8 text-primary" fill="currentColor" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FurrstAid
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/emergency" className="text-foreground/80 hover:text-primary transition-colors">
            Emergency
          </Link>
          <Link to="/vets" className="text-foreground/80 hover:text-primary transition-colors">
            Find Vets
          </Link>
          <Link to="/walk-service" className="text-foreground/80 hover:text-primary transition-colors">
            Walk Service
          </Link>
          <Link to="/diet" className="text-foreground/80 hover:text-primary transition-colors">
            Diet
          </Link>
          <Link to="/pet-crutch" className="text-foreground/80 hover:text-primary transition-colors">
            Pet Entrust
          </Link>
          <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

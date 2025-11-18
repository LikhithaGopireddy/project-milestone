import { Home, PlusSquare, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { mockDb } from "@/lib/mockDb";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await mockDb.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-[hsl(45,100%,51%)] bg-clip-text text-transparent">
          Pictogram
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <Home className="h-6 w-6" />
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost" size="icon">
              <PlusSquare className="h-6 w-6" />
            </Button>
          </Link>
          {user && (
            <Link to={`/profile/${user.id}`}>
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
              </Button>
            </Link>
          )}
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mockDb } from "@/lib/mockDb";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit } from "lucide-react";

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const { data: { session } } = mockDb.getSession();
    setUser(session?.user ?? null);

    const { data: { subscription } } = mockDb.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await mockDb.getProfile(userId!);

      if (error) throw error;
      setProfile(data);
      setUsername(data!.username);
      setBio(data!.bio || "");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await mockDb.getPostsByUserId(userId!);

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await mockDb.updateProfile(userId!, { username, bio });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditingProfile(false);
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isOwnProfile = user?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar user={user} />
        <main className="max-w-4xl mx-auto pt-20 pb-8 px-4">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto pt-20 pb-8 px-4">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-accent to-[hsl(45,100%,51%)] flex items-center justify-center text-4xl text-primary-foreground font-bold">
                {profile?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold">{profile?.username}</h1>
                  {isOwnProfile && (
                    <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Save Changes
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="flex gap-8 mb-4">
                  <div>
                    <span className="font-semibold">{posts.length}</span> posts
                  </div>
                </div>
                {profile?.bio && <p className="text-muted-foreground">{profile.bio}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;

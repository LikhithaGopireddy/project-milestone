import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
  likes: { id: string; user_id: string }[];
  comments: { id: string }[];
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // First, get all posts with likes and comments count
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          likes (id, user_id),
          comments (id)
        `)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Then get all unique user IDs
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      
      // Fetch profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Merge posts with profile data
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        username: profilesMap.get(post.user_id)?.username || "Unknown",
        avatar_url: profilesMap.get(post.user_id)?.avatar_url || "",
      })) || [];

      setPosts(postsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar user={user} />
      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <Skeleton className="h-96 w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Create your first post!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id} onUpdate={fetchPosts} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;

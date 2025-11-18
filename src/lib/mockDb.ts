// Mock in-memory database
interface User {
  id: string;
  email: string;
  password: string;
}

interface Profile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
}

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

interface Like {
  id: string;
  post_id: string;
  user_id: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

class MockDatabase {
  private users: User[] = [];
  private profiles: Profile[] = [];
  private posts: Post[] = [];
  private likes: Like[] = [];
  private comments: Comment[] = [];
  private currentUser: User | null = null;
  private sessionListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Add some demo data
    const demoUserId = this.generateId();
    this.users.push({
      id: demoUserId,
      email: "demo@example.com",
      password: "demo123",
    });
    this.profiles.push({
      id: demoUserId,
      username: "demo_user",
      bio: "Just another Instagram clone user!",
      avatar_url: "",
    });

    const demoPostId1 = this.generateId();
    const demoPostId2 = this.generateId();
    this.posts.push({
      id: demoPostId1,
      user_id: demoUserId,
      image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      caption: "Beautiful mountain landscape 🏔️",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    });
    this.posts.push({
      id: demoPostId2,
      user_id: demoUserId,
      image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      caption: "Nature is amazing! 🌲",
      created_at: new Date(Date.now() - 172800000).toISOString(),
    });

    this.likes.push({
      id: this.generateId(),
      post_id: demoPostId1,
      user_id: demoUserId,
    });

    this.comments.push({
      id: this.generateId(),
      post_id: demoPostId1,
      user_id: demoUserId,
      text: "Wow, stunning view!",
      created_at: new Date(Date.now() - 43200000).toISOString(),
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Auth methods
  async signUp(email: string, password: string, username: string) {
    const existingUser = this.users.find((u) => u.email === email);
    if (existingUser) {
      return { error: { message: "User already exists" } };
    }

    const userId = this.generateId();
    const user = { id: userId, email, password };
    this.users.push(user);
    this.profiles.push({
      id: userId,
      username: username || email.split("@")[0],
      bio: "",
      avatar_url: "",
    });

    this.currentUser = user;
    this.notifySessionListeners(user);
    return { data: { user }, error: null };
  }

  async signIn(email: string, password: string) {
    const user = this.users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return { error: { message: "Invalid credentials" } };
    }

    this.currentUser = user;
    this.notifySessionListeners(user);
    return { data: { user }, error: null };
  }

  async signOut() {
    this.currentUser = null;
    this.notifySessionListeners(null);
    return { error: null };
  }

  getSession() {
    return {
      data: { session: this.currentUser ? { user: this.currentUser } : null },
      error: null,
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const listener = (user: User | null) => {
      callback(
        user ? "SIGNED_IN" : "SIGNED_OUT",
        user ? { user } : null
      );
    };
    this.sessionListeners.push(listener);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.sessionListeners = this.sessionListeners.filter(
              (l) => l !== listener
            );
          },
        },
      },
    };
  }

  private notifySessionListeners(user: User | null) {
    this.sessionListeners.forEach((listener) => listener(user));
  }

  // Posts methods
  async getPosts() {
    return {
      data: this.posts.map((post) => ({
        ...post,
        likes: this.likes.filter((l) => l.post_id === post.id),
        comments: this.comments.filter((c) => c.post_id === post.id),
      })),
      error: null,
    };
  }

  async getPostsByUserId(userId: string) {
    return {
      data: this.posts.filter((p) => p.user_id === userId),
      error: null,
    };
  }

  async createPost(userId: string, imageUrl: string, caption: string) {
    const post: Post = {
      id: this.generateId(),
      user_id: userId,
      image_url: imageUrl,
      caption: caption,
      created_at: new Date().toISOString(),
    };
    this.posts.unshift(post);
    return { data: post, error: null };
  }

  async deletePost(postId: string) {
    this.posts = this.posts.filter((p) => p.id !== postId);
    this.likes = this.likes.filter((l) => l.post_id !== postId);
    this.comments = this.comments.filter((c) => c.post_id !== postId);
    return { error: null };
  }

  // Likes methods
  async addLike(postId: string, userId: string) {
    const like: Like = {
      id: this.generateId(),
      post_id: postId,
      user_id: userId,
    };
    this.likes.push(like);
    return { data: like, error: null };
  }

  async removeLike(likeId: string) {
    this.likes = this.likes.filter((l) => l.id !== likeId);
    return { error: null };
  }

  // Comments methods
  async getComments(postId: string) {
    return {
      data: this.comments.filter((c) => c.post_id === postId),
      error: null,
    };
  }

  async addComment(postId: string, userId: string, text: string) {
    const comment: Comment = {
      id: this.generateId(),
      post_id: postId,
      user_id: userId,
      text: text,
      created_at: new Date().toISOString(),
    };
    this.comments.push(comment);
    return { data: comment, error: null };
  }

  // Profiles methods
  async getProfile(userId: string) {
    return {
      data: this.profiles.find((p) => p.id === userId) || null,
      error: null,
    };
  }

  async getProfiles(userIds: string[]) {
    return {
      data: this.profiles.filter((p) => userIds.includes(p.id)),
      error: null,
    };
  }

  async updateProfile(
    userId: string,
    updates: Partial<Omit<Profile, "id">>
  ) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      Object.assign(profile, updates);
      return { data: profile, error: null };
    }
    return { data: null, error: { message: "Profile not found" } };
  }

  // Storage methods
  async uploadFile(file: File): Promise<{ data: { path: string } | null; error: any }> {
    // Simulate file upload by creating a temporary URL
    const url = URL.createObjectURL(file);
    return { data: { path: url }, error: null };
  }

  getPublicUrl(path: string): { data: { publicUrl: string } } {
    return { data: { publicUrl: path } };
  }
}

export const mockDb = new MockDatabase();

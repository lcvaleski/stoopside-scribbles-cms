import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase, type SiteSettings, type Post } from '@/lib/supabase';

// GET endpoint - public, no auth required
export async function GET() {
  try {
    // Fetch site settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError;
    }

    // Fetch all published posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (postsError) {
      throw postsError;
    }

    const response = {
      title: settings?.title || 'Stoop Side Scribbles',
      subtitle: settings?.subtitle || 'Welcome to Stoop Side Scribbles.',
      posts: posts || []
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// POST endpoint - requires authentication
export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, subtitle, posts } = await request.json();

    // Update or insert site settings
    const { error: settingsError } = await supabase
      .from('site_settings')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // Use a fixed ID for single row
        title,
        subtitle
      });

    if (settingsError) {
      throw settingsError;
    }

    // Delete all existing posts and insert new ones
    // This is a simple approach for MVP - in production, you'd want to sync more carefully
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Delete error:', deleteError);
    }

    // Insert all posts
    if (posts && posts.length > 0) {
      const postsToInsert = posts.map((post: Post) => ({
        title: post.title,
        content: post.content,
        date: post.date,
        published: post.published
      }));

      const { error: postsError } = await supabase
        .from('posts')
        .insert(postsToInsert);

      if (postsError) {
        throw postsError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
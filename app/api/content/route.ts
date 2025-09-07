import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_FILE = path.join(process.cwd(), 'content.json');

interface Content {
  title: string;
  subtitle: string;
  posts: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    published: boolean;
  }>;
}

async function getContent(): Promise<Content> {
  try {
    const data = await fs.readFile(CONTENT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default content if file doesn't exist
    return {
      title: "Stoop Side Scribbles",
      subtitle: "Welcome to Stoop Side Scribbles.",
      posts: []
    };
  }
}

async function saveContent(content: Content) {
  await fs.writeFile(CONTENT_FILE, JSON.stringify(content, null, 2));
}

// GET endpoint - public, no auth required
export async function GET() {
  try {
    const content = await getContent();
    return NextResponse.json(content, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
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
    const content = await request.json();
    await saveContent(content);
    return NextResponse.json({ success: true });
  } catch {
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
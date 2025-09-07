import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { apiKey, subject, body } = await request.json();

    if (!apiKey || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send to Buttondown API
    const response = await fetch('https://api.buttondown.email/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        body,
        status: 'draft', // Create as draft first for safety
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ 
        error: `Buttondown API error: ${error}` 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      message: 'Newsletter draft created. Check Buttondown to send.',
      data 
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json({ 
      error: 'Failed to send newsletter' 
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const payload = await request.json();

    const apiResponse = await fetch('https://dl.siputzx.my.id/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await apiResponse.json();

    return NextResponse.json(data, { status: apiResponse.status });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: { 
        code: 'internal_error', 
        message: 'Gagal memproses permintaan.' 
      }
    }, { status: 500 });
  }
}
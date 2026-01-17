
import { NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/weather';

export const dynamic = 'force-dynamic'; // Prevent caching so alerts are fresh

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip) {
        return NextResponse.json({ error: 'Zip code is required' }, { status: 400 });
    }

    try {
        const data = await getWeatherData(zip);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[WeatherAPI] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

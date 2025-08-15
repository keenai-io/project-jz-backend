import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Firebase App Hosting
 * 
 * This endpoint provides basic health status for the application
 * and is used by Firebase App Hosting for health monitoring.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown',
      services: {
        database: 'available', // Add actual DB health check if needed
        auth: 'available',
      }
    };

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 503 }
    );
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 });
}
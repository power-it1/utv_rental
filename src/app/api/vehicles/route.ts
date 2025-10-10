import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/vehicles - Fetch all vehicles with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const available = searchParams.get('available');
    
    let query = supabase.from('vehicles').select('*');
    
    // Filter by type if specified
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    // Filter by availability if specified
    if (available !== null) {
      query = query.eq('available', available === 'true');
    }
    
    // Order by created date
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ vehicles: data });
    
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create a new vehicle (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      name, 
      description, 
      price_per_day, 
      images, 
      specifications 
    } = body;
    
    // Validate required fields
    if (!type || !name || !price_per_day) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name, price_per_day' },
        { status: 400 }
      );
    }
    
    // Validate vehicle type
    if (!['motorcycle', 'utv', 'guided_tour'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vehicle type. Must be: motorcycle, utv, or guided_tour' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert([
        {
          type,
          name,
          description,
          price_per_day: parseFloat(price_per_day),
          images: images || [],
          specifications: specifications || {},
          available: true
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create vehicle' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Vehicle created successfully', vehicle: data },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/rentals - Fetch rentals for authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        vehicle:vehicles(id, name, type, price_per_day)
      `)
      .eq('user_id', user.id)
      .order('start_date', { ascending: true });
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch rentals' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ rentals: data });
    
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/rentals - Create a new rental
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      vehicle_id, 
      start_date, 
      end_date, 
      notes 
    } = body;
    
    // Validate required fields
    if (!vehicle_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicle_id, start_date, end_date' },
        { status: 400 }
      );
    }
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    if (startDate < today) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }
    
    // Fetch vehicle to calculate total price
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('price_per_day, available')
      .eq('id', vehicle_id)
      .single();
    
    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }
    
    if (!vehicle.available) {
      return NextResponse.json(
        { error: 'Vehicle is not available for rental' },
        { status: 400 }
      );
    }
    
    // Calculate total price
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * vehicle.price_per_day;
    
    // Check for overlapping rentals
    const { data: overlapping, error: overlapError } = await supabase
      .from('rentals')
      .select('id')
      .eq('vehicle_id', vehicle_id)
      .in('status', ['pending', 'confirmed', 'active'])
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);
    
    if (overlapError) {
      console.error('Error checking overlapping rentals:', overlapError);
    }
    
    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        { error: 'Vehicle is already booked for the selected dates' },
        { status: 409 }
      );
    }
    
    // Create rental
    const { data, error } = await supabase
      .from('rentals')
      .insert([
        {
          user_id: user.id,
          vehicle_id,
          start_date,
          end_date,
          total_price: totalPrice,
          status: 'pending',
          notes: notes || null
        }
      ])
      .select(`
        *,
        vehicle:vehicles(id, name, type, price_per_day)
      `)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create rental' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Rental created successfully', rental: data },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
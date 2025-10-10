import { NextRequest, NextResponse } from 'next/server';
import { supabase, type Database } from '@/lib/supabase';

// GET /api/vehicles/[id] - Fetch a specific vehicle by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found' }, 
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch vehicle' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ vehicle: data });
    
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[id] - Update a vehicle (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

    const body = (await request.json()) as Partial<VehicleUpdate>;
    const sanitized = { ...body } as VehicleUpdate;
    delete sanitized.id;
    delete sanitized.created_at;

    const updates: VehicleUpdate = {
      ...sanitized,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates as never)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found' }, 
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update vehicle' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Vehicle updated successfully', 
      vehicle: data 
    });
    
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/[id] - Delete a vehicle (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete vehicle' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Vehicle deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
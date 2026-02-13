import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase Admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.phone_number) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, phone_number' },
        { status: 400 }
      );
    }

    console.log('📝 Creating new doctor account...');
    console.log('Email:', body.email);
    console.log('Name:', body.name);

    // Step 1: Create Supabase Auth user
    console.log('1️⃣ Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: body.name,
      },
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create auth user: No user returned' },
        { status: 500 }
      );
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Insert doctor record into doctors table
    console.log('2️⃣ Creating doctor record...');
    const { data: doctorData, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .insert({
        email: body.email,
        name: body.name,
        phone_number: body.phone_number,
        clinic_name: body.clinic_name || null,
        clinic_address: body.clinic_address || null,
        specialization: body.specialization || null,
        consultation_fee: body.consultation_fee ? parseFloat(body.consultation_fee) : null,
        welcome_message: body.welcome_message || 'Welcome! 👋 How can we help you today?',
        whatsapp_phone_number_id: body.whatsapp_phone_number_id || null,
        whatsapp_business_account_id: body.whatsapp_business_account_id || null,
        whatsapp_access_token: body.whatsapp_access_token || null,
        is_active: true,
      })
      .select()
      .single();

    if (doctorError) {
      console.error('❌ Doctor insert error:', doctorError);
      
      // Rollback: Delete the auth user if doctor creation fails
      console.log('🔄 Rolling back auth user...');
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: `Failed to create doctor record: ${doctorError.message}` },
        { status: 400 }
      );
    }

    console.log('✅ Doctor record created:', doctorData.id);

    // Step 3: Create default clinic_config (optional)
    console.log('3️⃣ Creating default clinic config...');
    const { error: configError } = await supabaseAdmin
      .from('clinic_config')
      .insert({
        doctor_id: doctorData.id,
        opening_time: '09:00:00',
        closing_time: '18:00:00',
        holidays: [],
      });

    if (configError) {
      console.warn('⚠️  Failed to create clinic config (non-critical):', configError.message);
      // Don't fail the request if config creation fails
    } else {
      console.log('✅ Clinic config created');
    }

    console.log('🎉 Doctor account created successfully!');

    return NextResponse.json({
      success: true,
      message: 'Doctor account created successfully',
      doctor: {
        id: doctorData.id,
        email: doctorData.email,
        name: doctorData.name,
      },
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Calendar, Network, Megaphone, ListOrdered, FileText, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

interface DoctorInfo {
  clinic_name: string | null;
  name: string | null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorInfo();
  }, []);

  const fetchDoctorInfo = async () => {
    try {
      setLoading(true);

      // First, check if there's a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setLoading(false);
        return;
      }

      // If no session exists, stop here
      if (!session) {
        setLoading(false);
        return;
      }

      // Now safely get the user from the session
      const user = session.user;
      
      if (!user?.email) {
        console.error('No user email found in session');
        setLoading(false);
        return;
      }

      // Fetch doctor info from database
      const { data, error } = await supabase
        .from('doctors')
        .select('clinic_name, name')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching doctor info:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        // If doctor not found (PGRST116), set default values
        if (error.code === 'PGRST116') {
          console.warn('Doctor record not found for email:', user.email);
          setDoctorInfo({
            clinic_name: 'My Clinic',
            name: user.email?.split('@')[0] || 'Doctor',
          });
        }
        
        setLoading(false);
        return;
      }

      setDoctorInfo(data);
    } catch (error) {
      console.error('Error in fetchDoctorInfo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate initials from clinic name
  const getInitials = (name: string | null) => {
    if (!name) return 'MC';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const clinicName = doctorInfo?.clinic_name || 'My Clinic';
  const initials = getInitials(doctorInfo?.clinic_name || null);

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Patients',
      href: '/patients',
      icon: Users,
    },
    {
      name: 'Appointments',
      href: '/appointments',
      icon: Calendar,
    },
    {
      name: 'Queue',
      href: '/queue',
      icon: ListOrdered,
    },
    {
      name: 'Marketing',
      href: '/marketing',
      icon: Megaphone,
    },
    {
      name: 'Network',
      href: '/network',
      icon: Network,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) {
      return;
    }

    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
      {/* Clinic Branding Header */}
      <div className="p-6 border-b border-gray-100">
        {loading ? (
          // Loading skeleton
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {/* Dynamic Avatar with Initials */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            
            {/* Clinic Name */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">{clinicName}</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        )}
      </div>

      <nav className="mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full px-6 py-3 flex items-center space-x-3 transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full px-6 py-3 flex items-center space-x-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}

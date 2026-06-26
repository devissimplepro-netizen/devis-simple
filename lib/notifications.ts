import { supabase } from './supabase/client';

export async function createNotification(userId: string, title: string, message: string, type: string) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
}

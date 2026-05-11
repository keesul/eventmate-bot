import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
  throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database queries
export const dbQueries = {
  // Users
  async createUser(telegramId, username, firstName) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        telegram_id: telegramId,
        username: username,
        first_name: firstName
      }, {
        onConflict: 'telegram_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUser(telegramId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Events
  async createEvent(userId, title, type, eventDate, eventTime, notes) {
    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        title: title,
        type: type,
        event_date: eventDate,
        event_time: eventTime,
        notes: notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserEvents(userId) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getEventById(eventId) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(title, type, eventDate, eventTime, notes, eventId, userId) {
    const { data, error } = await supabase
      .from('events')
      .update({
        title: title,
        type: type,
        event_date: eventDate,
        event_time: eventTime,
        notes: notes
      })
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(eventId, userId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async getUpcomingEvents(date) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        users!inner (
          telegram_id,
          first_name
        )
      `)
      .eq('event_date', date)
      .order('event_time', { ascending: true });

    if (error) throw error;

    // Flatten the structure
    return (data || []).map(event => ({
      ...event,
      telegram_id: event.users.telegram_id,
      first_name: event.users.first_name
    }));
  }
};

export default supabase;

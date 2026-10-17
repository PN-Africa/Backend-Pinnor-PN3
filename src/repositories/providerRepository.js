import { supabase } from "../config/supabase.js";

export const createProvider = async (providerData) => {
  const { data, error } = await supabase
    .from("providers")
    .insert(providerData)
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const getProviders = async () => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

export const getProviderById = async (id) => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

export const updateProvider = async (id, updates) => {
  const { data, error } = await supabase
    .from("providers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const updateProviderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("providers")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const deleteProvider = async (id) => {
  const { data, error } = await supabase
    .from("providers")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};
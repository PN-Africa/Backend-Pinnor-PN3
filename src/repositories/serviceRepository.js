// repositories/serviceRepository.js

import { supabase } from "../config/supabase.js";

export const createService = async (serviceData) => {
  const {
    providerId,
    name,
    description,
    durationMinutes,
    status
  } = serviceData;

  const { data, error } = await supabase
    .from("services")
    .insert({
      provider_id: providerId,
      name,
      description,
      duration_minutes: durationMinutes,
      status
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const getServices = async () => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

export const getServiceById = async (id) => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

export const updateService = async (id, updates) => {
  const mappedUpdates = {};

  if (updates.providerId !== undefined) {
    mappedUpdates.provider_id = updates.providerId;
  }

  if (updates.name !== undefined) {
    mappedUpdates.name = updates.name;
  }

  if (updates.description !== undefined) {
    mappedUpdates.description = updates.description;
  }

  if (updates.durationMinutes !== undefined) {
    mappedUpdates.duration_minutes = updates.durationMinutes;
  }

  const { data, error } = await supabase
    .from("services")
    .update(mappedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};
export const updateServiceStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("services")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const deleteService = async (id) => {
  const { data, error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};
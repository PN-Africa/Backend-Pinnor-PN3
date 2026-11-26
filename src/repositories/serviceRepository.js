
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
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

// Admin listing: includes active and inactive services.
export const getAllServices = async () => {
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
  const [appointmentsResult, slotsResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("service_id", id),

    supabase
      .from("availability_slots")
      .select("id", { count: "exact", head: true })
      .eq("service_id", id)
  ]);

  if (appointmentsResult.error) {
    throw appointmentsResult.error;
  }

  if (slotsResult.error) {
    throw slotsResult.error;
  }

  const appointmentCount = appointmentsResult.count || 0;
  const slotCount = slotsResult.count || 0;

  if (appointmentCount > 0 || slotCount > 0) {
    const error = new Error(
      "This service cannot be deleted because it has existing appointments or availability slots. Deactivate it instead."
    );

    error.statusCode = 409;
    error.code = "SERVICE_IN_USE";
    error.details = {
      appointmentCount,
      slotCount
    };

    throw error;
  }

  const { data, error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

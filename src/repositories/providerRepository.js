
import { supabase } from "../config/supabase.js";

const mapProviderFields = (providerData) => {
  const {
    userId,
    ...fields
  } = providerData;

  return {
    ...fields,
    ...(userId !== undefined ? { user_id: userId } : {})
  };
};

export const createProvider = async (providerData) => {
  const payload = mapProviderFields(providerData);

  const { data, error } = await supabase
    .from("providers")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const getProviders = async () => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};


export const getAllProviders = async () => {
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
  const payload = mapProviderFields(updates);

  const { data, error } = await supabase
    .from("providers")
    .update(payload)
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
  const { count: appointmentCount, error: appointmentError } =
    await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", id);

  if (appointmentError) throw appointmentError;

  if (appointmentCount > 0) {
    const error = new Error(
      "Provider cannot be deleted because appointment records exist. Deactivate the provider instead."
    );
    error.statusCode = 409;
    throw error;
  }

  const { count: serviceCount, error: serviceError } =
    await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", id);

  if (serviceError) throw serviceError;

  if (serviceCount > 0) {
    const error = new Error(
      "Provider cannot be deleted while associated services exist. Deactivate the provider instead."
    );
    error.statusCode = 409;
    throw error;
  }

  const { count: slotCount, error: slotError } =
    await supabase
      .from("availability_slots")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", id);

  if (slotError) throw slotError;

  if (slotCount > 0) {
    const error = new Error(
      "Provider cannot be deleted while availability slots exist. Deactivate the provider instead."
    );
    error.statusCode = 409;
    throw error;
  }

  const { data, error } = await supabase
    .from("providers")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

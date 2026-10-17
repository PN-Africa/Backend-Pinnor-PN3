
import { supabase } from "../config/supabase.js";

const getSlot = async (slotId) => {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("id", slotId)
    .single();

  if (error || !data) {
    const err = new Error("Availability slot not found");
    err.statusCode = 404;
    throw err;
  }

  return data;
};

const validateSlotTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    const err = new Error("Invalid start or end time");
    err.statusCode = 400;
    throw err;
  }

  if (start >= end) {
    const err = new Error("End time must be later than start time");
    err.statusCode = 400;
    throw err;
  }
};

const validateProviderAndService = async (
  providerId,
  serviceId
) => {
  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("id, status")
    .eq("id", providerId)
    .single();

  if (providerError || !provider) {
    const err = new Error("Provider not found");
    err.statusCode = 404;
    throw err;
  }

  if (provider.status !== "active") {
    const err = new Error("Provider is not active");
    err.statusCode = 400;
    throw err;
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, provider_id, status")
    .eq("id", serviceId)
    .single();

  if (serviceError || !service) {
    const err = new Error("Service not found");
    err.statusCode = 404;
    throw err;
  }

  if (service.provider_id !== providerId) {
    const err = new Error(
      "Service does not belong to this provider"
    );
    err.statusCode = 400;
    throw err;
  }

  if (service.status !== "active") {
    const err = new Error("Service is not active");
    err.statusCode = 400;
    throw err;
  }
};

const checkOverlap = async ({
  providerId,
  serviceId,
  startTime,
  endTime,
  excludeId
}) => {
  let query = supabase
    .from("availability_slots")
    .select("id")
    .eq("provider_id", providerId)
    .eq("service_id", serviceId)
    .neq("status", "blocked")
    .lt("start_time", endTime)
    .gt("end_time", startTime);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw error;
  }

  if (data?.length) {
    const err = new Error(
      "Availability slot overlaps with an existing slot"
    );
    err.statusCode = 409;
    throw err;
  }
};

export const createAvailabilitySlot = async ({
  providerId,
  serviceId,
  startTime,
  endTime
}) => {
  validateSlotTime(startTime, endTime);

  await validateProviderAndService(providerId, serviceId);

  await checkOverlap({
    providerId,
    serviceId,
    startTime,
    endTime
  });

  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      provider_id: providerId,
      service_id: serviceId,
      start_time: startTime,
      end_time: endTime,
      status: "available",
      is_published: false
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};


export const getAvailabilitySlots = async ({
  providerId,
  serviceId,
  date
} = {}) => {
  let query = supabase
    .from("availability_slots")
    .select(`
      id,
      provider_id,
      service_id,
      start_time,
      end_time,
      status,
      is_published,
      created_at
    `)
    .eq("status", "available")
    .eq("is_published", true)
    .gt("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (providerId) {
    query = query.eq("provider_id", providerId);
  }

  if (serviceId) {
    query = query.eq("service_id", serviceId);
  }

  if (date) {
    query = query
      .gte("start_time", `${date}T00:00:00`)
      .lt("start_time", `${date}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const getAvailabilitySlotById = async (slotId) => {
  return getSlot(slotId);
};

export const updateAvailabilitySlot = async (
  slotId,
  slotData
) => {
  const existing = await getSlot(slotId);

  if (existing.status === "booked") {
    const err = new Error(
      "Booked availability slots cannot be modified"
    );
    err.statusCode = 409;
    throw err;
  }

  const providerId =
    slotData.providerId ?? existing.provider_id;

  const serviceId =
    slotData.serviceId ?? existing.service_id;

  const startTime =
    slotData.startTime ?? existing.start_time;

  const endTime =
    slotData.endTime ?? existing.end_time;

  validateSlotTime(startTime, endTime);

  await validateProviderAndService(providerId, serviceId);

  await checkOverlap({
    providerId,
    serviceId,
    startTime,
    endTime,
    excludeId: slotId
  });

  const updates = {};

  if (slotData.providerId !== undefined) {
    updates.provider_id = providerId;
  }

  if (slotData.serviceId !== undefined) {
    updates.service_id = serviceId;
  }

  if (slotData.startTime !== undefined) {
    updates.start_time = startTime;
  }

  if (slotData.endTime !== undefined) {
    updates.end_time = endTime;
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .update(updates)
    .eq("id", slotId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteAvailabilitySlot = async (slotId) => {
  const existing = await getSlot(slotId);

  if (existing.status === "booked") {
    const err = new Error(
      "Booked availability slots cannot be deleted"
    );
    err.statusCode = 409;
    throw err;
  }

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId);

  if (error) {
    throw error;
  }

  return true;
};

export const publishAvailabilitySlot = async (slotId) => {
  const existing = await getSlot(slotId);

  if (existing.status === "booked") {
    const err = new Error("Booked slots cannot be published");
    err.statusCode = 409;
    throw err;
  }

  if (existing.status === "blocked") {
    const err = new Error(
      "Blocked slots cannot be published. Make the slot available first."
    );
    err.statusCode = 409;
    throw err;
  }

  if (existing.is_published) {
    const err = new Error("Availability slot is already published");
    err.statusCode = 409;
    throw err;
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .update({ is_published: true })
    .eq("id", slotId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const unpublishAvailabilitySlot = async (slotId) => {
  const existing = await getSlot(slotId);

  if (existing.status === "booked") {
    const err = new Error("Booked slots cannot be unpublished");
    err.statusCode = 409;
    throw err;
  }

  if (!existing.is_published) {
    const err = new Error("Availability slot is already unpublished");
    err.statusCode = 409;
    throw err;
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .update({ is_published: false })
    .eq("id", slotId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const blockAvailabilitySlot = async (slotId) => {
  const existing = await getSlot(slotId);

  if (existing.status === "booked") {
    const err = new Error("Booked slots cannot be blocked");
    err.statusCode = 409;
    throw err;
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .update({ status: "blocked" })
    .eq("id", slotId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

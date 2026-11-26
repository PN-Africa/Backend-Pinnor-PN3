
import { supabase } from "../config/supabase.js";

const LAGOS_OFFSET = "+01:00";

const fail = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const getSlot = async (id) => {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) fail("Availability slot not found", 404);
  return data;
};

const validateSlotTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    fail("Invalid start or end time", 400);
  }

  if (start >= end) {
    fail("End time must be later than start time", 400);
  }
};

const validateDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    fail("Date must use YYYY-MM-DD format", 400);
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    fail("Invalid availability date", 400);
  }

  const nextDate = new Date(parsed.getTime() + 86400000)
    .toISOString().slice(0, 10);

  return {
    start: new Date(`${date}T00:00:00.000${LAGOS_OFFSET}`).toISOString(),
    end: new Date(`${nextDate}T00:00:00.000${LAGOS_OFFSET}`).toISOString()
  };
};

const validateProviderAndService = async (providerId, serviceId) => {
  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("id, status")
    .eq("id", providerId)
    .maybeSingle();

  if (providerError) throw providerError;
  if (!provider) fail("Provider not found", 404);
  if (provider.status !== "active") fail("Provider is not active", 400);

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, provider_id, status")
    .eq("id", serviceId)
    .maybeSingle();

  if (serviceError) throw serviceError;
  if (!service) fail("Service not found", 404);
  if (service.provider_id !== providerId) {
    fail("Service does not belong to this provider", 400);
  }
  if (service.status !== "active") fail("Service is not active", 400);
};

const checkOverlap = async ({ providerId, startTime, endTime, excludeId }) => {
  let query = supabase
    .from("availability_slots")
    .select("id")
    .eq("provider_id", providerId)
    .lt("start_time", endTime)
    .gt("end_time", startTime);

  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.limit(1);
  if (error) throw error;

  if (data?.length) {
    fail(
      "Availability slot overlaps with an existing slot for this provider",
      409
    );
  }
};

export const createAvailabilitySlot = async ({
  providerId, serviceId, startTime, endTime
}) => {
  validateSlotTime(startTime, endTime);
  await validateProviderAndService(providerId, serviceId);
  await checkOverlap({ providerId, startTime, endTime });

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

  if (error) throw error;
  return data;
};

export const getAvailabilitySlots = async ({
  providerId, serviceId, date
} = {}) => {
  let query = supabase
    .from("availability_slots")
    .select("id, provider_id, service_id, start_time, end_time, status, is_published, created_at")
    .eq("status", "available")
    .eq("is_published", true)
    .gt("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (providerId) query = query.eq("provider_id", providerId);
  if (serviceId) query = query.eq("service_id", serviceId);

  if (date) {
    const range = validateDate(date);
    query = query.gte("start_time", range.start).lt("start_time", range.end);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};


export const getAllAvailabilitySlots = async ({
  providerId,
  serviceId,
  date
} = {}) => {
  let query = supabase
    .from("availability_slots")
    .select(
      "id, provider_id, service_id, start_time, end_time, status, is_published, created_at"
    )
    .order("start_time", { ascending: true });

  if (providerId) query = query.eq("provider_id", providerId);
  if (serviceId) query = query.eq("service_id", serviceId);

  if (date) {
    const range = validateDate(date);
    query = query
      .gte("start_time", range.start)
      .lt("start_time", range.end);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
};


export const getAvailabilitySlotById = async (id) => {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, provider_id, service_id, start_time, end_time, status, is_published, created_at")
    .eq("id", id)
    .eq("status", "available")
    .eq("is_published", true)
    .gt("start_time", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  if (!data) fail("Available appointment slot not found", 404);
  return data;
};

export const updateAvailabilitySlot = async (id, slotData) => {
  const existing = await getSlot(id);
  if (existing.status === "booked") {
    fail("Booked availability slots cannot be modified", 409);
  }

  const providerId = slotData.providerId ?? existing.provider_id;
  const serviceId = slotData.serviceId ?? existing.service_id;
  const startTime = slotData.startTime ?? existing.start_time;
  const endTime = slotData.endTime ?? existing.end_time;

  validateSlotTime(startTime, endTime);
  await validateProviderAndService(providerId, serviceId);
  await checkOverlap({ providerId, startTime, endTime, excludeId: id });

  const updates = {};
  if (slotData.providerId !== undefined) updates.provider_id = providerId;
  if (slotData.serviceId !== undefined) updates.service_id = serviceId;
  if (slotData.startTime !== undefined) updates.start_time = startTime;
  if (slotData.endTime !== undefined) updates.end_time = endTime;

  const { data, error } = await supabase
    .from("availability_slots")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAvailabilitySlot = async (id) => {
  const existing = await getSlot(id);
  if (existing.status === "booked") {
    fail("Booked availability slots cannot be deleted", 409);
  }

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};

export const publishAvailabilitySlot = async (id) => {
  const existing = await getSlot(id);

  if (existing.status === "booked") fail("Booked slots cannot be published", 409);
  if (existing.status === "blocked") {
    fail("Blocked slots cannot be published. Make the slot available first.", 409);
  }
  if (new Date(existing.start_time) <= new Date()) {
    fail("Past availability slots cannot be published", 409);
  }
  if (existing.is_published) fail("Availability slot is already published", 409);

  const { data, error } = await supabase
    .from("availability_slots")
    .update({ is_published: true })
    .eq("id", id)
    .eq("status", "available")
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unpublishAvailabilitySlot = async (id) => {
  const existing = await getSlot(id);

  if (existing.status === "booked") {
    fail("Booked slots cannot be unpublished", 409);
  }
  if (!existing.is_published) {
    fail("Availability slot is already unpublished", 409);
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .update({ is_published: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const blockAvailabilitySlot = async (id) => {
  const existing = await getSlot(id);
  if (existing.status === "booked") {
    fail("Booked slots cannot be blocked", 409);
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .update({ status: "blocked", is_published: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

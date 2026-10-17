import {
  createAvailabilitySlot,
  getAvailabilitySlots,
  getAvailabilitySlotById,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  publishAvailabilitySlot,
  unpublishAvailabilitySlot,
  blockAvailabilitySlot
} from "../repositories/availabilityRepository.js";

export const createAvailabilitySlotController = async (
  req,
  res,
  next
) => {
  try {
    const slot = await createAvailabilitySlot(req.body);

    res.status(201).json({
      success: true,
      message: "Availability slot created successfully",
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailabilitySlotsController = async (
  req,
  res,
  next
) => {
  try {
    const slots = await getAvailabilitySlots({
      providerId: req.query.providerId,
      serviceId: req.query.serviceId,
      date: req.query.date
    });

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailabilitySlotByIdController = async (
  req,
  res,
  next
) => {
  try {
    const slot = await getAvailabilitySlotById(req.params.id);

    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailabilitySlotController = async (
  req,
  res,
  next
) => {
  try {
    const slot = await updateAvailabilitySlot(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Availability slot updated successfully",
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvailabilitySlotController = async (
  req,
  res,
  next
) => {
  try {
    await deleteAvailabilitySlot(req.params.id);

    res.status(200).json({
      success: true,
      message: "Availability slot deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const publishAvailabilitySlotController = async (
  req,
  res,
  next
) => {
  try {
    const slot = await publishAvailabilitySlot(req.params.id);

    res.status(200).json({
      success: true,
      message: "Availability slot published successfully",
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishAvailabilitySlotController = async (
  req,
  res,
  next
) => {
  try {
    const slot = await unpublishAvailabilitySlot(req.params.id);

    res.status(200).json({
      success: true,
      message: "Availability slot unpublished successfully",
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

export const blockAvailabilitySlotController = async (
  req,
  res,
  next
) => {
  try {
    const slot = await blockAvailabilitySlot(req.params.id);

    res.status(200).json({
      success: true,
      message: "Availability slot blocked successfully",
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

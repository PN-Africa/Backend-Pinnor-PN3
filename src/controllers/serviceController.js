
import {
  createService,
  getServices,
  getAllServices,
  getServiceById,
  updateService,
  updateServiceStatus,
  deleteService
} from "../repositories/serviceRepository.js";

export const createServiceController = async (req, res, next) => {
  try {
    const service = await createService(req.body);

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

// Public listing: active services only.
export const getServicesController = async (req, res, next) => {
  try {
    const services = await getServices();

    return res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    return next(error);
  }
};

// Admin listing: all services, including inactive ones.
export const getAllServicesController = async (req, res, next) => {
  try {
    const services = await getAllServices();

    return res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    return next(error);
  }
};

export const getServiceByIdController = async (req, res, next) => {
  try {
    const service = await getServiceById(req.params.id);

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

export const updateServiceController = async (req, res, next) => {
  try {
    const service = await updateService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

export const updateServiceStatusController = async (
  req,
  res,
  next
) => {
  try {
    const service = await updateServiceStatus(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Service status updated successfully",
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteServiceController = async (req, res, next) => {
  try {
    const service = await deleteService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

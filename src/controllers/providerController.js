import {
  createProvider,
  getProviders,
  getProviderById,
  updateProvider,
  updateProviderStatus,
  deleteProvider
} from "../repositories/providerRepository.js";

export const createProviderController = async (req, res, next) => {
  try {
    const provider = await createProvider(req.body);

    return res.status(201).json({
      success: true,
      message: "Provider created successfully",
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

export const getProvidersController = async (req, res, next) => {
  try {
    const providers = await getProviders();

    return res.status(200).json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderByIdController = async (req, res, next) => {
  try {
    const provider = await getProviderById(req.params.id);

    return res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

export const updateProviderController = async (req, res, next) => {
  try {
    const provider = await updateProvider(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

export const updateProviderStatusController = async (
  req,
  res,
  next
) => {
  try {
    const provider = await updateProviderStatus(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Provider status updated successfully",
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProviderController = async (req, res, next) => {
  try {
    const provider = await deleteProvider(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Provider deleted successfully",
      data: provider
    });
  } catch (error) {
    next(error);
  }
};
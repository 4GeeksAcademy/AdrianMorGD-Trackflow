import type {
  Product,
  Shipment,
  Carrier
} from '../types/models';


//Validate product business rules
function validateProduct(product: Product): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  //sku must not be empty
  if (!product.sku || product.sku.trim() === "") {
    errors.push("SKU must not be empty");
  }

  //weightKg must be > 0 and <= 100
  if (product.weightKg <= 0) {
    errors.push("Weight must be greater than 0");
  } else if (product.weightKg > 100) {
    errors.push("Weight must not exceed 100 kg");
  }

  //All dimensions must be > 0 and <= 200
  if (product.dimensions.lengthCm <= 0 || product.dimensions.lengthCm > 200) {
    errors.push("Length must be greater than 0 and not exceed 200 cm");
  }
  if (product.dimensions.widthCm <= 0 || product.dimensions.widthCm > 200) {
    errors.push("Width must be greater than 0 and not exceed 200 cm");
  }
  if (product.dimensions.heightCm <= 0 || product.dimensions.heightCm > 200) {
    errors.push("Height must be greater than 0 and not exceed 200 cm");
  }

  //stockQuantity must be >= 0
  if (product.stockQuantity < 0) {
    errors.push("Stock quantity must be greater than or equal to 0");
  }

  //minStockThreshold must be >= 0
  if (product.minStockThreshold < 0) {
    errors.push("Minimum stock threshold must be greater than or equal to 0");
  }

  //unitCostUSD must be > 0
  if (product.unitCostUSD <= 0) {
    errors.push("Unit cost must be greater than 0");
  }

  //Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}


//Validate shipment business rules
function validateShipment(shipment: Shipment): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  //quantity must be > 0
  if (shipment.quantity <= 0) {
    errors.push("Quantity must be greater than 0");
  }

  //declaredValueUSD must be > 0
  if (shipment.declaredValueUSD <= 0) {
    errors.push("Declared value must be greater than 0");
  }

  //distanceKm must be >= 0
  if (shipment.destination.distanceKm < 0) {
    errors.push("Distance must be greater than or equal to 0");
  }

  //Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}


//Validate carrier business rules
function validateCarrier(carrier: Carrier): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  //baseRateUSD, ratePerKgUSD, ratePerKmUSD must all be >= 0
  if (carrier.baseRateUSD < 0) {
    errors.push("Base rate must be greater than or equal to 0");
  }
  if (carrier.ratePerKgUSD < 0) {
    errors.push("Rate per kg must be greater than or equal to 0");
  }
  if (carrier.ratePerKmUSD < 0) {
    errors.push("Rate per km must be greater than or equal to 0");
  }

  //avgDeliveryDays must be > 0
  if (carrier.avgDeliveryDays <= 0) {
    errors.push("Average delivery days must be greater than 0");
  }

  //onTimeRate must be between 0 and 100
  if (carrier.onTimeRate < 0 || carrier.onTimeRate > 100) {
    errors.push("On-time rate must be between 0 and 100");
  }

  //maxWeightKg must be > 0
  if (carrier.maxWeightKg <= 0) {
    errors.push("Maximum weight must be greater than 0");
  }

  //operatesIn must contain at least 1 country
  if (!carrier.operatesIn || carrier.operatesIn.length === 0) {
    errors.push("Carrier must operate in at least 1 country");
  }

  //Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}

export {
  validateProduct,
  validateShipment,
  validateCarrier
};
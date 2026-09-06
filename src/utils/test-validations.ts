import type { Product, Carrier, Shipment } from '../types/models';
import { validateProduct, validateShipment, validateCarrier } from './validations';

//Sample Products
const sampleProducts: Product[] = [
  {
    sku: "SHOE-BLK-42",
    name: "Black Running Shoes - Size 42",
    category: "Fashion",
    weightKg: 0.8,
    dimensions: { lengthCm: 35, widthCm: 22, heightCm: 12 },
    warehouse: "Los Angeles",
    stockQuantity: 45,
    minStockThreshold: 20,
    unitCostUSD: 35.0,
    isFragile: false,
    status: "Active",
  },
  {
    sku: "LAPTOP-DELL-15",
    name: "Dell Laptop 15 inch",
    category: "Electronics",
    weightKg: 2.3,
    dimensions: { lengthCm: 40, widthCm: 28, heightCm: 3 },
    warehouse: "Zaragoza",
    stockQuantity: 8,
    minStockThreshold: 10,
    unitCostUSD: 650.0,
    isFragile: true,
    status: "Low stock",
  },
  {
    sku: "PERFUME-COCO-50",
    name: "Coco Perfume 50ml",
    category: "Cosmetics",
    weightKg: 0.3,
    dimensions: { lengthCm: 12, widthCm: 8, heightCm: 15 },
    warehouse: "Los Angeles",
    stockQuantity: 120,
    minStockThreshold: 30,
    unitCostUSD: 85.0,
    isFragile: true,
    status: "Active",
  },
];

//Sample Carriers
const sampleCarriers: Carrier[] = [
  {
    id: "CAR-UPS",
    name: "UPS",
    operatesIn: ["United States"],
    baseRateUSD: 5.0,
    ratePerKgUSD: 1.2,
    ratePerKmUSD: 0.05,
    avgDeliveryDays: 3,
    onTimeRate: 88,
    maxWeightKg: 30,
    handlesFragile: true,
    acceptsPriority: ["Standard", "Express"],
  },
  {
    id: "CAR-SEUR",
    name: "SEUR",
    operatesIn: ["Spain"],
    baseRateUSD: 6.5,
    ratePerKgUSD: 1.5,
    ratePerKmUSD: 0.08,
    avgDeliveryDays: 2,
    onTimeRate: 92,
    maxWeightKg: 25,
    handlesFragile: true,
    acceptsPriority: ["Standard", "Express", "Same-day"],
  },
  {
    id: "CAR-DHL",
    name: "DHL Express",
    operatesIn: ["United States", "Spain"],
    baseRateUSD: 12.0,
    ratePerKgUSD: 2.0,
    ratePerKmUSD: 0.1,
    avgDeliveryDays: 1,
    onTimeRate: 95,
    maxWeightKg: 50,
    handlesFragile: true,
    acceptsPriority: ["Express", "Same-day"],
  },
];

//Sample Shipment
const sampleShipment: Shipment = {
  id: "SH-2024-8821",
  sku: "LAPTOP-DELL-15",
  quantity: 1,
  origin: "Zaragoza",
  destination: {
    city: "Madrid",
    country: "Spain",
    postalCode: "28001",
    distanceKm: 320,
  },
  priority: "Express",
  declaredValueUSD: 650.0,
  carrier: null,
  status: "Pending",
  createdAt: new Date("2024-03-15"),
};


//Test functions
console.log("=== VALIDATE PRODUCTS ===");
for (const product of sampleProducts) {
  const result = validateProduct(product);
  console.log(`Product: ${product.name}`);
  console.log(`  Valid: ${result.valid}`);
  if (result.errors.length > 0) {
    console.log(`  Errors: ${result.errors.join(", ")}`);
  }
  console.log("---");
}

console.log("\n=== VALIDATE SHIPMENT ===");
const shipmentResult = validateShipment(sampleShipment);
console.log(`Shipment: ${sampleShipment.id}`);
console.log(`  Valid: ${shipmentResult.valid}`);
if (shipmentResult.errors.length > 0) {
  console.log(`  Errors: ${shipmentResult.errors.join(", ")}`);
}

console.log("\n=== VALIDATE CARRIERS ===");
for (const carrier of sampleCarriers) {
  const result = validateCarrier(carrier);
  console.log(`Carrier: ${carrier.name} (${carrier.id})`);
  console.log(`  Valid: ${result.valid}`);
  if (result.errors.length > 0) {
    console.log(`  Errors: ${result.errors.join(", ")}`);
  }
  console.log("---");
}


//Test invalid scenarios
console.log("\n=== INVALID PRODUCT TEST ===");
const invalidProduct: Product = {
  sku: "",
  name: "Invalid Product",
  category: "Other",
  weightKg: 150, // > 100
  dimensions: { lengthCm: 250, widthCm: 5, heightCm: 300 }, // > 200
  warehouse: "Los Angeles",
  stockQuantity: -5, // < 0
  minStockThreshold: -1, // < 0
  unitCostUSD: 0, // <= 0
  isFragile: false,
  status: "Active",
};
const invalidProductResult = validateProduct(invalidProduct);
console.log(`Invalid product valid: ${invalidProductResult.valid}`);
console.log(`Errors (${invalidProductResult.errors.length}):`);
invalidProductResult.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));

console.log("\n=== INVALID CARRIER TEST ===");
const invalidCarrier: Carrier = {
  id: "CAR-INVALID",
  name: "Invalid Carrier",
  operatesIn: [], // vacío
  baseRateUSD: -1, // < 0
  ratePerKgUSD: -5, // < 0
  ratePerKmUSD: -0.1, // < 0
  avgDeliveryDays: 0, // <= 0
  onTimeRate: 120, // > 100
  maxWeightKg: 0, // <= 0
  handlesFragile: false,
  acceptsPriority: [],
};
const invalidCarrierResult = validateCarrier(invalidCarrier);
console.log(`Invalid carrier valid: ${invalidCarrierResult.valid}`);
console.log(`Errors (${invalidCarrierResult.errors.length}):`);
invalidCarrierResult.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));

console.log("\n=== INVALID SHIPMENT TEST ===");
const invalidShipment: Shipment = {
  id: "SH-INVALID",
  sku: "TEST",
  quantity: 0, // <= 0
  origin: "Zaragoza",
  destination: {
    city: "Madrid",
    country: "Spain",
    postalCode: "28001",
    distanceKm: -10, // < 0
  },
  priority: "Standard",
  declaredValueUSD: 0, // <= 0
  carrier: null,
  status: "Pending",
  createdAt: new Date(),
};
const invalidShipmentResult = validateShipment(invalidShipment);
console.log(`Invalid shipment valid: ${invalidShipmentResult.valid}`);
console.log(`Errors (${invalidShipmentResult.errors.length}):`);
invalidShipmentResult.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
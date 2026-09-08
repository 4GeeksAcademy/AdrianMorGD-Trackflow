interface Product {
  sku: string; // Stock Keeping Unit (e.g., "SHOE-BLK-42") *sku must not be empty*
  name: string; // Product name
  category: ProductCategory; // Product category
  weightKg: number; // Weight in kilograms * must be > 0 and <= 100*
  dimensions: Dimensions; // Length, width, height in cm
  warehouse: WarehouseLocation; // Current warehouse
  stockQuantity: number; // Available units *must be >= 0
  minStockThreshold: number; // Minimum stock before alert * must be >= 0
  unitCostUSD: number; // Cost per unit in USD *must be > 0
  isFragile: boolean; // Requires special handling
  status: ProductStatus; // Current status
}

interface Dimensions { //must be > 0 and <= 200
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

type ProductCategory =
  | "Fashion"
  | "Electronics"
  | "Cosmetics"
  | "Home"
  | "Other";
type WarehouseLocation = "Los Angeles" | "Zaragoza";
type ProductStatus = "Active" | "Low stock" | "Out of stock" | "Discontinued";




interface Shipment {
  id: string; // Unique shipment ID (e.g., "SH-2024-8821")
  sku: string; // Product SKU being shipped
  quantity: number; // Number of units *must be > 0
  origin: WarehouseLocation; // Origin warehouse
  destination: Destination; // Delivery destination
  priority: ShipmentPriority; // Urgency level
  declaredValueUSD: number; // Declared value for insurance *must be > 0
  carrier: string | null; // Assigned carrier (null if not assigned)
  status: ShipmentStatus; // Current status
  createdAt: Date; // Order creation date
}

interface Destination {
  city: string;
  country: Country;
  postalCode: string;
  distanceKm: number; // Distance from origin warehouse *must be >= 0
}

type Country = "United States" | "Spain";
type ShipmentPriority = "Standard" | "Express" | "Same-day";
type ShipmentStatus =
  | "Pending"
  | "Assigned"
  | "In transit"
  | "Delivered"
  | "Failed";



interface Carrier {
  id: string; // Carrier ID (e.g., "CAR-UPS")
  name: string; // Carrier name (e.g., "UPS")
  operatesIn: Country[]; // Countries where they operate
  baseRateUSD: number; // Base delivery cost (USD)
  ratePerKgUSD: number; // Additional cost per kg (USD)
  ratePerKmUSD: number; // Additional cost per km (USD)
  avgDeliveryDays: number; // Average delivery time in days
  onTimeRate: number; // On-time delivery rate (0-100)
  maxWeightKg: number; // Maximum package weight they accept
  handlesFragile: boolean; // Can handle fragile items
  acceptsPriority: ShipmentPriority[]; // Priorities they support
}



interface InventoryMovement {
  id: string; // Movement ID
  sku: string; // Product SKU
  warehouse: WarehouseLocation; // Warehouse location
  type: MovementType; // Inbound or outbound
  quantity: number; // Number of units moved
  reason: string; // Reason for movement
  timestamp: Date; // When it happened
}

type MovementType = "Inbound" | "Outbound" | "Transfer" | "Adjustment";


export type {

  Product,
  Dimensions,
  ProductCategory,
  WarehouseLocation,
  ProductStatus,
  Shipment,
  Destination,
  Country,
  ShipmentPriority,
  ShipmentStatus,
  Carrier,
  InventoryMovement,
  MovementType,
}











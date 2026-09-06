import type {
  Product,
  ProductCategory,
  Shipment,
  ShipmentStatus,
  Carrier
} from '../types/models';


function calculateShippingCost(
  shipment: Shipment,
  product: Product,
  carrier: Carrier,
  priority: "standard" | "express" | "same-day" = "standard"
): number {

  // Validación enjecucion para solo permitir esos valores
  const validPriorities = ["standard", "express", "same-day"];
  if (!validPriorities.includes(priority)) {
    //Si no es comunica el error
    throw new Error(
      `Invalid priority "${priority}". Must be one of: ${validPriorities.join(", ")}`
    );
  }
  //Shipping formulas
  const baseRate: number = carrier.baseRateUSD;
  const weightCost: number = product.weightKg * carrier.ratePerKgUSD * shipment.quantity;
  const distanceCost: number = shipment.destination.distanceKm * carrier.ratePerKmUSD;
  const subTotal: number = baseRate + weightCost + distanceCost;

  //Check shipping charges
  let surcharge: number = 0;
  if (priority === "express") {
    surcharge = subTotal * 0.3;
  } else if (priority === "same-day") {
    surcharge = subTotal * 0.6;
  }
  //Get final shipping cost
  const shippingCost: number = subTotal + surcharge;
  return shippingCost;

}

//Calculate carrier score
function scoreCarrierForShipment(carrier: Carrier, product: Product, shipment: Shipment): number {

  let carrierScore: number = 0;
  const reliabPercentage: number = 0.3;
  const handleWeight: boolean = product.weightKg * shipment.quantity <= carrier.maxWeightKg;
  let reliabilityPoints: number = carrier.onTimeRate * reliabPercentage;
  const operatesInDestination: boolean = carrier.operatesIn.includes(shipment.destination.country);
  const acceptsPriority: boolean = carrier.acceptsPriority.includes(shipment.priority);

  if (operatesInDestination) {

    carrierScore += 20;
  }

  if (handleWeight) {

    carrierScore += 20;

  }


  if (acceptsPriority) {

    carrierScore += 15;
  }

  if (!product.isFragile || carrier.handlesFragile) {

    carrierScore += 15;

  }


  //Convert score to 2 decimal places
  //First make sure score is 4 figure number before decimal point by * 100
  //Then round it to get rid of decimals
  //Lastly divide by 100 to guarantee a 2 figure number moves back 2 decimals
  return Math.round((carrierScore + reliabilityPoints) * 100) / 100;


}

function selectBestCarrier(
  carriers: Carrier[],
  shipment: Shipment,
  product: Product
): { carrier: Carrier; score: number; cost: number } | null {
  //Starts null since we have not found the best carrier
  let bestCarrier: {
    carrier: Carrier;
    score: number;
    cost: number;
  } | null = null;

  //To avoid compilation error if none of these values are provided do a as promise
  //Turn whatever entered to lowerCase
  const priority = shipment.priority.toLowerCase() as
    | "standard"
    | "express"
    | "same-day";

  //Loop to calculate cost and score on all carrier elements of array
  for (const carrier of carriers) {
    const score: number = scoreCarrierForShipment(carrier, product, shipment);
    //Only is score is low continue to calculate cost, since higher score is not a good carrier
    if (score < 50) {
      continue;
    }

    //calculate shipping cost
    const cost: number = calculateShippingCost(
      shipment,
      product,
      carrier,
      priority
    );

    //Since first loop bestcarrier is empty, asign calculated cost and score values to object
    //Or if the cost of current carrier is better than the previous one 
    if (bestCarrier === null || cost < bestCarrier.cost) {
      bestCarrier = {
        carrier,
        score,
        cost
      };
    }
  }
  //Return best carrier
  return bestCarrier;
}

//Count products by category
function countProductsByCategory(products: Product[]): Record<ProductCategory, number> {
  //Record is K and V where K is the list of keys and V the type of value for keys, in this case keys from P.category and V type number
  const categoryCount: Record<ProductCategory, number> = {
    Fashion: 0,
    Electronics: 0,
    Cosmetics: 0,
    Home: 0,
    Other: 0,
  };
  //Loop to count category per product
  //Only If category does exist
  for (const product of products) {
    if (categoryCount[product.category] !== undefined) {
      categoryCount[product.category]++;
    }
  }

  return categoryCount;
}

//Calculate total inventory value
function calculateTotalInventoryValue(products: Product[]): number {
  let totalValue: number = 0;

  //Sum stockQuantity * unitCostUSD for all products
  for (const product of products) {
    totalValue += product.stockQuantity * product.unitCostUSD;
  }

  //Round to 2 decimal places
  return Math.round(totalValue * 100) / 100;



}

//Calculate average shipment distance
function calculateAverageShipmentDistance(shipments: Shipment[]): number {
  //Avoid division by zero
  if (shipments.length === 0) {
    return 0;
  }

  let totalDistance: number = 0;

  //Sum all distances
  for (const shipment of shipments) {
    totalDistance += shipment.destination.distanceKm;
  }

  //Calculate average and round to 2 decimal places
  const average: number = totalDistance / shipments.length;
  return Math.round(average * 100) / 100;
}

//Group shipments by status
function groupShipmentsByStatus(shipments: Shipment[]): Record<ShipmentStatus, Shipment[]> {
  //Initialize object with empty arrays for each status
  const grouped: Record<ShipmentStatus, Shipment[]> = {
    "Pending": [],
    "Assigned": [],
    "In transit": [],
    "Delivered": [],
    "Failed": [],
  };

  //Group each shipment by its status
  for (const shipment of shipments) {
    if (grouped[shipment.status] !== undefined) {
      grouped[shipment.status].push(shipment);
    }
  }

  return grouped;
}

//Find top N most used carriers
function findTopCarriers(shipments: Shipment[], topN: number): Array<{ carrier: string; count: number }> {
  //Create empty object to hold carrier name and count
  const carrierCount: Record<string, number> = {};

  for (const shipment of shipments) {
    
    //Only continue loop if shipment has no assigned carrier
    if (shipment.carrier === null) {
      continue;
    }
    //If first time seeing a carrier e.g "DHL" set it to 1
    if (carrierCount[shipment.carrier] === undefined) {
      carrierCount[shipment.carrier] = 1;
    //If not add 1 to e.g "DHL" carriers
    } else {
      carrierCount[shipment.carrier]++;
    }
  }

  //Create variable with an array that will hold nested arrays: specifying it will have a string and number
  //--> So far array is [{string,number}]
  // Object.entries converts carriercount object as an array
  //--> Now array holds nested arrays is [ ["DHL", 2], ["fedex" 1]]
  const sortedCarriers: Array<{ carrier: string; count: number }> = Object.entries(carrierCount)
    //Create a new array nesting objects specifying first its keys 
    //--> carrier,count = carrier:, count:
    //Then its values carrier, count = [{carrier: DHL count: 3}]
    .map(([carrier, count]) => ({ carrier, count }))
    //Orders ascendent biggest to smalles
    .sort((a, b) => b.count - a.count)
    //Cuts array to the top x most used, specified by user
    //e.g topN = 3 cust from to 3 returns top 3 most used
    .slice(0, topN);

  return sortedCarriers;
}

export {


findTopCarriers ,
groupShipmentsByStatus,
calculateAverageShipmentDistance,
calculateTotalInventoryValue,
countProductsByCategory,
selectBestCarrier



}
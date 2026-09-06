import type { Product,
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
  MovementType, } from '../types/models';

//Filters products from the array of products based on the warehouse location provided. .
function filterProductsByWarehouse(products: Product[], warehouse: WarehouseLocation): Product[] {
    // Returns a new array of products that are located in the specified warehouse
    return products.filter(element => element.warehouse === warehouse);
}

//
function filterProductsByCategory(products: Product[], category: ProductCategory): Product[]{
    //Returns a new array with products from the specified category
    return products.filter(element => element.category === category);

}


//Filter lowstock products by stockquantity

function filterLowStockProducts (products: Product[]): Product[]{

//Returns a new array with products whose stockquant is low
return products.filter(element => element.stockQuantity <= element.minStockThreshold);

}

//Sort products by stockquantity
function sortProductsByStock (products: Product[], order:"asc"| "des" ): Product[] {
    
    //Safe shallow copy, no modifs only sorting so its safe
    const newProducts = [...products];

    //Ascendent sort
    if(order == "asc")
        newProducts.sort((a,b) => a.stockQuantity- b.stockQuantity);
    //Descendent sort
    else if (order=="des")
         newProducts.sort((a,b) => b.stockQuantity- a.stockQuantity);

    //Returns new array sorted
    return newProducts;
}


//Sort carriers by ontimerate
function sortCarriersByReliability (carriers: Carrier[], order:"asc"| "des" ):Carrier[]{
    
    //Safe shallow copy, no modifs only sorting so its safe
    const newCarriers = [...carriers];

    //Ascendent sort
    if(order == "asc")
        newCarriers.sort((a,b) => a.onTimeRate- b.onTimeRate);
    //Descendent sort
    else if (order=="des")
         newCarriers.sort((a,b) => b.onTimeRate- a.onTimeRate);

    //Returns new array sorted
    return newCarriers;
}








export {
filterProductsByWarehouse, 
filterProductsByCategory, 
filterLowStockProducts,
sortProductsByStock,
sortCarriersByReliability

}
import type { Product,
  Shipment,
} from '../types/models';

//Find a product in the product array by sku
function findProductBySKU(products:Product[],sku:string):Product| null {

//Find returns a single product so a single var is needed to return it, not an array
//Ignore any upper cases by converting all to lower
const found = products.find((element) => element.sku.toLowerCase() === sku) ;
//In case not found return null to handle undefined error
return found ?? null;
}

//Find returns a single shipment so a single var is needed to return it, not an array
//Ignore any upper cases by converting all to lower
function findShipmentById (shipments: Shipment[], id:string): Shipment | null {

const found = shipments.find((element) => element.id.toLowerCase() === id);
//In case not found return null to handle undefined error
return found?? null;

}

//Binary search for very large collection of elements
//Curly braces on parameters to be able to return both index and the product
function binarySearchProductByWeight(
  sortedProducts: Product[],
  targetweight: number
): { index: number; product: Product } | null {

let low: number = 0;
let high: number = sortedProducts.length - 1;

while (low <= high) {
  //Keep calculating the middle index
  let mid: number = Math.floor((low + high) / 2);
  //If value in the middle is equal to target, return that product and its weight
  if (sortedProducts[mid].weightKg === targetweight) {
    return { index: mid, product: sortedProducts[mid] };
   //If weight of product is lower than target then it means the target must fall on the ascending middle side of the array
  } else if (sortedProducts[mid].weightKg < targetweight) {
    low = mid + 1;
    //If not then it means the target must fall on the descending middle side of the array
  } else {
    high = mid - 1;
  }
}

//Doesnt exist a product with specified targetweight
//Substitutes the return -1 as It should come more in handy to return both product and weight
return null;

}


export {
findProductBySKU,
binarySearchProductByWeight,
findShipmentById

}


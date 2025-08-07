export type Tree = {
   id: number;
   name: string;
   scientific_name: string;
   image: string;
   category: string;
   categorySlug: string;
   description: string;
   co2: number;
   o2: number;
   price: number;
   createdAt: string;
   updatedAt?: string;
}
export type TreeForm = Tree & {
   oldImage: string;
   forestAssociations: {
     [forestId: string]: {
       checked?: string;
       stock?: string;
     };
   };
};
export type TreeWithForestsAndStock = Tree & {
   forestname?: string[];
   stock?: number[];
}
export type Forest = {
   id: number;
   name: string;
   association: string;
   image: string;
   description: string;
   country: string;
   countrySlug: string;
   location_x: number;
   location_y: number;
   createdAt: string;
   updatedAt?: string;
}
export type ForestForm = Forest & {
   oldImage: string;
   treeAssociations: {
     [treeId: string]: {
       checked?: string;
       stock?: string;
     };
   };
};
export type ForestWithTreesAndStock = Forest & {
   treesName?: string[];
   stock?: number[];
}
export type User = {
   id: number;
   firstname: string;
   lastname: string;
   email: string;
   password: string;
   phone: string;
   address: string;
   zipcode: string;
   city: string;
   role: string;
   createdAt: string;
   updatedAt?: string;
}
export type Order = {
   id: number;
   user_id: number;
   total_price: number;
   status: number | string; 
   createdAt: string;
   updatedAt?: string;
}
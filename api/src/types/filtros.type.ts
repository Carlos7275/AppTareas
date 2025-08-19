export type Operator = 'eq' | 'lt' | 'gt' | 'in' | 'like' | "is" | "is not";

export interface Filter {
  field?: string;
  operator?: Operator;
  value?: any;
  or?: Filter[]; 

}

export class Relacion{
  name:string;
  type:string;
}
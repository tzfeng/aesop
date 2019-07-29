/* tslint:disable */
import { ParameterType } from 'ontology-dapi';

export function convertValue(value: string, type: ParameterType) {
  switch (type) {
    case 'Boolean':
      return Boolean(value);
    case 'Integer':
      return Number(value);
    case 'ByteArray':
      return value;
    case 'String':
      return value; // client.api.utils.strToHex(value);
  }
}

export const CONST = Math.pow(10, 8);

export const CONTRACT_HASH = '1809444acf2327f7aa6c22542248bb68062d9553';


export function reverseHex(input: string): string {
let out = '';
for (let i = input.length - 2; i >= 0; i -= 2) {
  out += input.substr(i, 2);
}
return out;
}

export function hexToInt(input: string): number {
  return (parseInt(reverseHex(input), 16) / Math.pow(10, 8) );
}
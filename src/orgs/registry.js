import cwags2021 from './cwags-2021.js';

export const rulePacks = {
  'cwags:2021': cwags2021
};

export const organizations = [
  { id: 'cwags:2021', label: 'C-WAGS Rally (2021 rules)', pack: cwags2021 }
];

export function getPack(id) {
  return rulePacks[id] || null;
}

import cwags2021 from './cwags-2021.js';
import caro2025 from './caro-2025.js';
import ckc2025 from './ckc-2025.js';

export const rulePacks = {
  'cwags:2021': cwags2021,
  'caro:2025.12': caro2025,
  'ckc:2025': ckc2025
};

export const organizations = [
  { id:'cwags:2021', label:'C-WAGS Rally (2021 source pack)', pack:cwags2021 },
  { id:'caro:2025.12', label:'CARO Rally (2025 + Dec. amendments)', pack:caro2025 },
  { id:'ckc:2025', label:'CKC Rally Obedience (2025 rules)', pack:ckc2025 }
];

export function getPack(id) {
  return rulePacks[id] || null;
}

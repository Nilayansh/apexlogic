// ApexLogic - experiments/index.js
// Exports registry of all 5 virtual lab experiments

import { exp01 } from './exp01.js';
import { exp02 } from './exp02.js';
import { exp03 } from './exp03.js';
import { exp04 } from './exp04.js';
import { exp05 } from './exp05.js';

export const EXPERIMENTS = [exp01, exp02, exp03, exp04, exp05];

export const getExperiment = (id) => EXPERIMENTS.find(e => e.id === id);

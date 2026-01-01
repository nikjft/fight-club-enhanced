
export interface CompendiumData {
  items: Item[];
  spells: Spell[];
  monsters: Monster[];
  classes: DndClass[];
  races: Race[];
  feats: Feat[];
  backgrounds: Background[];
}

export interface BaseItem {
  name: string;
  text: string;
  [key: string]: any;
}

export interface Item extends BaseItem {
  type: string;
  magic: string;
  detail: string;
  weight: string;
  dmg1: string;
  dmg2: string;
  dmgType: string;
  property: string;
  range: string;
  ac: string;
  value: string;
  strength: string;
}

export interface Spell extends BaseItem {
  level: string;
  school: string;
  ritual: string;
  time: string;
  range: string;
  components: string;
  duration: string;
  classes: string;
}

export interface Monster extends BaseItem {
  size: string;
  type: string;
  alignment: string;
  ac: string;
  hp: string;
  speed: string;
  str: string;
  dex: string;
  con: string;
  int: string;
  wis: string;
  cha: string;
  save: string;
  skill: string;
  resist: string;
  vulnerable: string;
  immune: string;
  conditionImmune: string;
  senses: string;
  passive: string;
  languages: string;
  cr: string;
  spells?: string;
  trait: Trait[];
  action: Action[];
  legendary: LegendaryAction[];
  reaction?: Action[];
  environment: string;
}

export interface Trait {
  name: string;
  text: string;
  attack?: string[];
}

export interface Action extends Trait {}
export interface LegendaryAction extends Trait {}

export interface DndClass extends BaseItem {
  hd: string;
  proficiency: string;
  spellAbility: string;
  autolevel: LevelInfo[];
}

export interface LevelInfo {
  level: string;
  features: Feature[];
}

export interface Feature {
  name: string;
  text: string;
  optional?: boolean;
}

export interface Race extends BaseItem {
  ability: string;
  size: string;
  speed: string;
  trait: Trait[];
}

export interface Feat extends BaseItem {
  prerequisite: string;
}

export interface Background extends BaseItem {
  proficiency: string;
  trait: Trait[];
}

export type CompendiumItem = Item | Spell | Monster | DndClass | Race | Feat | Background;

export enum Category {
  Items = 'items',
  Spells = 'spells',
  Monsters = 'monsters',
  Classes = 'classes',
  Races = 'races',
  Feats = 'feats',
  Backgrounds = 'backgrounds',
}

export const categoryDisplayNames: Record<Category, string> = {
  [Category.Items]: 'Equipment',
  [Category.Spells]: 'Spells',
  [Category.Monsters]: 'Bestiary',
  [Category.Classes]: 'Classes',
  [Category.Races]: 'Races',
  [Category.Feats]: 'Feats',
  [Category.Backgrounds]: 'Backgrounds',
};

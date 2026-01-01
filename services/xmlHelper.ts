import { CompendiumData, Trait, DndClass, Race, Monster, Background, CompendiumItem, Feat, Spell, Item, LevelInfo, Feature } from '../types';

const getText = (node: Element, tagName: string): string => {
  const element = node.querySelector(tagName);
  return element?.textContent?.trim() || '';
};

const parseTraits = (node: Element, tagName: string): Trait[] => {
  return Array.from(node.querySelectorAll(tagName)).map(t => ({
    name: getText(t, 'name'),
    text: getText(t, 'text'),
    attack: getText(t, 'attack') ? getText(t, 'attack').split('|') : undefined,
  }));
};

const parseSimpleItems = (doc: Document, tagName: string) => {
  return Array.from(doc.querySelectorAll(tagName)).map(node => {
    const item: any = { name: '' };
    Array.from(node.children).forEach(child => {
        const key = child.tagName.toLowerCase();
        const value = child.textContent?.trim() || '';
        item[key] = value;
    });
    return item;
  });
};


const parseClasses = (doc: Document): DndClass[] => {
    return Array.from(doc.querySelectorAll('class')).map(node => {
        const autolevels = Array.from(node.querySelectorAll('autolevel')).map(levelNode => ({
            level: levelNode.getAttribute('level') || '',
            features: Array.from(levelNode.querySelectorAll('feature')).map(featureNode => ({
                name: getText(featureNode, 'name'),
                text: getText(featureNode, 'text'),
                optional: featureNode.getAttribute('optional') === 'YES',
            })),
        }));

        const featuresText = autolevels.flatMap(al => al.features.map(f => `**${f.name} (Level ${al.level})**\n${f.text}`)).join('\n\n');

        return {
            name: getText(node, 'name'),
            text: featuresText,
            hd: getText(node, 'hd'),
            proficiency: getText(node, 'proficiency'),
            spellAbility: getText(node, 'spellAbility'),
            autolevel: autolevels,
        };
    });
};

const parseRaces = (doc: Document): Race[] => {
    return Array.from(doc.querySelectorAll('race')).map(node => {
        const traits = parseTraits(node, 'trait');
        const text = traits.map(t => `**${t.name}**\n${t.text}`).join('\n\n');
        return {
            name: getText(node, 'name'),
            text: text,
            size: getText(node, 'size'),
            speed: getText(node, 'speed'),
            ability: getText(node, 'ability'),
            trait: traits,
        };
    });
};

const parseMonsters = (doc: Document): Monster[] => {
    return Array.from(doc.querySelectorAll('monster')).map(node => {
        const traits = parseTraits(node, 'trait');
        const actions = parseTraits(node, 'action');
        const legendaries = parseTraits(node, 'legendary');
        const reactions = parseTraits(node, 'reaction');

        const allTextItems = [...traits, ...actions, ...legendaries, ...reactions];
        const text = allTextItems.map(t => `**${t.name}**\n${t.text}`).join('\n\n');
        
        return {
            name: getText(node, 'name'),
            text: text,
            size: getText(node, 'size'),
            type: getText(node, 'type'),
            alignment: getText(node, 'alignment'),
            ac: getText(node, 'ac'),
            hp: getText(node, 'hp'),
            speed: getText(node, 'speed'),
            str: getText(node, 'str'),
            dex: getText(node, 'dex'),
            con: getText(node, 'con'),
            int: getText(node, 'int'),
            wis: getText(node, 'wis'),
            cha: getText(node, 'cha'),
            save: getText(node, 'save'),
            skill: getText(node, 'skill'),
            resist: getText(node, 'resist'),
            vulnerable: getText(node, 'vulnerable'),
            immune: getText(node, 'immune'),
            conditionImmune: getText(node, 'conditionImmune'),
            senses: getText(node, 'senses'),
            passive: getText(node, 'passive'),
            languages: getText(node, 'languages'),
            cr: getText(node, 'cr'),
            spells: getText(node, 'spells'),
            trait: traits,
            action: actions,
            legendary: legendaries,
            reaction: reactions,
            environment: getText(node, 'environment'),
        };
    });
};

const parseBackgrounds = (doc: Document): Background[] => {
    return Array.from(doc.querySelectorAll('background')).map(node => {
        const traits = parseTraits(node, 'trait');
        const text = traits.map(t => `**${t.name}**\n${t.text}`).join('\n\n');
        return {
            name: getText(node, 'name'),
            proficiency: getText(node, 'proficiency'),
            trait: traits,
            text: text,
        };
    });
};


export const parseCompendium = (xmlString: string): CompendiumData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  const data: CompendiumData = {
    items: parseSimpleItems(doc, 'item'),
    spells: parseSimpleItems(doc, 'spell'),
    monsters: parseMonsters(doc),
    classes: parseClasses(doc),
    races: parseRaces(doc),
    feats: parseSimpleItems(doc, 'feat'),
    backgrounds: parseBackgrounds(doc),
  };
  return data;
};


// --- EXPORT FUNCTIONS ---

const sanitize = (str: string | undefined | null): string => {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

const buildTag = (tagName: string, content: string | undefined | null, indent: string = '    '): string => {
    if (!content) return '';
    return `${indent}<${tagName}>${sanitize(content)}</${tagName}>\n`;
};

const buildTraitTag = (tagName: string, traits: Trait[] | undefined, indent: string = '    ') => {
    if (!traits) return '';
    return traits.map(trait =>
        `${indent}<${tagName}>\n` +
        buildTag('name', trait.name, indent + '  ') +
        buildTag('text', trait.text, indent + '  ') +
        (trait.attack ? buildTag('attack', trait.attack.join('|'), indent + '  ') : '') +
        `${indent}</${tagName}>\n`
    ).join('');
};

export const exportCompendium = (data: CompendiumData): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<compendium version="5">\n';

    const itemToString = (item: Item) => {
        let str = '  <item>\n';
        const simpleFields: (keyof Item)[] = ['name', 'type', 'magic', 'detail', 'weight', 'value', 'dmg1', 'dmg2', 'dmgType', 'property', 'range', 'ac', 'strength', 'text'];
        // FIX: Cast field to string as buildTag expects a string for tagName.
        simpleFields.forEach(field => str += buildTag(field as string, item[field]));
        str += '  </item>\n';
        return str;
    };

    const spellToString = (spell: Spell) => {
        let str = '  <spell>\n';
        const simpleFields: (keyof Spell)[] = ['name', 'level', 'school', 'ritual', 'time', 'range', 'components', 'duration', 'classes', 'text'];
        // FIX: Cast field to string as buildTag expects a string for tagName.
        simpleFields.forEach(field => str += buildTag(field as string, spell[field]));
        str += '  </spell>\n';
        return str;
    };
    
    const featToString = (feat: Feat) => {
        let str = '  <feat>\n';
        str += buildTag('name', feat.name);
        str += buildTag('prerequisite', feat.prerequisite);
        str += buildTag('text', feat.text);
        str += '  </feat>\n';
        return str;
    };
    
    const backgroundToString = (background: Background) => {
        let str = '  <background>\n';
        str += buildTag('name', background.name);
        str += buildTag('proficiency', background.proficiency);
        str += buildTraitTag('trait', background.trait);
        str += '  </background>\n';
        return str;
    }

    const raceToString = (race: Race) => {
        let str = '  <race>\n';
        str += buildTag('name', race.name);
        str += buildTag('size', race.size);
        str += buildTag('speed', race.speed);
        str += buildTag('ability', race.ability);
        str += buildTraitTag('trait', race.trait);
        str += '  </race>\n';
        return str;
    }
    
    const classToString = (dndClass: DndClass) => {
        let str = '  <class>\n';
        str += buildTag('name', dndClass.name);
        str += buildTag('hd', dndClass.hd);
        str += buildTag('proficiency', dndClass.proficiency);
        str += buildTag('spellAbility', dndClass.spellAbility);
        
        (dndClass.autolevel || []).forEach(level => {
            str += `    <autolevel level="${level.level}">\n`;
            (level.features || []).forEach(feature => {
                 str += `      <feature${feature.optional ? ' optional="YES"' : ''}>\n`;
                 str += buildTag('name', feature.name, '        ');
                 str += buildTag('text', feature.text, '        ');
                 str += `      </feature>\n`;
            });
            str += `    </autolevel>\n`;
        });

        str += '  </class>\n';
        return str;
    };

    const monsterToString = (monster: Monster) => {
        let str = '  <monster>\n';
        const simpleFields: (keyof Monster)[] = ['name', 'size', 'type', 'alignment', 'ac', 'hp', 'speed', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'save', 'skill', 'resist', 'vulnerable', 'immune', 'conditionImmune', 'senses', 'passive', 'languages', 'cr', 'spells', 'environment'];
        // FIX: Cast field to string as buildTag expects a string for tagName.
        simpleFields.forEach(field => str += buildTag(field as string, monster[field]));
        str += buildTraitTag('trait', monster.trait);
        str += buildTraitTag('action', monster.action);
        str += buildTraitTag('legendary', monster.legendary);
        str += buildTraitTag('reaction', monster.reaction);
        str += '  </monster>\n';
        return str;
    };

    data.items.forEach(item => xml += itemToString(item));
    data.spells.forEach(spell => xml += spellToString(spell));
    data.monsters.forEach(monster => xml += monsterToString(monster));
    data.classes.forEach(c => xml += classToString(c));
    data.races.forEach(r => xml += raceToString(r));
    data.feats.forEach(f => xml += featToString(f));
    data.backgrounds.forEach(b => xml += backgroundToString(b));

    xml += '</compendium>';
    return xml;
};
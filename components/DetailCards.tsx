import React, { useState } from 'react';
import { CompendiumItem, Monster, Spell, Item, DndClass, Race, Feat, Background, Trait, Category } from '../types';
import { CopyIcon, CheckIcon, EditIcon, TrashIcon } from './icons';

const DetailHeader: React.FC<{ title: string; subtitle?: string; onCopy: () => void; onDelete: () => void; }> = ({ title, subtitle, onCopy, onDelete }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-4 pb-2 border-b-2 border-amber-700/50">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-serif text-3xl sm:text-4xl text-amber-100">{title}</h1>
                    {subtitle && <p className="text-amber-400 italic mt-1">{subtitle}</p>}
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                    <button onClick={handleCopy} title="Copy Text" className="p-2 rounded-full hover:bg-amber-900/50 transition-colors text-amber-300">
                        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => alert('Edit functionality coming soon!')} title="Edit" className="p-2 rounded-full hover:bg-amber-900/50 transition-colors text-amber-300">
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onDelete} title="Delete" className="p-2 rounded-full hover:bg-red-900/50 transition-colors text-red-400">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="my-3">
        <h3 className="font-bold text-sm text-red-800 tracking-wider uppercase">{title}</h3>
        <div className="prose prose-sm prose-invert max-w-none text-amber-200">{children}</div>
    </div>
);

const StatBlock: React.FC<{ monster: Monster }> = ({ monster }) => (
    <div className="grid grid-cols-6 gap-x-4 gap-y-1 text-center font-semibold text-amber-100">
        <div>STR</div><div>DEX</div><div>CON</div><div>INT</div><div>WIS</div><div>CHA</div>
        <div className="text-sm">{monster.str}</div>
        <div className="text-sm">{monster.dex}</div>
        <div className="text-sm">{monster.con}</div>
        <div className="text-sm">{monster.int}</div>
        <div className="text-sm">{monster.wis}</div>
        <div className="text-sm">{monster.cha}</div>
    </div>
);

const TraitBlock: React.FC<{ trait: Trait }> = ({ trait }) => (
    <p>
        <strong className="font-bold text-amber-100 italic">{trait.name}.</strong>
        <span className="text-amber-200"> {trait.text}</span>
    </p>
);

const MonsterCard: React.FC<{ monster: Monster; onDelete: () => void }> = ({ monster, onDelete }) => (
    <article>
        <DetailHeader title={monster.name} subtitle={`${monster.size} ${monster.type}, ${monster.alignment}`} onDelete={onDelete} onCopy={() => navigator.clipboard.writeText(monster.text)} />
        
        <div className="space-y-2 text-sm">
            <p><strong className="text-amber-100">Armor Class</strong> {monster.ac}</p>
            <p><strong className="text-amber-100">Hit Points</strong> {monster.hp}</p>
            <p><strong className="text-amber-100">Speed</strong> {monster.speed}</p>
        </div>
        
        <hr className="my-3 border-amber-700/50" />
        <StatBlock monster={monster} />
        <hr className="my-3 border-amber-700/50" />

        <div className="space-y-2 text-sm">
            {monster.save && <p><strong className="text-amber-100">Saving Throws</strong> {monster.save}</p>}
            {monster.skill && <p><strong className="text-amber-100">Skills</strong> {monster.skill}</p>}
            {monster.vulnerable && <p><strong className="text-amber-100">Damage Vulnerabilities</strong> {monster.vulnerable}</p>}
            {monster.resist && <p><strong className="text-amber-100">Damage Resistances</strong> {monster.resist}</p>}
            {monster.immune && <p><strong className="text-amber-100">Damage Immunities</strong> {monster.immune}</p>}
            {monster.conditionImmune && <p><strong className="text-amber-100">Condition Immunities</strong> {monster.conditionImmune}</p>}
            {monster.senses && <p><strong className="text-amber-100">Senses</strong> {monster.senses}</p>}
            {monster.languages && <p><strong className="text-amber-100">Languages</strong> {monster.languages}</p>}
            {monster.cr && <p><strong className="text-amber-100">Challenge</strong> {monster.cr}</p>}
        </div>
        <hr className="my-3 border-amber-700/50" />
        
        <div className="space-y-3 text-sm">
            {monster.trait?.map(t => <TraitBlock key={t.name} trait={t} />)}
        </div>

        {monster.action && monster.action.length > 0 && (
            <div className="my-4">
                <h2 className="font-serif text-2xl text-red-800 border-b border-amber-700/50 mb-2">Actions</h2>
                <div className="space-y-3 text-sm">{monster.action.map(a => <TraitBlock key={a.name} trait={a} />)}</div>
            </div>
        )}

        {monster.legendary && monster.legendary.length > 0 && (
            <div className="my-4">
                <h2 className="font-serif text-2xl text-red-800 border-b border-amber-700/50 mb-2">Legendary Actions</h2>
                <div className="space-y-3 text-sm">{monster.legendary.map(l => <TraitBlock key={l.name} trait={l} />)}</div>
            </div>
        )}
    </article>
);


const SpellCard: React.FC<{ spell: Spell; onDelete: () => void }> = ({ spell, onDelete }) => {
    // FIX: Safely construct subtitle to prevent crash if spell.school is missing.
    const levelText = spell.level === "0" ? 'Cantrip' : `Level ${spell.level}`;
    const schoolText = spell.school ? spell.school.toLowerCase() : '';
    const subtitle = [levelText, schoolText].filter(Boolean).join(' ');

    return (
        <article>
            <DetailHeader title={spell.name} subtitle={subtitle} onDelete={onDelete} onCopy={() => navigator.clipboard.writeText(spell.text)} />
            <div className="space-y-2 text-amber-200 text-sm">
                <p><strong className="text-amber-100">Casting Time:</strong> {spell.time}</p>
                <p><strong className="text-amber-100">Range:</strong> {spell.range}</p>
                <p><strong className="text-amber-100">Components:</strong> {spell.components}</p>
                <p><strong className="text-amber-100">Duration:</strong> {spell.duration}</p>
            </div>
            <hr className="my-3 border-amber-700/50" />
            <div className="prose prose-sm prose-invert max-w-none text-amber-200 whitespace-pre-wrap">{spell.text}</div>
            <hr className="my-3 border-amber-700/50" />
            <p className="text-sm"><strong className="text-amber-100">Classes:</strong> <span className="text-amber-300">{spell.classes}</span></p>
        </article>
    );
};

const ItemCard: React.FC<{ item: Item; onDelete: () => void }> = ({ item, onDelete }) => (
    <article>
        <DetailHeader title={item.name} subtitle={item.detail} onDelete={onDelete} onCopy={() => navigator.clipboard.writeText(item.text)} />
        <div className="prose prose-sm prose-invert max-w-none text-amber-200 whitespace-pre-wrap">{item.text}</div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {item.type && <p><strong className="text-amber-100">Type:</strong> {item.type}</p>}
            {item.value && <p><strong className="text-amber-100">Cost:</strong> {item.value} gp</p>}
            {item.weight && <p><strong className="text-amber-100">Weight:</strong> {item.weight} lb.</p>}
            {item.dmg1 && <p><strong className="text-amber-100">Damage:</strong> {item.dmg1}{item.dmg2 ? ` (${item.dmg2})` : ''} {item.dmgType}</p>}
            {item.ac && <p><strong className="text-amber-100">AC:</strong> {item.ac}</p>}
            {item.strength && <p><strong className="text-amber-100">Strength Req:</strong> {item.strength}</p>}
            {item.range && <p><strong className="text-amber-100">Range:</strong> {item.range}</p>}
            {item.property && <p><strong className="text-amber-100">Properties:</strong> {item.property}</p>}
        </div>
    </article>
);

const GenericCard: React.FC<{ item: CompendiumItem; onDelete: () => void }> = ({ item, onDelete }) => (
    <article>
        <DetailHeader title={item.name} onDelete={onDelete} onCopy={() => navigator.clipboard.writeText(item.text)} />
        <div className="prose prose-sm prose-invert max-w-none text-amber-200 whitespace-pre-wrap">{item.text}</div>
    </article>
);


export const DetailCard: React.FC<{ item: CompendiumItem, category: Category, onDelete: () => void }> = ({ item, category, onDelete }) => {
    switch(category) {
        case Category.Monsters: return <MonsterCard monster={item as Monster} onDelete={onDelete}/>;
        case Category.Spells: return <SpellCard spell={item as Spell} onDelete={onDelete} />;
        case Category.Items: return <ItemCard item={item as Item} onDelete={onDelete} />;
        default: return <GenericCard item={item} onDelete={onDelete} />;
    }
};

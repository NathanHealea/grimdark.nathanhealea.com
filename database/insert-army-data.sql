INSERT INTO
  public.armies (title, description, icon)
VALUES
  ('Imperium', '', NULL),
  (
    'Chaos',
    'The Forces of Chaos are the malevolent entities that seek to corrupt and destroy the Imperium',
    NULL
  ),
  ('Xenos', '', NULL),
  (
    'Space Marines',
    'The Space Marines are the Imperium''s most elite warriors, genetically enhanced super-soldiers who fight with the fury of a thousand suns. They are the Emperor''s Angels of Death, and they will stop at nothing to defend humanity from its many foes.',
    NULL
  );

INSERT INTO
  public.armies (title, description, parent_army_id, icon)
VALUES
  (
    'Adeptus Sororitas',
    'The Adepta Sororitas are warriors of unyielding faith. They purge their enemies from the field with roaring fire and howling chainblade, displaying their zealous devotion to the God-Emperor and the Imperial Cult. The Battle Sisters excel in short-ranged firefights, mowing down the foe with furious volleys while their soaring hymnals echo over the screams of the dying.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Imperium'
    ),
    NULL
  ),
  (
    'Adeptus Custodes',
    'The Adeptus Custodes were the first and greatest of the super-soldiers engineered by the Emperor. Each is a warrior of superlative might and superhuman resilience, a strategist and tactician to rival the greatest generals, and so much more besides. They are nigh-immortal exemplars of legend, who stop at nothing to defend the Emperor and his Throneworld.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Imperium'
    ),
    NULL
  ),
  (
    'Adeptus Mechanicus',
    'The Adeptus Mechanicus prize knowledge above all things, and will shed oceans of blood and oil in their endless crusade to acquire lost lore and ancient relics. The Machine Cult''s cyborg armies wield strange and arcane technological weapons of phenomenal power, manufactured and administered by the bizarre Tech-Priests of the Omnissiah.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Imperium'
    ),
    NULL
  ),
  (
    'Astra Militarum',
    'The Astra Militarum are a blunt instrument of violence, wrought on a galactic scale. Massed infantry and rumbling tanks serve as both a living shield for the Emperor''s realm, and an unstoppable sledgehammer with which to crush its foes. These loyal armies have served the Imperium for ten thousand years, sacrificing countless lives before surrendering even a single world',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Imperium'
    ),
    NULL
  ),
  (
    'Imperial Agents',
    'The Imperial Agents are a collection of elite operatives and specialists who serve the Imperium in various capacities. They are often deployed on covert missions, gathering intelligence, assassinating key targets, or sabotaging enemy operations. These agents are highly trained and equipped with advanced technology, making them formidable foes.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Imperium'
    ),
    NULL
  ),
  (
    'Chaos Space Marines',
    'They are the Imperium''s fallen heroes, superhuman warriors who sold their souls for the promise of power gifted from the Dark Gods. They are the Heretic Astartes - the Chaos Space Marines. From the Eye of Terror, the Maelstrom, the Great Rift, and a thousand other strongholds they strike at the realm they once swore to defend, driven by bitter hatred and unnatural bloodlust.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Chaos'
    ),
    NULL
  ),
  (
    'Death Guard',
    'The Death Guard are the Traitor Legion most favoured by Nurgle, the Chaos God of disease and despair. Devoted to spreading the Plaguefather''s hideous infections across the worlds of the Imperium, these morbid Space Marines are living plague vectors gifted with grotesque resilience.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Chaos'
    ),
    NULL
  ),
  (
    'Thousand Sons',
    'The Thousand Sons are a Traitor Legion of mad Sorcerers sworn to the service of Tzeentch, the Chaos God of magic and change. These eldritch Space Marines rule over retinues of twisted mutants and arcane automata, launching labyrinthine plots to bring about the Imperium''s destruction.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Chaos'
    ),
    NULL
  ),
  (
    'World Eaters',
    'The World Eaters lay into their enemies with gore-encrusted chainblades, screaming praise to Khorne, the Chaos God of blood and hate. This Traitor Legion of berserk Space Marines cares for nothing but slaughter, claiming skulls from the Imperium''s mightiest champions.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Chaos'
    ),
    NULL
  ),
  (
    'Chaos Daemons',
    'No foe of the Imperium is more malignant, nor more terrible, than the daemons of Chaos, the numberless foot soldiers of the Ruinous Powers. Spawned in the depths of the warp, these otherworldly legions take forms drawn from the darkest nightmares and cruellest desires of mortal minds, and will stop at nothing to see reality itself torn apart.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Chaos'
    ),
    NULL
  ),
  (
    'Aeldari',
    'Once rulers of a galactic empire, the Aeldari are now a splintered people with only fragments of their former power. Those called Asuryani have plied the stars for millennia in huge spacefaring vessels known as craftworlds - proud nomads who fight for survival with psychic wisdom, wondrous technology, and breathtaking skill.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'Drukhari',
    'The Drukhari are a sadistic reaver-civilisation of murderous Aeldari who feed off the anguish and suffering of their victims. Ever-hungry for slaves, spoils, and entertainment, they launch lightning raids on unsuspecting enemies before vanishing back to their lairs in Commorragh, the twisted nether-city that lurks below reality in the webway''s darkest corners.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'Tyranids',
    'TThe Tyranids have invaded the galaxy from beyond the intergalactic void, their hive fleets slithering like tendrils into every sector and system. Driven by the imperatives of the almighty Hive Mind, their swarms sweep over world after world in a living tide of biological killing-machines, devouring every last shred of biomass in their path.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'Genestealer Cults',
    'The Genestealer Cults gather far from the prying eyes of the Imperium''s harsh authorities, secret worshippers mutated by Tyranid infection. These fanatics undermine entire worlds to pave the way for their mysterious alien deities. Armed with sabotage, cunning, and the zealotry of true believers, they are an unseen scourge that gnaws at the very heart of the Imperium.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'Leagues of Votann',
    'The Leagues of Votann are expert miners, pragmatic traders, and resilient warriors, wielding advanced technologies lost to the Imperium. The clone-grown Kin who populate the Leagues are tough in body and mind, their armies striking out from the galactic core to claim resources and settle debts by any means necessary.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'Necrons',
    'After aeons of hibernation, the deathless android legions of the Necrons rise across the galaxy. Armies of living metal march from crumbling stasis-tombs, armed with arcane technology and nigh-impervious to damage. Ruled by maniacal Overlords intent on restoring their ancient empire, the Necrons will remind the galaxy of their cold and terrifying wrath.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'Orks',
    'Tough, brutal, and impossibly numerous, the Orks are one of the most dangerous species in the galaxy. Their marauding warbands and colossal hordes have threatened Humanity since before the dawn of the Imperium, for Orks thrive on battle and mayhem, roaming the stars in search of a good fight.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'T''au Empire',
    'Dynamic and supremely confident, the T''au have established a powerful empire of countless species working toward the philosophy of the Greater Good. This once-small civilisation now spreads like wildfire across the stars, its diplomatic efforts backed by armies of advanced battlesuits and alien auxiliaries, as it seeks to show its enemies the error of their ways.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Xenos'
    ),
    NULL
  ),
  (
    'Black Templars',
    'Every battle-brother of the Black Templars believes in the Emperor''s divinity, and is sworn to oaths of purgation and vengeance. Concepts such as mercy and forgiveness are anathema to them, and they see it as their personal mission to quash without hesitation all heretics, mutants, witches, aliens, and unbelievers.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Blood Angels',
    'The Blood Angels are amongst the most noble and honourable of Space Marines, with a history of steadfast loyalty to the Imperium that stretches back to the Great Crusade. They strive without falter to protect the innocent, but their heroic reputation conceals a hideous curse. Each battle-brother fights day and night to resist this affliction, and keep it hidden from outsiders.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Dark Angels',
    'Staunch defenders of the Imperium, the dour and brooding brotherhood of the Dark Angels is merciless in attack and stubborn in defence. They are also shrouded in mystery and myth, hoarding secrets so shameful that they are kept even from many in their own ranks.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Deathwatch',
    'The Deathwatch is a specialist gathering of Space Marines, veteran warriors drawn from every other Chapter and united in a single purpoose. It is their task to hunt the alien wherever it might appear, employing forbidden technology and unorthodox tactics to safeguard the Emperor''s realm against the xenos tide.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Grey Knights',
    'Wherever daemons break through the veil of reality, wherever the powers of the warp manifest in the form of malefic entities or abhorrent possessions, the Grey Knights strike. Silver-clad psychic Space Marines from the moon of Titan, these selfless secret warriors risk all to hold back the threat of Humanity''s eternal damnation.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Imperial Fists',
    'The Imperial Fists are the stalwart defenders of the Imperium, renowned for their stoic resolve and unyielding fortitude. They are masters of siege warfare, able to hold their ground against overwhelming odds and strike back with devastating force. Their iconic yellow power armour is a symbol of their unwavering dedication to the Emperor.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Iron Hands',
    'The Iron Hands are a Chapter of Space Marines who have embraced the machine and the cold logic of technology. They are relentless in their pursuit of perfection, augmenting their bodies with cybernetic enhancements to become living weapons. Their stoic nature and unwavering resolve make them formidable foes on the battlefield.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Raven Guard',
    'The Raven Guard are masters of stealth and guerrilla warfare, striking from the shadows to deliver devastating blows to their enemies. Their black power armour allows them to blend into the darkness, and their tactics focus on speed and precision. They are the silent assassins of the Imperium, feared by all who oppose them.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Salamanders',
    'The Salamanders are a Chapter of Space Marines known for their fiery temperaments and mastery of flame-based weaponry. They are skilled artisans, crafting powerful weapons and armour, and they are fiercely protective of humanity. Their green power armour is a symbol of their dedication to the Emperor and their commitment to defending the Imperium.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Space Wolves',
    'Ferocious warriors from the death world of Fenris, the Space Wolves are dauntless, tenacious, and possess an insatiable hunger for battle. With a temper like the wrath of a winter storm, they hunt all those who defy the Imperium with swift fury akin to a crackling fire-bolt.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'Ultramarines',
    'The Ultramarines are the most famous and revered of all Space Marine Chapters, known for their discipline, honour, and tactical brilliance. They are the epitome of the Astartes, embodying the ideals of the Imperium. Their blue power armour is a symbol of their unwavering loyalty to the Emperor and their commitment to protecting humanity.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  ),
  (
    'White Scars',
    'The White Scars are a Chapter of Space Marines known for their lightning-fast hit-and-run tactics. They are masters of speed and mobility, striking with the ferocity of a storm. Their white power armour is a symbol of their dedication to the Emperor and their commitment to defending the Imperium.',
    (
      SELECT
        id
      FROM
        public.armies
      WHERE
        title = 'Space Marines'
    ),
    NULL
  );
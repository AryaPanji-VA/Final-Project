import { apiFetch } from "./api";

/* ------------------------------------------------------------------ */
/* Auth (mock)                                                         */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = "lorekeeper_token";
const USER_KEY = "lorekeeper_user";

function delay(ms = 320) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleFrom(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function login({ email }) {
  await delay();
  const name = email.split("@")[0];
  const user = { id: "u-1", name, email, handle: handleFrom(name) };
  const token = `mock-token-${crypto.randomUUID()}`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export async function register({ name, email }) {
  await delay();
  const user = { id: "u-1", name, email, handle: handleFrom(name) };
  const token = `mock-token-${crypto.randomUUID()}`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ------------------------------------------------------------------ */
/* Seed store — in memory for the session, never persisted.            */
/* ------------------------------------------------------------------ */

const TODAY = "2026-11-27";

let creators = [
  {
    id: "c-1",
    handle: "elowen-vance",
    name: "Elowen Vance",
    bio: "Writes about coastlines that remember people. Two novels, one long serial, and a stack of unfinished maps.",
    location: "Ostend, on the salt road",
    followers: 2841,
    joined: "2023-04-11",
    tone: "forest",
  },
  {
    id: "c-2",
    handle: "tomas-reid",
    name: "Tomas Reid",
    bio: "Cartographer first, novelist second. Currently mapping a country that does not exist yet.",
    location: "The northern survey",
    followers: 1190,
    joined: "2024-01-08",
    tone: "cobalt",
  },
  {
    id: "c-3",
    handle: "amara-okonjo",
    name: "Amara Okonjo",
    bio: "Speculative fiction, orbital stations, and the people who refuse to leave them.",
    location: "In transit",
    followers: 4310,
    joined: "2022-09-30",
    tone: "brass",
  },
  {
    id: "c-4",
    handle: "hollow-press",
    name: "Hollow Press",
    bio: "A small collective publishing weird pastoral horror and one very long campaign journal.",
    location: "A converted chapel",
    followers: 764,
    joined: "2024-06-02",
    tone: "moss",
  },
];

let stories = [
  {
    id: "st-1",
    title: "The Last Ember",
    slug: "the-last-ember",
    authorId: "c-1",
    genre: "Literary Fantasy",
    tags: ["islands", "sailcraft", "memory"],
    synopsis:
      "A mooring-master discovers that five of the islands she is sworn to hold are being held by something else entirely — and that the order's ledger has been lying about it for two hundred years.",
    status: "published",
    publishedAt: "2026-09-14",
    updatedAt: "2026-11-26",
    likes: 1284,
    reads: 18420,
    universeId: "unv-1",
    featured: true,
    tone: "forest",
  },
  {
    id: "st-2",
    title: "Vesper Station",
    slug: "vesper-station",
    authorId: "c-3",
    genre: "Science Fiction",
    tags: ["orbital", "isolation", "botany"],
    synopsis:
      "The last orbital station of a species waiting out the long dusk of its own sun, eighty years at a time, and the botanist who has not slept through a night cycle in eleven years.",
    status: "published",
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-21",
    likes: 2140,
    reads: 26110,
    universeId: "unv-2",
    featured: false,
    tone: "cobalt",
  },
  {
    id: "st-3",
    title: "City of Nine Gates",
    slug: "city-of-nine-gates",
    authorId: "c-1",
    genre: "Urban Fantasy",
    tags: ["gates", "fog", "cities"],
    synopsis:
      "A coastal metropolis where old myths live behind rented apartments, and every gate remembers who walked through it.",
    status: "published",
    publishedAt: "2026-07-19",
    updatedAt: "2026-11-22",
    likes: 1876,
    reads: 22340,
    universeId: "unv-3",
    featured: false,
    tone: "brass",
  },
  {
    id: "st-4",
    title: "The Salt Cartography",
    slug: "the-salt-cartography",
    authorId: "c-2",
    genre: "Historical",
    tags: ["maps", "tides", "archives"],
    synopsis:
      "A cartographer's account of a drowned trade route, reconstructed from harbour ledgers, tide tables, and one surviving compass that does not point north.",
    status: "published",
    publishedAt: "2026-06-05",
    updatedAt: "2026-10-30",
    likes: 642,
    reads: 8110,
    universeId: "unv-4",
    featured: false,
    tone: "moss",
  },
  {
    id: "st-5",
    title: "A Quiet War",
    slug: "a-quiet-war",
    authorId: "c-4",
    genre: "Literary Fantasy",
    tags: ["war", "sails", "history"],
    synopsis:
      "Two island powers fought for three hundred years over nine moorings. Neither side wrote down why, and the ships that would have known are at the bottom of an ocean that has no bottom.",
    status: "published",
    publishedAt: "2026-05-28",
    updatedAt: "2026-11-12",
    likes: 419,
    reads: 5320,
    universeId: "unv-1",
    featured: false,
    tone: "ink",
  },
  {
    id: "st-6",
    title: "The Unwritten Atlas",
    slug: "the-unwritten-atlas",
    authorId: "c-2",
    genre: "Literary Fantasy",
    tags: ["maps", "survey"],
    synopsis:
      "A surveyor is sent to map a country that keeps changing shape between visits. He begins to suspect the country is mapping him back.",
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-11-26",
    likes: 0,
    reads: 0,
    universeId: null,
    featured: false,
    tone: "moss",
  },
  {
    id: "st-7",
    title: "Saltwick",
    slug: "saltwick",
    authorId: "c-1",
    genre: "Literary Fantasy",
    tags: ["harbour", "ledgers"],
    synopsis:
      "Eleven bound volumes of tide receipts are the only surviving record of a port that no longer has a shore.",
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-11-18",
    likes: 0,
    reads: 0,
    universeId: "unv-4",
    featured: false,
    tone: "brass",
  },
  {
    id: "st-8",
    title: "The Second Vault",
    slug: "the-second-vault",
    authorId: "c-3",
    genre: "Science Fiction",
    tags: ["vault", "seeds"],
    synopsis:
      "A seed vault appears in the station plans but not in the station's inventory. Dr. Marek calls it the lower cabinet.",
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-11-15",
    likes: 0,
    reads: 0,
    universeId: "unv-2",
    featured: false,
    tone: "cobalt",
  },
];

let chapters = [
  {
    id: "ch-1",
    storyId: "st-1",
    index: 1,
    title: "The Tide That Came From Above",
    status: "published",
    words: 2410,
    updatedAt: "2026-11-24",
    content: [
      "The first thing Wren remembered about the tide was that it came from above.",
      "Not the sea — the sea was a rumour her grandmother used to tell, a flat grey nothing you could not sail on and could not drink from. The tide that mattered arrived from the cloud deck, twice a day, and it arrived as weather: a slow grey hand pressing down on the islands until every rope in the mooring yards sang.",
      "She was eleven the first time she was allowed to hold a line during a rising. Her hands were too small for the splice, so the mooring-master let her hold the slack instead, and told her that the whole trick of sailcraft was to be the last thing to let go.",
      "\u201cEverything above us is trying to leave,\u201d he said. \u201cOur job is arithmetic.\u201d",
      "She did not understand him for another nine years. When she finally did, she was standing on the leeward dock with a torn sail across her shoulders and the order's ledger open at a page she was not supposed to have read.",
      "The count in the ledger never matched the count of knots she had tied. She had tied four hundred and six. The ledger said four hundred and eleven.",
      "Five knots, then, that someone else had tied. Five islands that someone else was holding.",
    ].join("\n\n"),
  },
  {
    id: "ch-2",
    storyId: "st-1",
    index: 2,
    title: "Arithmetic",
    status: "published",
    words: 2180,
    updatedAt: "2026-11-25",
    content: [
      "The order kept its records in a room with no windows, on the theory that a mooring-master who could see the sky would stop trusting the paper.",
      "Wren had been in the room eleven times. She had been invited exactly once.",
      "The rest of the visits were her own, at hours when the clerks were asleep and the lamps had burned down to the brass. She had learned to read a ledger sideways, which is to say she had learned to read what a ledger was trying not to say.",
      "Four hundred and eleven moorings. Four hundred and six sails.",
      "The difference was not an error. Errors in the order's books were corrected in red ink, and there was no red ink on the page — only a thin line, ruled by hand, under the last entry of each year.",
      "Someone had been holding five islands with something other than sailcraft.",
    ].join("\n\n"),
  },
  {
    id: "ch-3",
    storyId: "st-1",
    index: 3,
    title: "What the Cloud Sea Keeps",
    status: "draft",
    words: 940,
    updatedAt: "2026-11-26",
    content: [
      "Draft — the middle section still needs the harbour scene.",
      "Nothing that falls into the Cloud Sea reaches a bottom. The islanders know this the way they know the shape of their own hands: not as a fact they were taught, but as something they have always been able to do.",
      "What falls returns. Not always, and not quickly, but the returns are recorded in the same ledger as the losses, in the same hand, and disputed in the same court.",
    ].join("\n\n"),
  },
  {
    id: "ch-4",
    storyId: "st-2",
    index: 1,
    title: "Eighty Years of Dusk",
    status: "published",
    words: 3120,
    updatedAt: "2026-11-19",
    content: [
      "The station had been designed for four hundred residents. At sealing it held sixty-one.",
      "Ilsa Marek had been one of the sixty-one, and she had been the only one to bring seeds.",
      "The outer ring turned at a speed chosen so that the windows always faced the sun. This was an engineering decision made eighty years earlier by people who assumed there would be a rotation schedule, and possibly a second station, and certainly somebody to hand the problem to.",
      "There was no rotation schedule. There was a dying star, a sealed ring, and a botanist who had stopped sleeping through the night cycle in the eleventh year.",
    ].join("\n\n"),
  },
  {
    id: "ch-5",
    storyId: "st-2",
    index: 2,
    title: "The Lower Cabinet",
    status: "published",
    words: 2760,
    updatedAt: "2026-11-21",
    content: [
      "The maintenance requests are the only honest documents on the station.",
      "Everything else is written for a reader: the logs, the ledgers, the protocol. A maintenance request is written for whoever is going to fix the thing, and so it tells the truth about what is broken.",
      "In the ninth year there are eleven requests that mention the lower cabinet. The inventory lists no lower cabinet.",
    ].join("\n\n"),
  },
  {
    id: "ch-6",
    storyId: "st-3",
    index: 1,
    title: "The Gate That Was Not On The Plan",
    status: "published",
    words: 1980,
    updatedAt: "2026-11-22",
    content: [
      "Every record of the city names nine gates. Every map shows eight.",
      "The survey office calls this a rounding convention, which is the kind of phrase a survey office invents when it would rather not be asked again.",
      "The seventh gate has no hinge and no handle. City records show it opening four hundred and twelve times, always between 3:10 and 3:40 in the morning, always for someone carrying something they meant to return.",
    ].join("\n\n"),
  },
  {
    id: "ch-7",
    storyId: "st-4",
    index: 1,
    title: "Low Water",
    status: "published",
    words: 2240,
    updatedAt: "2026-10-29",
    content: [
      "At low water the channel shows as a darker line across the shoals, wide enough for two ships to pass.",
      "The fishermen avoid it. The current through it runs the wrong way for six hours a day, which is not the sort of thing a channel is supposed to do, and the men who work the shoals are not paid to argue with water.",
      "Mira Aldous was not a fisherman. She was a cartographer, which is a different kind of stubborn, and she had a compass that did not point north.",
    ].join("\n\n"),
  },
  {
    id: "ch-8",
    storyId: "st-5",
    index: 1,
    title: "The War of Three Sails",
    status: "published",
    words: 3410,
    updatedAt: "2026-11-12",
    content: [
      "No Torgath ship survives. No Torgath account of the war was ever found.",
      "Everything written about them comes from order records, which is to say from their enemies, which is to say from the people who cut nine moorings and then wrote the history of the cutting.",
      "Islanders still say a sail on the horizon is Torgath weather.",
    ].join("\n\n"),
  },
];

let universes = [
  {
    id: "unv-1",
    name: "Aethermoor",
    genre: "High Fantasy",
    description:
      "An archipelago of drifting islands moored above a permanent sea of cloud, held together by wind-orders, sailcraft, and pacts older than the islands themselves.",
    visibility: "public",
    creatorId: "c-1",
    updatedAt: "2026-11-26",
    openedAt: "2026-11-25",
    tone: "forest",
  },
  {
    id: "unv-2",
    name: "Vesper Station",
    genre: "Science Fiction",
    description:
      "The last orbital research station of a species waiting out the long dusk of its own sun, eighty years at a time.",
    visibility: "public",
    creatorId: "c-3",
    updatedAt: "2026-11-21",
    openedAt: "2026-11-23",
    tone: "cobalt",
  },
  {
    id: "unv-3",
    name: "City of Nine Gates",
    genre: "Urban Fantasy",
    description:
      "A coastal metropolis where old myths live behind rented apartments, and every gate remembers who walked through it.",
    visibility: "private",
    creatorId: "c-1",
    updatedAt: "2026-11-22",
    openedAt: "2026-11-26",
    tone: "brass",
  },
  {
    id: "unv-4",
    name: "The Salt Cartography",
    genre: "Historical",
    description:
      "A cartographer's account of a drowned trade route, reconstructed from harbour ledgers, tide tables, and one surviving compass.",
    visibility: "public",
    creatorId: "c-2",
    updatedAt: "2026-10-30",
    openedAt: "2026-11-02",
    tone: "moss",
  },
];

let lore = [
  {
    id: "lore-1",
    universeId: "unv-1",
    title: "Order of the Wind Keepers",
    category: "Faction",
    canon: "canon",
    summary:
      "Knights who moor the drifting islands with sails larger than cathedrals, sworn to keep the archipelago from scattering into open sky.",
    content:
      "The Windward Order was founded in the third year of the Anchoring, when the first islands began to drift apart.\n\nIts knights train in sailcraft rather than swordplay. Rank is measured in how much sky a member can hold still. A single mooring sail takes eleven years to weave, and cannot be repaired once torn — only cut loose.",
    tags: ["knights", "sailcraft"],
    updatedAt: "2026-11-20",
  },
  {
    id: "lore-2",
    universeId: "unv-1",
    title: "The Cloud Sea",
    category: "Location",
    canon: "canon",
    summary:
      "The ocean of vapour beneath every island, deep enough to swallow a fleet and slow enough to read like weather.",
    content:
      "Nothing that falls into the Cloud Sea reaches a bottom. What falls returns years later, changed, sometimes carrying cargo from ships that never sailed.\n\nIslanders treat the sea as a ledger. Every loss is recorded, and every return is disputed in court.",
    tags: ["geography", "clouds"],
    updatedAt: "2026-11-19",
  },
  {
    id: "lore-3",
    universeId: "unv-1",
    title: "Lantern Crystals",
    category: "Artifact",
    canon: "canon",
    summary:
      "Lantern crystals hold the memory of whoever first lit them, burning for as long as that memory is remembered.",
    content:
      "A lantern crystal is cut from the spine of a fallen island. When lit, it holds one memory — usually the last one its keeper chose to keep.\n\nHouses pass them down as deeds of ownership. To hold the crystal is to hold the claim.",
    tags: ["memory", "heirlooms"],
    updatedAt: "2026-11-18",
  },
  {
    id: "lore-4",
    universeId: "unv-1",
    title: "Sable Wren",
    category: "Character",
    canon: "canon",
    summary:
      "The youngest mooring-master in the order's history, and the only one who has never lost an island.",
    content:
      "Wren was raised on the leeward docks and learned sailcraft by repairing other people's failures. She keeps a ledger of every knot she has tied, and refuses to explain why the count never matches the order's records.",
    tags: ["protagonist", "mooring"],
    updatedAt: "2026-11-24",
  },
  {
    id: "lore-5",
    universeId: "unv-1",
    title: "Marrow of the Ninth Tide",
    category: "Mythology",
    canon: "legend",
    summary:
      "A story told to children about the tide that comes from above instead of below, carrying the names of the drowned.",
    content:
      "The tale claims that once every nine generations the Cloud Sea rises instead of falls, and for a single night the islands sail on water rather than air.\n\nNo living archivist has recorded the event. Three separate accounts exist, all written in the same hand.",
    tags: ["folklore", "tides"],
    updatedAt: "2026-11-11",
  },
  {
    id: "lore-6",
    universeId: "unv-1",
    title: "The Anchoring Accords",
    category: "Mythology",
    canon: "draft",
    summary:
      "The unwritten agreement between the islands that keeps them within sight of one another.",
    content:
      "Draft notes: the Accords may not be a document at all, but a repeated performance — a recital of island names held every spring.\n\nCompare with the Vesper Station protocols before committing any of this to canon.",
    tags: ["law", "ritual"],
    updatedAt: "2026-11-26",
  },
  {
    id: "lore-7",
    universeId: "unv-2",
    title: "The Dusk Protocol",
    category: "Event",
    canon: "canon",
    summary:
      "The final ceremony held before the station enters its dark orbit, performed once every eighty years.",
    content:
      "Each resident writes a single sentence into the station ledger, then seals it. The ledger is not read until the next dusk, which means no one alive has read the previous one.",
    tags: ["ceremony", "ledger"],
    updatedAt: "2026-11-17",
  },
  {
    id: "lore-8",
    universeId: "unv-2",
    title: "Dr. Ilsa Marek",
    category: "Character",
    canon: "canon",
    summary:
      "Head botanist of the station, who has not slept through a night cycle in eleven years.",
    content:
      "Marek maintains the only surviving seed vault in orbit. She speaks to the plants in a language she insists is not a language, and the station's logs record her doing so at hours when no one else is awake.",
    tags: ["botany", "vault"],
    updatedAt: "2026-11-16",
  },
  {
    id: "lore-9",
    universeId: "unv-3",
    title: "The Seventh Gate",
    category: "Location",
    canon: "canon",
    summary:
      "An underground gate that opens only when the fog tide comes in, and only for people who are already late.",
    content:
      "The seventh gate has no hinge and no handle. City records show it opening four hundred and twelve times, always between 3:10 and 3:40 in the morning, always for someone carrying something they meant to return.",
    tags: ["gates", "fog"],
    updatedAt: "2026-11-21",
  },
  {
    id: "lore-10",
    universeId: "unv-3",
    title: "The Key-Keepers' Association",
    category: "Faction",
    canon: "draft",
    summary:
      "A tenants' association that has, without anyone deciding it, become the city's unofficial gatekeepers.",
    content:
      "Draft: nine members, one for each gate. Their meetings are held in a laundromat and their minutes are kept on receipts.\n\nNeeds a proper structure before any of this becomes canon.",
    tags: ["association", "keys"],
    updatedAt: "2026-11-25",
  },
  {
    id: "lore-11",
    universeId: "unv-4",
    title: "The Harbour Ledgers",
    category: "Artifact",
    canon: "canon",
    summary:
      "Eleven bound volumes of tide receipts, the only surviving record of a port that no longer has a shore.",
    content:
      "The ledgers were recovered from a customs house that now stands four miles out to sea. Every entry is dated, priced, and countersigned — except the last page of each volume, which is blank but ruled.",
    tags: ["ledgers", "tides"],
    updatedAt: "2026-10-28",
  },
  {
    id: "lore-12",
    universeId: "unv-4",
    title: "Saltwick Sound",
    category: "Location",
    canon: "canon",
    summary:
      "The drowned channel the old trade route followed, still visible from the air at low water.",
    content:
      "At low water the channel shows as a darker line across the shoals, wide enough for two ships to pass.\n\nFishermen avoid it: the current through it runs the wrong way for six hours a day.",
    tags: ["geography", "channel"],
    updatedAt: "2026-10-29",
  },
];

let events = [
  {
    id: "ev-1",
    universeId: "unv-1",
    era: "The First Drift",
    date: "Year 0",
    title: "The Islands Let Go",
    description:
      "The first archipelago tears free of the continent of Indral. What follows is not an exodus but an accident, recorded by a lighthouse keeper who survived it.",
    canon: "canon",
  },
  {
    id: "ev-2",
    universeId: "unv-1",
    era: "The First Drift",
    date: "Year 12",
    title: "The Anchoring",
    description:
      "Sailcraft is invented by accident, then by necessity. Eleven islands are moored within sight of one another for the first time.",
    canon: "canon",
  },
  {
    id: "ev-3",
    universeId: "unv-1",
    era: "The Sail Wars",
    date: "Year 214",
    title: "The War of Three Sails",
    description:
      "The Windward Order holds the sky against the Torgath fleet. Nine moorings are cut; two islands are never recovered.",
    canon: "canon",
  },
  {
    id: "ev-4",
    universeId: "unv-1",
    era: "The Lantern Age",
    date: "Year 512",
    title: "The Lantern Crystals Are Found",
    description:
      "Lantern crystals are discovered in the spine of a fallen island, changing how the archipelago lights itself — and who owns the light.",
    canon: "canon",
  },
  {
    id: "ev-5",
    universeId: "unv-2",
    era: "The Long Dusk",
    date: "Cycle 0",
    title: "The Station Is Sealed",
    description:
      "The last orbital station closes its outer ring and begins the eighty-year count toward dark orbit.",
    canon: "canon",
  },
  {
    id: "ev-6",
    universeId: "unv-2",
    era: "The Long Dusk",
    date: "Cycle 41",
    title: "The Seed Vault Opens",
    description:
      "Dr. Marek breaks the seal on the secondary vault without authorisation. The station records it as maintenance.",
    canon: "legend",
  },
  {
    id: "ev-7",
    universeId: "unv-3",
    era: "The Fog Years",
    date: "Year 1899",
    title: "The Seventh Gate Is Counted",
    description:
      "City surveyors officially acknowledge a gate that is not on any plan, and quietly add it to the maintenance budget.",
    canon: "canon",
  },
  {
    id: "ev-8",
    universeId: "unv-4",
    era: "The Drowned Route",
    date: "Year 1704",
    title: "The Harbour Closes",
    description:
      "The last customs entry is signed at Saltwick. Within a decade the harbour stands four miles inland of the water.",
    canon: "canon",
  },
];

let campaigns = [
  {
    id: "cmp-1",
    title: "The Forgotten Temple",
    system: "D&D 5e",
    universeId: "unv-1",
    creatorId: "c-4",
    description:
      "A four-session delve into a temple that the order's records insist was never built.",
    status: "in progress",
    sessions: 3,
    updatedAt: "2026-11-24",
    setting: "The leeward docks of Aethermoor, three days after the last mooring count.",
    quests: [
      { id: "q-1", title: "Find the surveyor's second ledger", status: "complete" },
      { id: "q-2", title: "Descend past the eighth landing", status: "active" },
      { id: "q-3", title: "Return the lantern crystal", status: "unstarted" },
    ],
    npcs: [
      { id: "npc-1", name: "Mooring-Master Hale", role: "Employer", note: "Pays in charts." },
      { id: "npc-2", name: "The Clerk Who Counts", role: "Obstacle", note: "Never blinks." },
    ],
    notes: [
      {
        id: "sn-1",
        session: 3,
        title: "The eighth landing",
        body: "Party argued about the count for twenty minutes, then found the missing five names carved into the stair.",
      },
      {
        id: "sn-2",
        session: 2,
        title: "Harbour at low tide",
        body: "Introduced the clerk. Nobody trusted him, correctly. Combat avoided by paying in tide tables.",
      },
    ],
  },
  {
    id: "cmp-2",
    title: "War of the Seven Crowns",
    system: "System agnostic",
    universeId: "unv-1",
    creatorId: "c-1",
    description: "A long-form political campaign across seven rival island courts.",
    status: "draft",
    sessions: 0,
    updatedAt: "2026-11-11",
    setting: "Seven courts, one disputed mooring, and a treaty nobody has read since year 214.",
    quests: [
      { id: "q-4", title: "Draft the seventh court", status: "unstarted" },
      { id: "q-5", title: "Decide who holds the mooring", status: "unstarted" },
    ],
    npcs: [],
    notes: [],
  },
];

/* Reader state — bookmarks, progress, follows. */
let library = {
  bookmarks: ["st-2", "st-4"],
  progress: {
    "st-1": { chapterId: "ch-2", percent: 62, at: "2026-11-26" },
    "st-3": { chapterId: "ch-6", percent: 18, at: "2026-11-22" },
    "st-2": { chapterId: "ch-4", percent: 41, at: "2026-11-21" },
  },
  follows: ["c-1", "c-3"],
};

/* ------------------------------------------------------------------ */
/* Local persistence                                                   */
/* ------------------------------------------------------------------ */

/**
 * Everything above is the seed. Mutations are mirrored into localStorage so a
 * reload does not silently discard work — this is browser-local persistence,
 * not a server, and the UI says so wherever it matters.
 *
 * Only the mutable collections are stored; creators are reference data.
 */
const STORE_KEY = "lorekeeper_store_v1";

function persist() {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ stories, chapters, universes, lore, events, campaigns, library }),
    );
  } catch {
    // Quota or a private-mode restriction: the session still works in memory.
  }
}

function hydrate() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
  } catch {
    return;
  }

  if (!saved) return;

  if (Array.isArray(saved.stories)) stories = saved.stories;
  if (Array.isArray(saved.chapters)) chapters = saved.chapters;
  if (Array.isArray(saved.universes)) universes = saved.universes;
  if (Array.isArray(saved.lore)) lore = saved.lore;
  if (Array.isArray(saved.events)) events = saved.events;
  if (Array.isArray(saved.campaigns)) campaigns = saved.campaigns;
  if (saved.library) library = saved.library;
}

hydrate();

/** Test/settings hook: drop local changes and return to the seed archive. */
export function resetArchive() {
  localStorage.removeItem(STORE_KEY);
  window.location.reload();
}


/* ------------------------------------------------------------------ */
/* Derivations                                                         */
/* ------------------------------------------------------------------ */

function shortId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Readable URL slug from a title, kept unique against existing stories. */
function slugify(title) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "story";

  let slug = base;
  let suffix = 2;
  while (stories.some((story) => story.slug === slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function chaptersOf(storyId) {
  return chapters
    .filter((chapter) => chapter.storyId === storyId)
    .sort((a, b) => a.index - b.index);
}

/** Story + author + chapters + derived counts. Single source for card meta. */
function decorateStory(story) {
  const own = chaptersOf(story.id);
  const published = own.filter((chapter) => chapter.status === "published");

  return {
    ...story,
    author: creators.find((creator) => creator.id === story.authorId) ?? null,
    chapters: own,
    chapterCount: published.length,
    totalChapters: own.length,
    wordCount: own.reduce((sum, chapter) => sum + chapter.words, 0),
    universe: universes.find((universe) => universe.id === story.universeId) ?? null,
  };
}

function decorateUniverse(universe) {
  const own = lore.filter((entry) => entry.universeId === universe.id);

  return {
    ...universe,
    creator: creators.find((creator) => creator.id === universe.creatorId) ?? null,
    entries: own.length,
    characters: own.filter((entry) => entry.category === "Character").length,
    locations: own.filter((entry) => entry.category === "Location").length,
    factions: own.filter((entry) => entry.category === "Faction").length,
    events: events.filter((event) => event.universeId === universe.id).length,
    stories: stories
      .filter((story) => story.universeId === universe.id && story.status === "published")
      .map(decorateStory),
    campaigns: campaigns
      .filter((campaign) => campaign.universeId === universe.id)
      .map((campaign) => ({ ...campaign, universe })),
  };
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const storyService = {
  async listPublished() {
    await delay();
    return stories.filter((story) => story.status === "published").map(decorateStory);
  },
  async listAll() {
    await delay();
    return stories.map(decorateStory);
  },
  /** Only the signed-in keeper's stories — the mock maps that to creators[0]. */
  async listMine() {
    await delay();
    return stories.filter((story) => story.authorId === creators[0].id).map(decorateStory);
  },
  async listByAuthor(authorId) {
    await delay();
    return stories.filter((story) => story.authorId === authorId).map(decorateStory);
  },
  async get(idOrSlug) {
    await delay(220);
    const story = stories.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
    return story ? decorateStory(story) : null;
  },
  async featured() {
    await delay();
    const story = stories.find((item) => item.featured);
    return story ? decorateStory(story) : null;
  },
  async create(values) {
    await delay(480);
    const story = {
      id: shortId("st"),
      slug: slugify(values.title ?? "story"),
      authorId: creators[0].id,
      status: "draft",
      publishedAt: null,
      likes: 0,
      reads: 0,
      featured: false,
      tone: "forest",
      tags: [],
      ...values,
      updatedAt: TODAY,
    };
    stories = [story, ...stories];
    persist();
    return decorateStory(story);
  },
  async update(id, values) {
    await delay(400);
    const index = stories.findIndex((story) => story.id === id);
    if (index === -1) throw new Error("That story could not be found.");
    stories[index] = { ...stories[index], ...values, updatedAt: TODAY };
    persist();
    return decorateStory(stories[index]);
  },
};

export const chapterService = {
  async list(storyId) {
    await delay(200);
    return chaptersOf(storyId);
  },
  async get(id) {
    await delay(180);
    return chapters.find((chapter) => chapter.id === id) ?? null;
  },
  async create(storyId, values) {
    await delay(400);
    const own = chaptersOf(storyId);
    const chapter = {
      id: shortId("ch"),
      storyId,
      index: own.length + 1,
      status: "draft",
      words: 0,
      content: "",
      ...values,
      updatedAt: TODAY,
    };
    chapters = [...chapters, chapter];
    persist();
    return chapter;
  },
  async update(id, values) {
    await delay(400);
    const index = chapters.findIndex((chapter) => chapter.id === id);
    if (index === -1) throw new Error("That chapter could not be found.");
    const words =
      typeof values.content === "string"
        ? values.content.split(/\s+/).filter(Boolean).length
        : chapters[index].words;
    chapters[index] = { ...chapters[index], ...values, words, updatedAt: TODAY };
    persist();
    return chapters[index];
  },
};

export const creatorService = {
  async list() {
    await delay();
    return creators.map((creator) => ({
      ...creator,
      storyCount: stories.filter(
        (story) => story.authorId === creator.id && story.status === "published",
      ).length,
    }));
  },
  async get(handle) {
    await delay(220);
    const creator = creators.find((item) => item.handle === handle || item.id === handle);
    if (!creator) return null;

    return {
      ...creator,
      stories: stories
        .filter((story) => story.authorId === creator.id && story.status === "published")
        .map(decorateStory),
      universes: universes
        .filter((universe) => universe.creatorId === creator.id && universe.visibility === "public")
        .map(decorateUniverse),
    };
  },
};

export const universeService = {
  async list() {
    await delay();
    return universes.map(decorateUniverse);
  },
  async listPublic() {
    await delay();
    return universes.filter((universe) => universe.visibility === "public").map(decorateUniverse);
  },
  async get(id) {
    await delay(220);
    const universe = universes.find((item) => item.id === id);
    return universe ? decorateUniverse(universe) : null;
  },
  async create(values) {
    await delay(480);
    const universe = {
      id: shortId("unv"),
      visibility: "private",
      creatorId: creators[0].id,
      updatedAt: TODAY,
      openedAt: TODAY,
      tone: "forest",
      ...values,
    };
    universes = [universe, ...universes];
    persist();
    return decorateUniverse(universe);
  },
};

export const loreService = {
  async list(universeId) {
    await delay();
    return universeId ? lore.filter((entry) => entry.universeId === universeId) : lore;
  },
  async get(id) {
    await delay(180);
    return lore.find((entry) => entry.id === id) ?? null;
  },
  async create(universeId, values) {
    await delay(400);
    const entry = {
      id: shortId("lore"),
      universeId,
      canon: "draft",
      tags: [],
      ...values,
      updatedAt: TODAY,
    };
    lore = [entry, ...lore];
    persist();
    return entry;
  },
  async update(id, values) {
    await delay(400);
    const index = lore.findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error("That entry could not be found.");
    lore[index] = { ...lore[index], ...values, updatedAt: TODAY };
    persist();
    return lore[index];
  },
};

export const timelineService = {
  async list(universeId) {
    await delay();
    return universeId ? events.filter((event) => event.universeId === universeId) : events;
  },
  async create(universeId, values) {
    await delay(400);
    const event = { id: shortId("ev"), universeId, canon: "canon", ...values };
    events = [...events, event];
    persist();
    return event;
  },
};

export const campaignService = {
  async list() {
    await delay();
    return campaigns.map((campaign) => ({
      ...campaign,
      universe: universes.find((universe) => universe.id === campaign.universeId) ?? null,
    }));
  },
  async get(id) {
    await delay(180);
    const campaign = campaigns.find((item) => item.id === id);
    return campaign
      ? {
          ...campaign,
          universe: universes.find((universe) => universe.id === campaign.universeId) ?? null,
        }
      : null;
  },
  async create(values) {
    await delay(460);
    const campaign = {
      id: shortId("cmp"),
      creatorId: creators[0].id,
      status: "draft",
      sessions: 0,
      quests: [],
      npcs: [],
      notes: [],
      ...values,
      updatedAt: TODAY,
    };
    campaigns = [campaign, ...campaigns];
    persist();
    return campaign;
  },
};

export const libraryService = {
  async get() {
    await delay(200);
    return {
      bookmarks: library.bookmarks
        .map((id) => stories.find((story) => story.id === id))
        .filter(Boolean)
        .map(decorateStory),
      following: library.follows
        .map((id) => creators.find((creator) => creator.id === id))
        .filter(Boolean)
        .map((creator) => ({
          ...creator,
          storyCount: stories.filter(
            (story) => story.authorId === creator.id && story.status === "published",
          ).length,
        })),
      progress: Object.entries(library.progress)
        .map(([storyId, state]) => {
          const story = stories.find((item) => item.id === storyId);
          if (!story) return null;
          return {
            story: decorateStory(story),
            chapterId: state.chapterId,
            percent: state.percent,
            at: state.at,
          };
        })
        .filter(Boolean),
    };
  },
  async isBookmarked(storyId) {
    await delay(80);
    return library.bookmarks.includes(storyId);
  },
  async toggleBookmark(storyId) {
    await delay(160);
    const has = library.bookmarks.includes(storyId);
    library.bookmarks = has
      ? library.bookmarks.filter((id) => id !== storyId)
      : [...library.bookmarks, storyId];
    persist();
    return !has;
  },
  async setProgress(storyId, chapterId, percent) {
    await delay(120);
    library.progress[storyId] = { chapterId, percent, at: TODAY };
    persist();
    return library.progress[storyId];
  },
  async toggleFollow(creatorId) {
    await delay(160);
    const has = library.follows.includes(creatorId);
    library.follows = has
      ? library.follows.filter((id) => id !== creatorId)
      : [...library.follows, creatorId];
    persist();
    return !has;
  },
  async isFollowing(creatorId) {
    await delay(80);
    return library.follows.includes(creatorId);
  },
};

export { apiFetch };

// All 78 Tarot Cards with meanings
export const tarotDeck = [
  // MAJOR ARCANA (0-21)
  {
    id: 0,
    name: "The Fool",
    type: "major",
    uprightMeaning: "New beginnings, innocence, spontaneity, free spirit",
    reversedMeaning: "Recklessness, taken advantage of, inconsideration"
  },
  {
    id: 1,
    name: "The Magician",
    type: "major",
    uprightMeaning: "Manifestation, resourcefulness, power, inspired action",
    reversedMeaning: "Manipulation, poor planning, untapped talents"
  },
  {
    id: 2,
    name: "The High Priestess",
    type: "major",
    uprightMeaning: "Intuition, sacred knowledge, divine feminine, subconscious",
    reversedMeaning: "Secrets, disconnected from intuition, withdrawal"
  },
  {
    id: 3,
    name: "The Empress",
    type: "major",
    uprightMeaning: "Femininity, beauty, nature, abundance, nurturing",
    reversedMeaning: "Creative block, dependence on others"
  },
  {
    id: 4,
    name: "The Emperor",
    type: "major",
    uprightMeaning: "Authority, establishment, structure, father figure",
    reversedMeaning: "Domination, excessive control, lack of discipline"
  },
  {
    id: 5,
    name: "The Hierophant",
    type: "major",
    uprightMeaning: "Spiritual wisdom, religious beliefs, conformity, tradition",
    reversedMeaning: "Personal beliefs, freedom, challenging the status quo"
  },
  {
    id: 6,
    name: "The Lovers",
    type: "major",
    uprightMeaning: "Love, harmony, relationships, values alignment, choices",
    reversedMeaning: "Self-love, disharmony, imbalance, misalignment"
  },
  {
    id: 7,
    name: "The Chariot",
    type: "major",
    uprightMeaning: "Control, willpower, success, action, determination",
    reversedMeaning: "Self-discipline, opposition, lack of direction"
  },
  {
    id: 8,
    name: "Strength",
    type: "major",
    uprightMeaning: "Strength, courage, persuasion, influence, compassion",
    reversedMeaning: "Inner strength, self-doubt, low energy, raw emotion"
  },
  {
    id: 9,
    name: "The Hermit",
    type: "major",
    uprightMeaning: "Soul-searching, introspection, being alone, inner guidance",
    reversedMeaning: "Isolation, loneliness, withdrawal"
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    type: "major",
    uprightMeaning: "Good luck, karma, life cycles, destiny, turning point",
    reversedMeaning: "Bad luck, resistance to change, breaking cycles"
  },
  {
    id: 11,
    name: "Justice",
    type: "major",
    uprightMeaning: "Justice, fairness, truth, cause and effect, law",
    reversedMeaning: "Unfairness, lack of accountability, dishonesty"
  },
  {
    id: 12,
    name: "The Hanged Man",
    type: "major",
    uprightMeaning: "Pause, surrender, letting go, new perspectives",
    reversedMeaning: "Delays, resistance, stalling, indecision"
  },
  {
    id: 13,
    name: "Death",
    type: "major",
    uprightMeaning: "Endings, change, transformation, transition",
    reversedMeaning: "Resistance to change, personal transformation, inner purging"
  },
  {
    id: 14,
    name: "Temperance",
    type: "major",
    uprightMeaning: "Balance, moderation, patience, purpose",
    reversedMeaning: "Imbalance, excess, self-healing, re-alignment"
  },
  {
    id: 15,
    name: "The Devil",
    type: "major",
    uprightMeaning: "Shadow self, attachment, addiction, restriction, sexuality",
    reversedMeaning: "Releasing limiting beliefs, exploring dark thoughts, detachment"
  },
  {
    id: 16,
    name: "The Tower",
    type: "major",
    uprightMeaning: "Sudden change, upheaval, chaos, revelation, awakening",
    reversedMeaning: "Personal transformation, fear of change, averting disaster"
  },
  {
    id: 17,
    name: "The Star",
    type: "major",
    uprightMeaning: "Hope, faith, purpose, renewal, spirituality",
    reversedMeaning: "Lack of faith, despair, self-trust, disconnection"
  },
  {
    id: 18,
    name: "The Moon",
    type: "major",
    uprightMeaning: "Illusion, fear, anxiety, subconscious, intuition",
    reversedMeaning: "Release of fear, repressed emotion, inner confusion"
  },
  {
    id: 19,
    name: "The Sun",
    type: "major",
    uprightMeaning: "Positivity, fun, warmth, success, vitality",
    reversedMeaning: "Inner child, feeling down, overly optimistic"
  },
  {
    id: 20,
    name: "Judgement",
    type: "major",
    uprightMeaning: "Judgement, rebirth, inner calling, absolution",
    reversedMeaning: "Self-doubt, inner critic, ignoring the call"
  },
  {
    id: 21,
    name: "The World",
    type: "major",
    uprightMeaning: "Completion, accomplishment, travel, fulfillment",
    reversedMeaning: "Seeking personal closure, short-cut, delays"
  },

  // MINOR ARCANA - WANDS
  { id: 22, name: "Ace of Wands", suit: "wands", type: "minor", uprightMeaning: "Inspiration, new opportunities, growth, potential", reversedMeaning: "An emerging idea, lack of direction, distractions" },
  { id: 23, name: "Two of Wands", suit: "wands", type: "minor", uprightMeaning: "Future planning, progress, decisions, discovery", reversedMeaning: "Personal goals, inner alignment, fear of unknown" },
  { id: 24, name: "Three of Wands", suit: "wands", type: "minor", uprightMeaning: "Progress, expansion, foresight, overseas opportunities", reversedMeaning: "Playing small, lack of foresight, unexpected delays" },
  { id: 25, name: "Four of Wands", suit: "wands", type: "minor", uprightMeaning: "Celebration, joy, harmony, relaxation, homecoming", reversedMeaning: "Personal celebration, inner harmony, conflict with others" },
  { id: 26, name: "Five of Wands", suit: "wands", type: "minor", uprightMeaning: "Conflict, disagreements, competition, tension", reversedMeaning: "Inner conflict, conflict avoidance, release of tension" },
  { id: 27, name: "Six of Wands", suit: "wands", type: "minor", uprightMeaning: "Success, public recognition, progress, self-confidence", reversedMeaning: "Private achievement, personal definition of success" },
  { id: 28, name: "Seven of Wands", suit: "wands", type: "minor", uprightMeaning: "Challenge, competition, protection, perseverance", reversedMeaning: "Exhaustion, giving up, overwhelmed" },
  { id: 29, name: "Eight of Wands", suit: "wands", type: "minor", uprightMeaning: "Movement, fast paced change, action, alignment", reversedMeaning: "Delays, frustration, resisting change, internal alignment" },
  { id: 30, name: "Nine of Wands", suit: "wands", type: "minor", uprightMeaning: "Resilience, courage, persistence, test of faith", reversedMeaning: "Inner resources, struggle, overwhelm, defensive" },
  { id: 31, name: "Ten of Wands", suit: "wands", type: "minor", uprightMeaning: "Burden, extra responsibility, hard work, completion", reversedMeaning: "Doing it all, carrying the burden, delegation" },
  { id: 32, name: "Page of Wands", suit: "wands", type: "minor", uprightMeaning: "Inspiration, ideas, discovery, limitless potential", reversedMeaning: "Newly-formed ideas, redirecting energy, self-limiting beliefs" },
  { id: 33, name: "Knight of Wands", suit: "wands", type: "minor", uprightMeaning: "Energy, passion, inspired action, adventure, impulsiveness", reversedMeaning: "Passion project, haste, scattered energy, delays" },
  { id: 34, name: "Queen of Wands", suit: "wands", type: "minor", uprightMeaning: "Courage, confidence, independence, social butterfly", reversedMeaning: "Self-respect, self-confidence, introverted, re-establish" },
  { id: 35, name: "King of Wands", suit: "wands", type: "minor", uprightMeaning: "Natural-born leader, vision, entrepreneur, honour", reversedMeaning: "Impulsiveness, haste, ruthless, high expectations" },

  // MINOR ARCANA - CUPS
  { id: 36, name: "Ace of Cups", suit: "cups", type: "minor", uprightMeaning: "Love, new relationships, compassion, creativity", reversedMeaning: "Self-love, intuition, repressed emotions" },
  { id: 37, name: "Two of Cups", suit: "cups", type: "minor", uprightMeaning: "Unified love, partnership, mutual attraction", reversedMeaning: "Self-love, break-ups, disharmony, distrust" },
  { id: 38, name: "Three of Cups", suit: "cups", type: "minor", uprightMeaning: "Celebration, friendship, creativity, collaborations", reversedMeaning: "Independence, alone time, hardcore partying" },
  { id: 39, name: "Four of Cups", suit: "cups", type: "minor", uprightMeaning: "Meditation, contemplation, apathy, reevaluation", reversedMeaning: "Retreat, withdrawal, checking in for alignment" },
  { id: 40, name: "Five of Cups", suit: "cups", type: "minor", uprightMeaning: "Regret, failure, disappointment, pessimism", reversedMeaning: "Personal setbacks, self-forgiveness, moving on" },
  { id: 41, name: "Six of Cups", suit: "cups", type: "minor", uprightMeaning: "Revisiting the past, childhood memories, innocence", reversedMeaning: "Living in the past, forgiveness, lacking playfulness" },
  { id: 42, name: "Seven of Cups", suit: "cups", type: "minor", uprightMeaning: "Opportunities, choices, wishful thinking, illusion", reversedMeaning: "Alignment, personal values, overwhelmed by choices" },
  { id: 43, name: "Eight of Cups", suit: "cups", type: "minor", uprightMeaning: "Disappointment, abandonment, withdrawal, escapism", reversedMeaning: "Trying one more time, indecision, aimless drifting" },
  { id: 44, name: "Nine of Cups", suit: "cups", type: "minor", uprightMeaning: "Contentment, satisfaction, gratitude, wish come true", reversedMeaning: "Inner happiness, materialism, dissatisfaction" },
  { id: 45, name: "Ten of Cups", suit: "cups", type: "minor", uprightMeaning: "Divine love, blissful relationships, harmony, alignment", reversedMeaning: "Disconnection, misaligned values, struggling relationships" },
  { id: 46, name: "Page of Cups", suit: "cups", type: "minor", uprightMeaning: "Creative opportunities, intuitive messages, curiosity", reversedMeaning: "New ideas, doubting intuition, creative blocks" },
  { id: 47, name: "Knight of Cups", suit: "cups", type: "minor", uprightMeaning: "Creativity, romance, charm, imagination, beauty", reversedMeaning: "Overactive imagination, unrealistic, jealous, moody" },
  { id: 48, name: "Queen of Cups", suit: "cups", type: "minor", uprightMeaning: "Compassionate, caring, emotionally stable, intuitive", reversedMeaning: "Inner feelings, self-care, self-love, co-dependency" },
  { id: 49, name: "King of Cups", suit: "cups", type: "minor", uprightMeaning: "Emotionally balanced, compassionate, diplomatic", reversedMeaning: "Self-compassion, inner feelings, moodiness, emotionally manipulative" },

  // MINOR ARCANA - SWORDS
  { id: 50, name: "Ace of Swords", suit: "swords", type: "minor", uprightMeaning: "Breakthroughs, new ideas, mental clarity, success", reversedMeaning: "Inner clarity, re-thinking an idea, clouded judgement" },
  { id: 51, name: "Two of Swords", suit: "swords", type: "minor", uprightMeaning: "Difficult decisions, weighing up options, stalemate", reversedMeaning: "Indecision, confusion, information overload" },
  { id: 52, name: "Three of Swords", suit: "swords", type: "minor", uprightMeaning: "Heartbreak, emotional pain, sorrow, grief, hurt", reversedMeaning: "Negative self-talk, releasing pain, optimism, forgiveness" },
  { id: 53, name: "Four of Swords", suit: "swords", type: "minor", uprightMeaning: "Rest, relaxation, meditation, contemplation, recuperation", reversedMeaning: "Exhaustion, burn-out, deep contemplation, stagnation" },
  { id: 54, name: "Five of Swords", suit: "swords", type: "minor", uprightMeaning: "Conflict, disagreements, competition, defeat, win at all costs", reversedMeaning: "Reconciliation, making amends, past resentment" },
  { id: 55, name: "Six of Swords", suit: "swords", type: "minor", uprightMeaning: "Transition, change, rite of passage, releasing baggage", reversedMeaning: "Personal transition, resistance to change, unfinished business" },
  { id: 56, name: "Seven of Swords", suit: "swords", type: "minor", uprightMeaning: "Betrayal, deception, getting away with something, stealth", reversedMeaning: "Imposter syndrome, self-deceit, keeping secrets" },
  { id: 57, name: "Eight of Swords", suit: "swords", type: "minor", uprightMeaning: "Negative thoughts, self-imposed restriction, imprisonment", reversedMeaning: "Self-limiting beliefs, inner critic, releasing negative thoughts" },
  { id: 58, name: "Nine of Swords", suit: "swords", type: "minor", uprightMeaning: "Anxiety, worry, fear, depression, nightmares", reversedMeaning: "Inner turmoil, deep-seated fears, secrets, releasing worry" },
  { id: 59, name: "Ten of Swords", suit: "swords", type: "minor", uprightMeaning: "Painful endings, deep wounds, betrayal, loss, crisis", reversedMeaning: "Recovery, regeneration, resisting an inevitable end" },
  { id: 60, name: "Page of Swords", suit: "swords", type: "minor", uprightMeaning: "New ideas, curiosity, thirst for knowledge, new ways", reversedMeaning: "Self-expression, all talk and no action, haphazard action" },
  { id: 61, name: "Knight of Swords", suit: "swords", type: "minor", uprightMeaning: "Ambitious, action-oriented, driven to succeed, fast-thinking", reversedMeaning: "Restless, unfocused, impulsive, burn-out" },
  { id: 62, name: "Queen of Swords", suit: "swords", type: "minor", uprightMeaning: "Independent, unbiased judgement, clear boundaries, direct", reversedMeaning: "Overly-emotional, easily influenced, bitchy, cold-hearted" },
  { id: 63, name: "King of Swords", suit: "swords", type: "minor", uprightMeaning: "Mental clarity, intellectual power, authority, truth", reversedMeaning: "Quiet power, inner truth, misuse of power, manipulation" },

  // MINOR ARCANA - PENTACLES
  { id: 64, name: "Ace of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "A new financial or career opportunity, manifestation, abundance", reversedMeaning: "Lost opportunity, lack of planning and foresight" },
  { id: 65, name: "Two of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Multiple priorities, time management, prioritisation, adaptability", reversedMeaning: "Over-committed, disorganisation, reprioritisation" },
  { id: 66, name: "Three of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Teamwork, collaboration, learning, implementation", reversedMeaning: "Disharmony, misalignment, working alone" },
  { id: 67, name: "Four of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Saving money, security, conservatism, scarcity, control", reversedMeaning: "Over-spending, greed, self-protection" },
  { id: 68, name: "Five of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Financial loss, poverty, lack mindset, isolation, worry", reversedMeaning: "Recovery from financial loss, spiritual poverty" },
  { id: 69, name: "Six of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Giving, receiving, sharing wealth, generosity, charity", reversedMeaning: "Self-care, unpaid debts, one-sided charity" },
  { id: 70, name: "Seven of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Long-term view, sustainable results, perseverance, investment", reversedMeaning: "Lack of long-term vision, limited success or reward" },
  { id: 71, name: "Eight of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Apprenticeship, repetitive tasks, mastery, skill development", reversedMeaning: "Self-development, perfectionism, misdirected activity" },
  { id: 72, name: "Nine of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Abundance, luxury, self-sufficiency, financial independence", reversedMeaning: "Self-worth, over-investment in work, hustling" },
  { id: 73, name: "Ten of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Wealth, financial security, family, long-term success, contribution", reversedMeaning: "The dark side of wealth, financial failure or loss" },
  { id: 74, name: "Page of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Manifestation, financial opportunity, skill development", reversedMeaning: "Lack of progress, procrastination, learn from failure" },
  { id: 75, name: "Knight of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Hard work, productivity, routine, conservatism", reversedMeaning: "Self-discipline, boredom, feeling 'stuck', perfectionism" },
  { id: 76, name: "Queen of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Nurturing, practical, providing financially, grounded", reversedMeaning: "Financial independence, self-care, work-home conflict" },
  { id: 77, name: "King of Pentacles", suit: "pentacles", type: "minor", uprightMeaning: "Wealth, business, leadership, security, discipline, abundance", reversedMeaning: "Financially inept, obsessed with wealth and status" }
];

// Fisher-Yates shuffle algorithm for true randomness
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Randomly decide if card is reversed
export function drawCard(card) {
  const isReversed = Math.random() < 0.5;
  return {
    ...card,
    isReversed,
    meaning: isReversed ? card.reversedMeaning : card.uprightMeaning,
    orientation: isReversed ? "Reversed" : "Upright"
  };
}

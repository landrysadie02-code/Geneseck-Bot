import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, errorEmbed, successEmbed, infoEmbed, warningEmbed } from '../../utils/embeds.js';
import { getEconomyData, getMaxBankCapacity } from '../../utils/economy.js';
import { withErrorHandling, createError, ErrorTypes } from '../../utils/errorHandler.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

// /blackjack command

// Create deck
// Shuffle deck
// Deal cards

// Player: 2 cards
// Dealer: 2 cards

// Send embed showing:
// Dealer: [K] [?]
// Player: [10] [7]

// Add Hit and Stand buttons

// If Hit:
// Draw card
// Update embed

// If Stand:
// Dealer draws until 17
// Compare totals
// Announce winner

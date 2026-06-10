const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play a game of Blackjack'),

    async execute(interaction) {

        function createDeck() {
            const suits = ['♠', '♥', '♦', '♣'];
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

            const deck = [];

            for (const suit of suits) {
                for (const rank of ranks) {
                    deck.push({ suit, rank });
                }
            }

            return deck;
        }

        function shuffle(deck) {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }

        function getCardValue(card) {
            if (['J', 'Q', 'K'].includes(card.rank)) return 10;
            if (card.rank === 'A') return 11;
            return Number(card.rank);
        }

        function getHandValue(hand) {
            let total = 0;
            let aces = 0;

            for (const card of hand) {
                total += getCardValue(card);

                if (card.rank === 'A') aces++;
            }

            while (total > 21 && aces > 0) {
                total -= 10;
                aces--;
            }

            return total;
        }

        function formatHand(hand) {
            return hand.map(card => `${card.rank}${card.suit}`).join(' ');
        }

        const deck = createDeck();
        shuffle(deck);

        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Success)
            );

        const message = await interaction.reply({
            content:
`🎲 **Blackjack**

Dealer: ${dealerHand[0].rank}${dealerHand[0].suit} ??

Your Hand: ${formatHand(playerHand)}
Value: ${getHandValue(playerHand)}`,
            components: [buttons],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'This is not your game.',
                    ephemeral: true
                });
            }

            if (i.customId === 'hit') {

                playerHand.push(deck.pop());

                const playerValue = getHandValue(playerHand);

                if (playerValue > 21) {

                    collector.stop();

                    return i.update({
                        content:
`🎲 **Blackjack**

Dealer: ${formatHand(dealerHand)}
Dealer Value: ${getHandValue(dealerHand)}

Your Hand: ${formatHand(playerHand)}
Your Value: ${playerValue}

💥 You busted!`,
                        components: []
                    });
                }

                await i.update({
                    content:
`🎲 **Blackjack**

Dealer: ${dealerHand[0].rank}${dealerHand[0].suit} ??

Your Hand: ${formatHand(playerHand)}
Value: ${playerValue}`,
                    components: [buttons]
                });
            }

            if (i.customId === 'stand') {

                while (getHandValue(dealerHand) < 17) {
                    dealerHand.push(deck.pop());
                }

                const playerValue = getHandValue(playerHand);
                const dealerValue = getHandValue(dealerHand);

                let result;

                if (dealerValue > 21) {
                    result = '🎉 Dealer busted! You win!';
                } else if (playerValue > dealerValue) {
                    result = '🎉 You win!';
                } else if (dealerValue > playerValue) {
                    result = '😔 Dealer wins!';
                } else {
                    result = '🤝 Push (Tie)!';
                }

                collector.stop();

                await i.update({
                    content:
`🎲 **Blackjack**

Dealer: ${formatHand(dealerHand)}
Dealer Value: ${dealerValue}

Your Hand: ${formatHand(playerHand)}
Your Value: ${playerValue}

${result}`,
                    components: []
                });
            }
        });

        collector.on('end', async () => {
            try {
                await interaction.editReply({
                    components: []
                });
            } catch {}
        });
    }
};

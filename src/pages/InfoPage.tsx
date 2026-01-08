import { Link } from "react-router-dom";
import { MenuBackground } from "../components/MenuBackground";
import "./InfoPage.css";

export function InfoPage() {
  return (
    <MenuBackground>
      <div className="info-page">
        <h1>How to Play Joker Smash</h1>

        <div className="info-content">
          <section className="info-section">
            <h2>🎯 Objective</h2>
            <p>
              Be the first player to get rid of all your cards by forming valid
              sets (groups or sequences) and placing them on the board. Win by
              emptying your hand or having only jokers remaining!
            </p>
          </section>

          <section className="info-section">
            <h2>🃏 Card Values</h2>
            <ul>
              <li>
                <strong>Number cards (2-10):</strong> Face value
              </li>
              <li>
                <strong>Jack, Queen, King:</strong> Worth 10 points
              </li>
              <li>
                <strong>Ace:</strong> Can be 1 or 14 (low or high in sequences)
              </li>
              <li>
                <strong>Jokers:</strong> Wild cards that can represent any card
              </li>
            </ul>
          </section>

          <section className="info-section">
            <h2>📋 Game Setup</h2>
            <ul>
              <li>Each player starts with a hand of cards</li>
              <li>
                Cards are dealt from a shuffled deck (can be multiple decks)
              </li>
              <li>Each turn has a time limit for drawing and playing</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>🎮 Turn Structure</h2>
            <div className="turn-phases">
              <div className="phase">
                <h3>Phase 1: Draw</h3>
                <p>Draw one card from either:</p>
                <ul>
                  <li>The main deck (always available)</li>
                  <li>
                    The throw pile top card (available from turn 4 onwards)
                  </li>
                </ul>
              </div>

              <div className="phase">
                <h3>Phase 2: Action</h3>
                <p>Choose one action:</p>
                <ul>
                  <li>Place a valid set on the board (minimum 3 cards)</li>
                  <li>Add cards to existing sets on the board</li>
                  <li>Replace a joker on the board with the matching card</li>
                  <li>Throw away one card to the throw pile</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>✅ Valid Sets</h2>

            <div className="set-type">
              <h3>Groups (Same Value, Different Suits)</h3>
              <p>3 or more cards of the same value but different suits:</p>
              <ul>
                <li>Example: 7♥ 7♠ 7♦</li>
                <li>Can include jokers: 7♥ 7♠ 🃏</li>
                <li>Cannot have duplicate suits (no 2x 7♥)</li>
                <li>Maximum 2 cards of the same suit per group</li>
              </ul>
            </div>

            <div className="set-type">
              <h3>Sequences (Same Suit, Consecutive Values)</h3>
              <p>3 or more consecutive cards of the same suit:</p>
              <ul>
                <li>Example: 5♥ 6♥ 7♥</li>
                <li>Can include jokers to fill gaps: 5♥ 🃏 7♥</li>
                <li>Aces can be low (A-2-3) or high (Q-K-A)</li>
                <li>All cards must be the same suit</li>
              </ul>
            </div>
          </section>

          <section className="info-section">
            <h2>🎭 Joker Rules</h2>
            <ul>
              <li>Jokers can substitute any card in a set</li>
              <li>
                Starting from turn 4, you can replace a joker on the board
              </li>
              <li>
                To replace: select a card from your hand that matches the
                joker's position
              </li>
              <li>The joker returns to your hand after replacement</li>
              <li>The set must remain valid after the replacement</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>⏱️ Time Limits</h2>
            <ul>
              <li>Each phase has a time limit (set by room creator)</li>
              <li>
                If time expires during draw phase: automatically draw from deck
              </li>
              <li>
                If time expires during action phase: last card is thrown away
              </li>
            </ul>
          </section>

          <section className="info-section">
            <h2>🏆 Winning</h2>
            <p>You win when:</p>
            <ul>
              <li>Your hand is completely empty, OR</li>
              <li>All remaining cards in your hand are jokers</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>💡 Tips & Strategy</h2>
            <ul>
              <li>Keep track of cards in the throw pile for strategic draws</li>
              <li>Save jokers for completing difficult sets</li>
              <li>Replace jokers on the board when you can to get them back</li>
              <li>Watch the timer - don't let time run out!</li>
              <li>Plan your sets before placing them on the board</li>
            </ul>
          </section>
        </div>

        <Link to="/" className="back-button">
          ← Back to Menu
        </Link>
      </div>
    </MenuBackground>
  );
}

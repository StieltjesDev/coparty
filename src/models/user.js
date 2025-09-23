import Deck from "./decks.js";
import GamemodeStats from "./gamemodeStats.js";

class User {
  constructor({
    id = null,
    username = "",
    role = "user",
    password = "",
    decks = [],
    gamemodeStats = [],
  } = {}) {
    this.id = id;
    this.username = username;
    this.role = role;
    this.password = password;
    this.decks = decks.map(deck => deck instanceof Deck ? deck : new Deck(deck));
    this.gamemodeStats = gamemodeStats.map(g => g instanceof GamemodeStats ? g : new GamemodeStats(g));
  }

  addDeck(deck) {
    if (!(deck instanceof Deck)) throw new Error("Precisa ser um objeto Deck");
    this.decks.push(deck);
  }

  // Para enviar à API como JSON
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      password: this.password,
      decks: this.decks.map(deck => deck.toJSON()),
      gamemodeStats: this.gamemodeStats.map(g => g.toJSON()),
    };
  }
}

export default User;
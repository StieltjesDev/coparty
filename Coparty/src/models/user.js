import Deck from "./decks.js";

class User {
  constructor({
    id = null,
    username = "",
    role = "user",
    password = "",
    win = 0,
    losse = 0,
    tie = 0,
    totalgameplayed = 0,
    decks = [],
    tiebraker1 = null,
    tiebraker2 = null,
    tiebraker3 = null,
  } = {}) {
    this.id = id;
    this.username = username;
    this.role = role;
    this.password = password;
    this.win = win;
    this.losse = losse;
    this.tie = tie;
    this.totalgameplayed = totalgameplayed;
    this.decks = decks.map(deck => deck instanceof Deck ? deck : new Deck(deck));
    this.tiebraker1 = tiebraker1;
    this.tiebraker2 = tiebraker2;
    this.tiebraker3 = tiebraker3;
  }

  addDeck(deck) {
    if (deck instanceof Deck) {
      this.decks.push(deck);
    } else {
      console.error("Precisa ser um objeto da classe Deck!");
    }
  }

  addWin() {
    this.win++;
    this.totalgameplayed++;
    cacularTiebrakers();
  }

  addLosse() {
    this.losse++;
    this.totalgameplayed++;
    cacularTiebrakers();
  }

  addTie() {
    this.tiebraker1++;
    this.totalgameplayed++;
    cacularTiebrakers();
  }

  calularTiebraker1() {
    if (this.totalgameplayed === 0) return 0;
    return (this.win + 0.5 * this.tie) / this.totalgameplayed;
  }

  cacularTiebraker2() {
    if (this.totalgameplayed === 0) return 0;
    return this.win / this.totalgameplayed;
  }

  cacularTiebraker3() {
    if (this.totalgameplayed === 0) return 0;
    return this.win - this.losse;
  }

  cacularTiebrakers() {
    this.tiebraker1 = this.calularTiebraker1();
    this.tiebraker2 = this.cacularTiebraker2();
    this.tiebraker3 = this.cacularTiebraker3();
  }

  // Para enviar à API como JSON
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      password: this.password,
      win: this.win,
      losse: this.losse,
      tie: this.tie,
      totalgameplayed: this.totalgameplayed,
      decks: this.decks.map(deck => deck.toJSON()),
      tiebraker1: this.tiebraker1,
      tiebraker2: this.tiebraker2,
      tiebraker3: this.tiebraker3,
    };
  }
}

export default User;
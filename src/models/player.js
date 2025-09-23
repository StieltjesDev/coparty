class Player {
  constructor({
    user = null,   // instância da classe User
    points = 0,
    deck = null,    // instância da classe Deck
    win = 0,
    losse = 0,
    tie = 0,
  } = {}) {
    if (!(user instanceof User)) {
      throw new Error("Player precisa ter um User válido");
    }

    this.user = user;
    this.points = points;
    this.deck = null; // inicializa sem deck
    this.win = win;
    this.losse = losse;
    this.tie = tie;

    if (deck) {
      this.setDeck(deck); // valida aqui
    }
  }

  // Alterar deck usado no torneio
  setDeck(deck) {
    if (!(deck instanceof Deck)) {
      throw new Error("Deck precisa ser uma instância da classe Deck");
    }

    // Valida se deck pertence à lista do user
    const userDeckIds = this.user.decks.map(d => d.id);
    if (!userDeckIds.includes(deck.id)) {
      throw new Error("Deck não pertence ao usuário");
    }

    this.deck = deck;
  }

  // Adicionar pontos
  addPoints(valor) {
    this.points += valor;
  }
  
  // Para enviar para API
  toJSON() {
    return {
      user: this.user.toJSON(),
      points: this.points,
      deck: this.deck ? this.deck.toJSON() : null,    // instância da classe Deck
      win: this.win,
      losse: this.losse,
      tie: this.tie,
    };
  }
}
export default Player;
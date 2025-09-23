class Event {
  constructor({
    id = null,
    name = "",
    description = "",
    date = "",       // pode ser string ou Date
    time = "",       // string ou Date
    paringMode = "manual",  // ou outro modo
    gameMode = "standard",  // ou outro modo
    status = "scheduled",   // scheduled, ongoing, finished
    players = []            // array de Player
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.date = date;
    this.time = time;
    this.paringMode = paringMode;
    this.gameMode = gameMode;
    this.status = status;
    this.players = [];

    // Adiciona players usando o método para validar
    if (players.length > 0 ) players.forEach(player => this.addPlayer(player));
  }

  // Adiciona um player ao evento, valida que é instância de Player
  addPlayer(player) {
    if (!(player instanceof Player)) {
      throw new Error("Só é possível adicionar objetos da classe Player");
    }

    this.players.push(player);
  }

  // Ordena os players pelo points do Player (do maior para o menor)
  sortPlayersByPoints() {
    this.players.sort((a, b) => b.points - a.points);
  }

  // Retorna o placar do evento
  getLeaderboard() {
    this.sortPlayersByPoints();
    return this.players.map((p, index) => ({
      position: index + 1,
      username: p.user.username,
      points: p.points,
      deck: p.deck ? p.deck.comandante : null
    }));
  }

  // Para enviar à API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      date: this.date,
      time: this.time,
      paringMode: this.paringMode,
      gameMode: this.gameMode,
      status: this.status,
      players: this.players.map(p => p.toJSON())
    };
  }
}
export default Event;
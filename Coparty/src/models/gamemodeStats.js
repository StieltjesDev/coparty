class GameModeStats {
  constructor({ id = 0, name = "", win = 0, losse = 0, tie = 0 } = {}) {
    this.id = id;
    this.name = name;
    this.win = win;
    this.losse = losse;
    this.tie = tie;
  }

  addWin() { this.win++; }
  addLosse() { this.losse++; }
  addTie() { this.tie++; }

  getTotalgameplayed() {
    return this.win + this.losse + this.tie;
  }

  getTiebraker1() {
    if (this.getTotalgameplayed === 0) return 0;
    return (this.win + 0.5 * this.tie) / this.getTotalgameplayed;
  }

  getTiebraker2() {
    if (this.getTotalgameplayed === 0) return 0;
    return this.win / this.getTotalgameplayed;
  }

  getTiebraker3() {
    if (this.getTotalgameplayed === 0) return 0;
    return this.win - this.losse;
  }

  getTiebrakers() {
    this.tiebraker1 = this.getTiebraker1();
    this.tiebraker2 = this.getTiebraker2();
    this.tiebraker3 = this.getTiebraker3();
  }


  toJSON() {
    return { name: this.name, win: this.win, losse: this.losse, tie: this.tie };
    }
}

export default GameModeStats;
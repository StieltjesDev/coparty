class Deck {
  constructor({ id = null, comandante = "", link = "" } = {}) {
    this.id = id;
    this.comandante = comandante;
    this.setLink(link); // valida no construtor
  }

  setLink(novoLink) {
    if (novoLink && !this.isValidLink(novoLink)) {
      throw new Error("Link inválido! Precisa ser da LigaMagic ou Moxfield.");
    }
    this.link = novoLink;
  }

  isValidLink(link) {
    // Valida se começa com os domínios corretos
    return link.startsWith("https://www.ligamagic.com.br/?view=dks/deck&id") ||
           link.startsWith("https://moxfield.com/decks/");
  }

  toJSON() {
    return {
      id: this.id,
      comandante: this.comandante,
      link: this.link,
    };
  }

  static fromJSON(obj) {
    return new Deck(obj);
  }
}

export default Deck;
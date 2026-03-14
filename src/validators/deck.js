const SUPPORTED_DECK_LINKS = [
  'https://www.ligamagic.com.br/?view=dks/deck&id',
  'https://moxfield.com/decks/',
]

export function isSupportedDeckLink(link) {
  return SUPPORTED_DECK_LINKS.some((prefix) => link.startsWith(prefix))
}

export function validateDeckField(field, value) {
  switch (field) {
    case 'name':
      if (!value) return 'O nome e obrigatorio.'
      if (value.length > 30) return 'Maximo de 30 caracteres.'
      return ''
    case 'commander':
      if (value && value.length > 40) return 'Maximo de 40 caracteres.'
      return ''
    case 'link':
      if (!value) return 'O link e obrigatorio.'
      if (value.length > 120) return 'Maximo de 120 caracteres.'
      if (!isSupportedDeckLink(value)) return 'O link deve ser do LigaMagic ou do Moxfield.'
      return ''
    default:
      return ''
  }
}

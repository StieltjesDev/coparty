const SUPPORTED_DECK_HOSTS = ['ligamagic.com.br', 'www.ligamagic.com.br', 'moxfield.com', 'www.moxfield.com']

export function isSupportedDeckLink(link) {
  try {
    const url = new URL(link)
    if (!SUPPORTED_DECK_HOSTS.includes(url.hostname)) {
      return false
    }

    if (url.hostname.includes('moxfield.com')) {
      return url.pathname.startsWith('/decks/')
    }

    return url.searchParams.get('view') === 'dks/deck' && url.searchParams.has('id')
  } catch {
    return false
  }
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
      if (!value) return ''
      if (value.length > 500) return 'Maximo de 500 caracteres.'
      if (!isSupportedDeckLink(value)) return 'O link deve ser um deck da LigaMagic ou do Moxfield.'
      return ''
    default:
      return ''
  }
}

export const EVENT_GAME_MODE_OPTIONS = [
  { label: 'Duelo 1x1', value: 'ONE_VS_ONE' },
  { label: 'Commander Multiplayer', value: 'COMMANDER_MULTIPLAYER' },
]

export const EVENT_PAIRING_OPTIONS = [
  { label: 'Suico', value: 'SWISS' },
  { label: 'Pod', value: 'POD' },
  { label: 'Todos contra todos', value: 'ROUND_ROBIN' },
  { label: 'Eliminacao simples', value: 'SINGLE_ELIMINATION' },
  { label: 'Eliminacao dupla', value: 'DOUBLE_ELIMINATION' },
]

export const EVENT_PAIRING_OPTIONS_BY_GAME_MODE = {
  ONE_VS_ONE: ['SWISS', 'ROUND_ROBIN', 'SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'POD'],
  COMMANDER_MULTIPLAYER: ['SWISS'],
  TWO_HEADED_GIANT: ['SWISS'],
  TWO_VS_TWO: ['SWISS'],
  MULTIPLAYER_FREE_FOR_ALL: ['SWISS'],
}

export const DEFAULT_PAIRING_BY_GAME_MODE = Object.fromEntries(
  Object.entries(EVENT_PAIRING_OPTIONS_BY_GAME_MODE).map(([gameMode, options]) => [gameMode, options[0]]),
)

export const EVENT_STATUS_LABELS = {
  SCHEDULED: 'Agendado',
  ONGOING: 'Em andamento',
  FINISHED: 'Finalizado',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

export const EVENT_GAME_MODE_LABELS = {
  ONE_VS_ONE: 'Duelo 1x1',
  COMMANDER_MULTIPLAYER: 'Commander Multiplayer',
}

export const EVENT_PAIRING_LABELS = {
  SWISS: 'Suico',
  POD: 'Pod',
  ROUND_ROBIN: 'Todos contra todos',
  SINGLE_ELIMINATION: 'Eliminacao simples',
  DOUBLE_ELIMINATION: 'Eliminacao dupla',
}

export const DECK_FORMAT_OPTIONS = [
  { label: 'Standard', value: 'STANDARD' },
  { label: 'Modern', value: 'MODERN' },
  { label: 'Pioneer', value: 'PIONEER' },
  { label: 'Legacy', value: 'LEGACY' },
  { label: 'Vintage', value: 'VINTAGE' },
  { label: 'Pauper', value: 'PAUPER' },
  { label: 'Brawl', value: 'BRAWL' },
  { label: 'Historic', value: 'HISTORIC' },
  { label: 'Commander', value: 'COMMANDER' },
  { label: 'Commander Duel', value: 'COMMANDER_DUEL' },
  { label: 'Commander 500', value: 'COMMANDER_500' },
  { label: 'Commander 250', value: 'COMMANDER_250' },
  { label: 'Commander 15', value: 'COMMANDER_15' },
  { label: 'Custom', value: 'CUSTOM' },
]

export const DECK_FORMAT_LABELS = Object.fromEntries(
  DECK_FORMAT_OPTIONS.map((option) => [option.value, option.label]),
)

export const MATCH_STATUS_OPTIONS = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Em andamento', value: 'ONGOING' },
  { label: 'Concluida', value: 'COMPLETED' },
  { label: 'Cancelada', value: 'CANCELLED' },
]

export const EVENT_ENTRY_STATUS_LABELS = {
  REGISTERED: 'Inscrito',
  CHECKED_IN: 'Confirmado',
  DROPPED: 'Dropado',
  DISQUALIFIED: 'Desclassificado',
}


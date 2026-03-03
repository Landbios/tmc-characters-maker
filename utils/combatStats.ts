import { Rank } from '@/types/character';

export const RANKS: Rank[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

export const COMBAT_STATS_INFO = {
  offensive_power: {
    label: 'Poder Ofensivo',
    description: 'Determina el daño que tu Devices hace por defecto en el caso de que lo uses para atacar a un oponente. Tambien este stat afecta al daño que hacen tus magias ofensivas o Artes Nobles en añadido a la cantidad de Maná que hayas empleado para esto. Aquí suelen incluirse disparos, recubrimientos que hacen daño, el daño de las invocaciones y el daño base del Blaze.',
    values: {
      S: '+21%',
      A: '+18%',
      B: '+15%',
      C: '+12%',
      D: '+9%',
      E: '+6%',
      F: '+3%',
    }
  },
  defensive_power: {
    label: 'Poder Defensivo',
    description: 'Para el caso de las habilidades defensivas o algunas de soporte, el Poder Defensivo determina, junto con la cantidad de maná que hayas empleado, la efectividad de los mismos. Aunque las barreras y escudos se incluyen aquí, también es con esto con que se determina la vida de las invocaciones.',
    values: {
      S: 'Magias Defensivas: +28% | Vida Máxima: +40%',
      A: 'Magias Defensivas: +24% | Vida Máxima: +35%',
      B: 'Magias Defensivas: +20% | Vida Máxima: +30%',
      C: 'Magias Defensivas: +16% | Vida Máxima: +25%',
      D: 'Magias Defensivas: +12% | Vida Máxima: +20%',
      E: 'Magias Defensivas: +8% | Vida Máxima: +15%',
      F: 'Magias Defensivas: +4% | Vida Máxima: +10%',
    }
  },
  mana_amount: {
    label: 'Cantidad de Maná',
    description: 'Este Stat determinara con cuanto maná máximo cuentas durante los combates u otras actividades relacionadas a la magia. Se ha de entender que aunque puedas recuperar maná mediante diferentes métodos, no puedes tener mas maná de lo que dicta tu estadística.',
    values: {
      S: 'Max: 110% | Regen: 28%', // Extrapolated S regen based on pattern
      A: 'Max: 100% | Regen: 24%',
      B: 'Max: 90% | Regen: 20%',
      C: 'Max: 80% | Regen: 16%',
      D: 'Max: 70% | Regen: 12%',
      E: 'Max: 60% | Regen: 8%',
      F: 'Max: 50% | Regen: 4%',
    }
  },
  mana_control: {
    label: 'Control de Mana',
    description: 'Se entiende como la capacidad de controlar el maná y determina la resistencia del Devices frente al daño, sea mágico o no mágico. En el caso de que se use el Devices para desviar o defenderse, este puede romperse si el daño que fueses a recibir en ese instante supera el porcentaje explicado mas abajo, y de ocurrir quedaras automáticamente inconsciente.',
    values: {
      S: 'Resistencia: 150%',
      A: 'Resistencia: 130%',
      B: 'Resistencia: 110%',
      C: 'Resistencia: 90%',
      D: 'Resistencia: 70%',
      E: 'Resistencia: 50%',
      F: 'Resistencia: 30%',
    }
  },
  physical_ability: {
    label: 'Habilidad Física',
    description: 'La Habilidad fisica va a determinar hasta con cuanta fuerza bruta vas a poder contar en general. Por un lado está la capacidad de carga (Medida en Kilogramos), la cual se divide en carga normal (los primeros números) que indica el peso que puedes llevar sin problemas, mientras que la carga limite (el segundo numero) es el valor de peso que puedes llevar con esfuerzo. Tambien se encuentra el valor de daño (medido en %) que puedes realizar mediante ataques físicos. Tambien la Habilidad Fisica determina la Vida Base que tiene cada Blazer.',
    values: {
      S: 'Carga: 120kg/240kg | Daño: 14% | Vida Base: 210%',
      A: 'Carga: 90kg/180kg | Daño: 12% | Vida Base: 195%',
      B: 'Carga: 75kg/150kg | Daño: 10% | Vida Base: 180%',
      C: 'Carga: 60kg/120kg | Daño: 8% | Vida Base: 145%',
      D: 'Carga: 45kg/90kg | Daño: 6% | Vida Base: 130%',
      E: 'Carga: 30kg/60kg | Daño: 4% | Vida Base: 115%',
      F: 'Carga: 15kg/30kg | Daño: 2% | Vida Base: 100%',
    }
  },
  luck: {
    label: 'Suerte',
    description: 'Aunque no se vea relevante a primera vista, el Valor de Suerte determina la cantidad de veces en las que puedes aplicar algo llamado “Tiros de Suerte”, que te permiten re tirar los dados en tu turno de nuevo para obtener mejores resultados. Hay que saber que estos valores son las veces en los que puedes tirar de nuevo durante todo el evento.',
    values: {
      S: '7 veces',
      A: '6 veces',
      B: '5 veces',
      C: '4 veces',
      D: '3 veces',
      E: '2 veces',
      F: '1 vez',
    }
  }
};

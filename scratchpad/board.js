const {orderBy} = require('lodash')

// mock feed
const feed = [
  { et: 82.6, name: "Matty(0)", lap: 0, point: 1 },
  { et: 83.4, name: "Ayrton Senna(82)", lap: 0, point: 1 },
  { et: 84.1, name: "Damon Hill(84)", lap: 0, point: 1 },
  { et: 85.6, name: "Michael Schumacher(86)", lap: 0, point: 1 },
  { et: 86.2, name: "Michael Andretti(83)", lap: 0, point: 1 },
  { et: 87.4, name: "Rubens Barrichello(88)", lap: 0, point: 1 },
  { et: 87.5, name: "Peter(6)", lap: 0, point: 1 },
  { et: 87.9, name: "Chris Plumridge(4)", lap: 0, point: 1 },
  { et: 88.0, name: "Mark Blundell(87)", lap: 0, point: 1 },
  { et: 88.3, name: "Erik Comas(89)", lap: 0, point: 1 },
  { et: 88.7, name: "Ukyo Katayama(85)", lap: 0, point: 1 },
  { et: 88.9, name: "Johnny Herbert(91)", lap: 0, point: 1 },
  { et: 91.4, name: "Chops(5)", lap: 0, point: 1 },
  { et: 129.5, name: "Derek Warwick(90)", lap: 0, point: 1 },


  { et: 134.5, name: "Ayrton Senna(82)", lap: 0, point: 2 },
  { et: 136.0, name: "Matty(0)", lap: 0, point: 2 },
  { et: 136.1, name: "Damon Hill(84)", lap: 0, point: 2 },
  { et: 136.1, name: "Michael Schumacher(86)", lap: 0, point: 2 },
  { et: 136.3, name: "Peter(6)", lap: 0, point: 2 },
  { et: 137.7, name: "Michael Andretti(83)", lap: 0, point: 2 },
  { et: 137.8, name: "Chris Plumridge(4)", lap: 0, point: 2 },
  { et: 139.1, name: "Rubens Barrichello(88)", lap: 0, point: 2 },
  { et: 141.4, name: "Mark Blundell(87)", lap: 0, point: 2 },
  { et: 142.6, name: "Chops(5)", lap: 0, point: 2 },
  { et: 143.0, name: "Johnny Herbert(91)", lap: 0, point: 2 },
  { et: 143.2, name: "Ukyo Katayama(85)", lap: 0, point: 2 },
  { et: 143.3, name: "Erik Comas(89)", lap: 0, point: 2 },
  { et: 180.7, name: "Derek Warwick(90)", lap: 0, point: 2 },
]

// driver names in pos
// set so we can update once and then do a sort
let leaderboard = new Set()

const positions = {}

// ms into race
const startTimeOffset = 81000

// elapsed time
let timer = 0 + startTimeOffset

// interval b/w updates
const increment = 100

// when to stop
const runForSeconds = 100
const timerLimit = startTimeOffset + (runForSeconds * 1000)

const onUpdateBoard = (et) => {
  if (et >= timerLimit) {
    return removeTickCycle()
  }

  const timeInSeconds = et / 1000

  // console.info(timeInSeconds)

  // incase drivers are have same timing data
  const driversToUpdate = feed.filter(update => update.et == timeInSeconds)

  if (driversToUpdate.length) {
    const boardBeforeUpdate = Object.values(positions)
    driversToUpdate.forEach(update => positions[update.name] =  update )

    const sortedBySectors = orderBy(Object.values(positions), ['lap', 'point', 'et'], ['desc', 'desc', 'asc']).flat()

    const display = sortedBySectors.map((driver, index) => {
      // const positionDelta = boardBeforeUpdate
      return `${index+1}: ${driver.name}`
    })

    console.clear()
    // console.log(positions) // for debug
    console.log(sortedBySectors)
  }
}

const removeTickCycle = () => {
  console.log('killing tickCycle')
  clearInterval(tickCycle)
}

const tickCycle = setInterval(() => {
  timer += increment

  onUpdateBoard(timer)
}, increment);




const puppeteer = require('puppeteer')
const args = process.argv.slice(2)

const getParticipant = async (page, selector, name) => {
  await page.waitForSelector(selector)
  const participants = await page.$$(selector)
  let selectedParticipant
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i]
    const text = await page.evaluate(element => element.textContent.trim(), participant)
    if (text.includes(name)) {
      selectedParticipant = participant
    }
  }
  return selectedParticipant
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const vote = async (page, index, participantName) => {
  let participant
  if (index === 0) {
    participant = await getParticipant(page, '.voting-card__name', participantName)
    if (!participant) {
      console.error('Participant not found')
      process.exit(0)
    }
  
    await page.waitForSelector('.voting-card__name')
    await participant.click()
  }

  participant =await getParticipant(page, '.card-secondary__name', participantName)
  if (!participant) {
    console.error('Participant not found')
    process.exit(0)
  }
  await page.waitForSelector('.card-secondary__name')
  await participant.click()

  await page.waitForSelector('.voting-button')
  await page.click('.voting-button')

  await page.waitForSelector('.vote-confirmation__button')
  await page.click('.vote-confirmation__button')
}

const init = async (participantName, amountOfVotes = 50) => {
  try {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
  
    page.setCacheEnabled(false)
  
    await page.goto('https://afazenda.r7.com/a-fazenda-12/votacao')

    for (let i = 0; i < parseInt(amountOfVotes); i++) {
      await vote(page, i, participantName)
      await sleep(1000)
    }

    process.exit(0)
    
  } catch (err) {
    console.error('Error voting %o', err)
  }
}

if (!args.length) {
  console.error('It\'s needed to pass the participant name')
  console.error('Example: node index.js --participant-name=Raissa --amount-of-votes=50')
  process.exit(0)
}

if (!args[0].includes('--participant-name=')) {
  console.error('It\'s needed to pass the participant name')
  process.exit(0)
}


const participantName = args[0].replace('--participant-name=', '')
const amountOfVotes = args[1]
  ? args[1].replace('--amount-of-votes=', '')
  : 50

init(participantName, amountOfVotes)
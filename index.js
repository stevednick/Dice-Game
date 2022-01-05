const sideStartingCost = 100;
const sidePriceInreasePower = 2;
const adderStartingCost = 120;
const adderPriceIncrease = 1;
const multiplierStartingCost = 70;
const multiplierPriceIncrease = 0.2;
const powerStartingCost = 20;
const powerPriceIncrease = 0.15;
const stealStartingCost = 150;
const stealPriceIncrease = 1.3;
const stealValue = 1;
const levelMultiplier = 1.1;
const multiplierValue = 0.1;
const powerValue = 0.01;
const purchasesPriceIncrease = 0.1;
var currentWinnings = 10;
var currentGo = 0;

function player() {
  this.cash = 0;
  this.adderLevel = 0;
  this.multiplierLevel = 0;
  this.powerLevel = 0;
  this.stealLevel = 0;
  this.purchasesMade = 0;
  this.sidesRemoved = 0;
}

$(".roll-button").click(function(event) {
  animateDice();
});

$(".button").click(function(event) {
  var side = ($(event.target).hasClass('left-b') ? 0 : 1);
  var upgrade = 0;
  if ($(event.target).hasClass('multiplier')) {
    upgrade = 1;
  } else if ($(event.target).hasClass('steal')) {
    upgrade = 2;
  } else if ($(event.target).hasClass('power')) {
    upgrade = 3;
  } else if ($(event.target).hasClass('sides')) {
    upgrade = 4;
  }
  buyUpgrade(side, upgrade);
});

function buyUpgrade(side, upgrade) {
  var upgradeCost = getPrice(side, upgrade);
  if (!checkIfCanAfford(side, upgradeCost)) return;
  players[side].cash -= upgradeCost;
  switch (upgrade) {
    case 0:
      players[side].adderLevel += 1;
      break;
    case 1:
      players[side].multiplierLevel += 1;
      break;
    case 2:
      players[side].stealLevel += 1;
      break;
    case 3:
      players[side].powerLevel += 1;
      break;
    case 4:
      players[side].sidesRemoved += 1; // limit No. sides
      break;
    default:
  }
  players[side].purchasesMade += 1;
  displayLevels();

  function checkIfCanAfford(side, amount) {
    return players[side].cash >= amount;
  }
}

var players = [new player(), new player()];
displayLevels();

function animateDice() {
  var scores = [0, 0];
  var interval = setInterval(function() {
    scores = [showRandomDice(0), showRandomDice(1)];
  }, 130);
  setTimeout(function() {
    clearInterval(interval);
    calculateAndDisplayScores(scores);
  }, 1200);
}


function showRandomDice(side) {
  var sideName = (side ? ".right" : ".left");
  $(sideName).addClass('invisible');
  var randomNumber = Math.floor(Math.random() * (9 - players[side].sidesRemoved)) + players[side].sidesRemoved;
  var faces = [".first-face", ".second-face", ".third-face", ".fourth-face", ".fifth-face", ".sixth-face", ".seventh-face", ".eighth-face", ".ninth-face"];
  $(sideName + faces[randomNumber]).removeClass('invisible');
  return randomNumber + 1;
}

function calculateAndDisplayScores(results) {
  $(".calculation-column > h3").addClass('invisible');
  var sides = [".left-c-c", ".right-c-c"];
  var totals = [0, 0]
  for (i = 0; i < 2; i++) {
    var resultAfterAddition = results[i] + players[i].adderLevel;
    var resultAfterMultiplication = resultAfterAddition * (1 + players[i].multiplierLevel * multiplierValue);
    totals[i] = Math.pow(resultAfterMultiplication, 1 + players[i].powerLevel * powerValue);
    $(sides[i] + " > .line1").text(results[i]);
    $(sides[i] + " > .line2").text("+" + players[i].adderLevel);
    $(sides[i] + " > .line3").text(resultAfterAddition);
    $(sides[i] + " > .line4").text("x" + (1 + players[i].multiplierLevel * multiplierValue).toFixed(1));
    $(sides[i] + " > .line5").text(resultAfterMultiplication.toFixed(2));
    $(sides[i] + " > .line6").text("**" + (1 + players[i].powerLevel * powerValue).toFixed(2));
    $(sides[i] + " > .line7").text("Total: " + totals[i].toFixed(2));
  }
  var winnings = [0, 0];
  var stealAmount = 0;
  $(".line8").text("");
  $(".line9").text("");

  if (totals[0] > totals[1]) {
    stealAmount = (totals[0] - totals[1]) * players[0].stealLevel * stealValue;
    winnings = [stealAmount + (currentWinnings * getMultiplier(currentGo)), -stealAmount];
    $(sides[0] + " > .line8").text("Winnings: $" + (currentWinnings * getMultiplier(currentGo)).toFixed(2));
    if (stealAmount > 0) $(sides[0] + " > .line9").text("Steal: $" + stealAmount.toFixed(2));
  } else if (totals[1] > totals[0]) {
    stealAmount = (totals[1] - totals[0]) * players[1].stealLevel * stealValue;
    winnings = [-stealAmount, stealAmount + (currentWinnings * getMultiplier(currentGo))];
    $(sides[1] + " > .line8").text("Winnings: $" + (currentWinnings * getMultiplier(currentGo)).toFixed(2));
    if (stealAmount > 0) $(sides[1] + " > .line9").text("Steal: $" + stealAmount.toFixed(2));
  } else {
    $(".line8").text("Draw");
  }

  currentGo += 1;
  for (i = 0; i < 9; i++) {
    var currentLine = 1;
    setTimeout(function() {
      if (currentLine == 9) {
        applyScores(winnings);

      }
      var lineName = ".line" + currentLine;
      $(lineName).removeClass('invisible');
      currentLine++;
    }, 300 * i);
  }
}

function applyScores(winnings) {
  players[0].cash += winnings[0];
  players[1].cash += winnings[1];
  displayLevels();
  if(checkIfPlayerInDebt()){
    $(".game-over-text").text("Game Over!");
    controlFireworks(true);
  }
}

function displayLevels() {
  for (i = 0; i < 2; i++) {
    var column = (i ? ".right-column" : ".left-column");
    $(column + ">.sides").text("Removed: " + players[i].sidesRemoved + " ($" + getPrice(i, 4).toFixed(2) + ")");
    $(column + ">.cash-text").text("$" + players[i].cash.toFixed(2));
    $(column + ">.adder").text("+" + players[i].adderLevel + " ($" + getPrice(i, 0).toFixed(2) + ")");
    $(column + ">.multiplier").text("x" + (1 + players[i].multiplierLevel * multiplierValue).toFixed(1) + " ($" + getPrice(i, 1).toFixed(2) + ")");
    $(column + ">.power").text("**" + (1 + players[i].powerLevel * powerValue).toFixed(2) + " ($" + getPrice(i, 3).toFixed(2) + ")");
    $(column + ">.steal").text("Steal: $" + (players[i].stealLevel * stealValue) + " ($" + getPrice(i, 2).toFixed(2) + ")");
  }
}

function getMultiplier(level) {
  return Math.pow(levelMultiplier, level);
}

function getPrice(side, upgrade){
  if (upgrade == 4){
    return sideStartingCost * Math.pow(sidePriceInreasePower, players[side].sidesRemoved) * (1+(purchasesPriceIncrease*players[side].purchasesMade));
  }
  var upgrades = [players[side].adderLevel, players[side].multiplierLevel, players[side].stealLevel, players[side].powerLevel];
  var basicPrices = [adderStartingCost, multiplierStartingCost, stealStartingCost, powerStartingCost];
  var priceIncreases = [adderPriceIncrease, multiplierPriceIncrease, stealPriceIncrease, powerPriceIncrease];
  return basicPrices[upgrade] * (1 + (priceIncreases[upgrade] * upgrades[upgrade])) * (1+(purchasesPriceIncrease*players[side].purchasesMade));
}

function checkIfPlayerInDebt(){
  if (players[0].cash < 0 || players[1].cash < 0) return true;
  return false;
}

function controlFireworks(on){
  if (!on){
    $(".pyro").addClass('invisible');
    return;
  }
  $(".pyro").removeClass('invisible');
}

controlFireworks(false);
showRandomDice(0);
showRandomDice(1);

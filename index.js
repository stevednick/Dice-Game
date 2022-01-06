var sideStartingCost = 100; //Cost to remove low numbers
var sidePriceInreasePower = 2;
var adderStartingCost = 120;
var adderPriceIncrease = 1;
var multiplierStartingCost = 70;
var multiplierPriceIncrease = 0.2;
var powerStartingCost = 20;
var powerPriceIncrease = 0.15;
var stealStartingCost = 150;
var stealPriceIncrease = 1.3;
var stealValue = 1;
var levelMultiplier = 1.1;
var multiplierValue = 0.1;
var powerValue = 0.01;
var purchasesPriceIncrease = 0.1;
var startingWinnings = 20; 
// var currentGo = 0;
var winningsIncreasePower = 1.2; // Winnings *= 1.2 to the power of players[side].winningsLevel
var winningsStartingCost = 10; // Initial cost.
var winningsPriceIncrease = 0.2;

// Winnings upgrades?

var players = [new player(), new player()];
displayLevels();

controlFireworks(false);
showRandomDice(0);
showRandomDice(1);

function player() {
  this.cash = 0;
  this.adderLevel = 0;
  this.multiplierLevel = 0;
  this.powerLevel = 0;
  this.stealLevel = 0;
  this.purchasesMade = 0;
  this.sidesRemoved = 0;
  this.winningsLevel = 0;
}

$(".roll-button").click(function(event) {
  animateDice();
});

$(".text-column > .btn").click(function(event) {
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
  } else if ($(event.target).hasClass('winnings')) {
    upgrade = 5;
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
    case 5:
      players[side].winningsLevel += 1; // limit No. sides
      console.log("got");
      break;
    default:
  }
  players[side].purchasesMade += 1;
  displayLevels();

  function checkIfCanAfford(side, amount) {
    return players[side].cash >= amount;
  }
}



function animateDice() {
  var scores = [0, 0];
  var interval = setInterval(function() {
    scores = [showRandomDice(0), showRandomDice(1)];
  }, 80);
  setTimeout(function() {
    clearInterval(interval);
    calculateAndDisplayScores(scores);
  }, 1000);
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
    winnings = [stealAmount + getWinnings(0), -stealAmount];
    $(sides[0] + " > .line8").text("Winnings: $" + getWinnings(0).toFixed(2));
    if (stealAmount > 0) $(sides[0] + " > .line9").text("Steal: $" + stealAmount.toFixed(2));
  } else if (totals[1] > totals[0]) {
    stealAmount = (totals[1] - totals[0]) * players[1].stealLevel * stealValue;
    winnings = [-stealAmount, stealAmount + getWinnings(1)];
    $(sides[1] + " > .line8").text("Winnings: $" + getWinnings(1).toFixed(2));
    if (stealAmount > 0) $(sides[1] + " > .line9").text("Steal: $" + stealAmount.toFixed(2));
  } else {
    $(".line8").text("Draw");
  }

  // currentGo += 1;
  for (i = 0; i < 9; i++) {
    var currentLine = 1;
    setTimeout(function() {
      if (currentLine == 9) {
        applyScores(winnings);

      }
      var lineName = ".line" + currentLine;
      $(lineName).removeClass('invisible');
      currentLine++;
    }, 200 * i);
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
    $(column + ">.winnings").text("Win: $" + getWinnings(i).toFixed(2) + " ($" + getPrice(i, 5).toFixed(2) + ")");
    $(column + ">.sides").text("Removed: " + players[i].sidesRemoved + " ($" + getPrice(i, 4).toFixed(2) + ")");
    $(column + ">.cash-text").text("$" + players[i].cash.toFixed(2));
    $(column + ">.adder").text("+" + players[i].adderLevel + " ($" + getPrice(i, 0).toFixed(2) + ")");
    $(column + ">.multiplier").text("x" + (1 + players[i].multiplierLevel * multiplierValue).toFixed(1) + " ($" + getPrice(i, 1).toFixed(2) + ")");
    $(column + ">.power").text("**" + (1 + players[i].powerLevel * powerValue).toFixed(2) + " ($" + getPrice(i, 3).toFixed(2) + ")");
    $(column + ">.steal").text("Steal: $" + (players[i].stealLevel * stealValue) + " ($" + getPrice(i, 2).toFixed(2) + ")");
  }
  powerDownButtons();
}

function getWinnings(side){
  return startingWinnings * Math.pow(winningsIncreasePower, players[side].winningsLevel);
}

function powerDownButtons(){
  var columns = [".left-column", ".right-column"];
  var buttonTypes = [">.adder", ">.multiplier", ">.steal", ">.power", ">.sides", ">.winnings"];
  for (i = 0; i<2; i++){
    for (t = 0; t < 6; t++){
      if (players[i].cash >= getPrice(i, t)){
        $(columns[i] + buttonTypes[t]).removeClass('powered-down');
      } else {
        $(columns[i] + buttonTypes[t]).addClass('powered-down');
      }
    }
  }
}

function getMultiplier(level) {
  return Math.pow(levelMultiplier, level);
}

function getPrice(side, upgrade){
  if (upgrade == 4){
    return sideStartingCost * Math.pow(sidePriceInreasePower, players[side].sidesRemoved) * (1+(purchasesPriceIncrease*players[side].purchasesMade));
  } else if (upgrade == 5){
    return winningsStartingCost * (1 + winningsPriceIncrease * players[side].winningsLevel) * (1+(purchasesPriceIncrease*players[side].purchasesMade));
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

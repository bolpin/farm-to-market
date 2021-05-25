// New features(?):
// Weather
// Seasons
// Watering
// Fertilizer
// Save Game
// Buy other things with gold (e.g. more farm plots, tools, fertilizer)
// Keep a record of crops taken to market
// Set a garden "goal" e.g. a row of corn, two rows of strawberries
// Achievement screen
// Better messaging: e.g. You don't have enough gold to buy that.
//
// Features to remove and then add with class:
// Inventory size
// Farm size
// Add new seed types
// Add stages (sprout2, sprout, etc.)

// TODO:
// Make gameLoop framework...?


const cropImagePath = "images/48x48/"
const millisecondsPerSecond = 1000;
const millisecondsPerMinute = 60000;


function clone(instance) {
  return Object.assign(
    Object.create(
      // Clone the functionality
      Object.getPrototypeOf(instance),
    ),
    // Deep copy of attributes
    JSON.parse(JSON.stringify(instance)),
  );
}

class Item {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.id = generateId();
  }
  getName() {
    return this.name;
  }
}

class Seed extends Item {
  constructor(params) {
    super(params.name, params.type);
    this.state = "seed"; // seed | planted | sprout | sprout2 | sprout3 | sprout4 | ripe
    this.seedImage = cropImagePath + params.name + "0.png";
    this.sproutImage = cropImagePath + params.name + "1.png";
    // this.sprout2Image = cropImagePath + params.name + "2.png";
    // this.sprout3Image = cropImagePath + params.name + "3.png";
    // this.sprout4Image = cropImagePath + params.name + "4.png";
    this.ripeImage = cropImagePath + params.name + "5.png";
    this.buyPrice = params.buyPrice;
    this.sellPrice = params.sellPrice;
    this.timeSpanToSprout = params.timeSpanToSprout;
    this.timeSpanFromSproutToRipe = params.timeSpanFromSproutToRipe;
    this.quantity = 1;
    this.timePlanted = null;
  }

  totalTimeToRipen() {
    return this.timeSpanToSprout + this.timeSpanFromSproutToRipe;
  }

  getName() {
    if (this.type === "seed") {
      switch(this.state) {
        case "seed":
          return this.name + " seed";
        case "sprout":
          return this.name + " sprout";
      }
    }

    return this.name;
  }


}

function currentImage(item) {
  switch(item.state) {
    case "ripe":
      return item.ripeImage;
    case "sprout":
      return item.sproutImage;
    // case "sprout2":
    //   return item.sprout2Image;
    // case "sprout3":
    //   return item.sprout3Image;
    // case "sprout4":
    //   return item.sprout4Image;
    default:
      return item.seedImage;
  }
};

function getName(item) {
  if (item.type === "seed") {
    switch(item.state) {
      case "seed":
        return item.name + " seed";
      case "sprout":
        return item.name + " sprout";
    }
  }
  return item.name;
};


function timeUntilRipe(seed) {
  const now = new Date().getTime();
  const ripeTime = seed.timePlanted.getTime() +
    (millisecondsPerMinute * (seed.timeSpanToSprout + seed.timeSpanFromSproutToRipe));

  // console.log(seed.id + " " + seed.name + " TimePlanted: " +
  // seed.timePlanted +  " RipeTime: " + ripeTime);

  if (now < ripeTime) {
    let secs = (ripeTime - now) / millisecondsPerSecond;
    if (secs < 60) {
      return Math.trunc(secs) + " seconds";
    } else {
      return 1 + Math.trunc(secs / 60) + " minutes";
    }
  } else {
    return "0 seconds"
  }
};

function generateId() {
  return Math.random().toString(36).substring(2);
}

function dragstartHandler(evnt) {
  console.log("dragstart");
  console.log("evnt.target.id = " + evnt.target.id);
  evnt.dataTransfer.setData("text/plain", evnt.target.id);
  evnt.dataTransfer.dropEffect = "move";
  view.disableTooltip(evnt.target.parentNode.parentNode);
}

function dragoverHandler(evnt) {
  evnt.preventDefault();
  evnt.dataTransfer.dropEffect = "move";
}

function marketDropHandler(evnt) {
  // evnt.preventDefault();
  let itemId = evnt.dataTransfer.getData("text/plain");

  if (evnt.target instanceof HTMLTableCellElement) {
    cellId = evnt.target.id;
  } else {
    cellId = evnt.target.parentNode.id;
  }
  dropItemOnMarket(cellId, itemId);
}

function fieldDropHandler(evnt) {
  console.log("in fieldDropHandler");
  evnt.preventDefault();
  let itemId = evnt.dataTransfer.getData("text/plain");

  if (evnt.target instanceof HTMLTableCellElement) {
    cellId = evnt.target.id;
  } else {
    cellId = evnt.target.parentNode.id;
  }
  console.log("cellId, itemId = " + cellId + ", " + itemId);
  dropItemOnPlot(cellId, itemId);
}

function suppliesSelectionHandler(evnt) {
  console.log("in suppliesSelectionHandler");
  console.log("this.id = " + this.id);
  console.log("this.parentElement.nodeName = " + this.parentElement.nodeName);

  if (view.isSelected(this)) {
    view.deselect(this);
  } else {
    view.select(this);
  }
}

function buyButtonHandler() {
  console.log("in buyButtonHandler");
  if (model.cellIdOfSelectedItem) {
    model.buyItem();
  }
}

function appendMultilineText(element, messages) {
  messages.forEach(function(message) {
    element.appendChild(document.createTextNode(message));
    element.appendChild(document.createElement("br"));
  });
}

function dropItemOnMarket(cellId, itemId) {
  const item = model.getItemById(itemId);

  if (item.type === "seed" &&
    (item.state === "ripe" || item.state === "seed")) {
    console.log("Sell seed");
    model.sellItem(item);
  }
}

function dropItemOnPlot(plotId, itemId) {
  let item = model.getItemById(itemId);
  if (item.type === "seed") {
    model.plantSeed(plotId, itemId);
  }
}

const nothing = {
  name: "nothing",
  id: "0"
};

function setupSeeds() {
  let seeds = [];

  let seedAttributes = {
    name: "Wheat",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 0.5,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Corn",
    type: "seed",
    timeSpanToSprout: 1,
    timeSpanFromSproutToRipe: 4,
    buyPrice: 3,
    sellPrice: 6
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Orange",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Strawberry",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Sunflower",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Coffee",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Lemon",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Pineapple",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Rice",
    type: "seed",
    timeSpanToSprout: 0.1,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 2
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Eggplant",
    type: "seed",
    timeSpanToSprout: 1,
    timeSpanFromSproutToRipe: 0.2,
    buyPrice: 5,
    sellPrice: 10
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Avocado",
    type: "seed",
    timeSpanToSprout: 2,
    timeSpanFromSproutToRipe: 10,
    buyPrice: 4,
    sellPrice: 1
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Rose",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 5,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Potato",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Coffee",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Tulip",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Orange",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Grapes",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Tomato",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Cucumber",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 1,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  seedAttributes = {
    name: "Turnip",
    type: "seed",
    timeSpanToSprout: 0.2,
    timeSpanFromSproutToRipe: 4,
    buyPrice: 1,
    sellPrice: 100
  };
  seeds.push(new Seed(seedAttributes));

  return seeds;
}

function setupGame() {
  model.setupInventory();
  model.setupSupplies();
  view.setupMarket();
  model.setupField();
  view.updateGoldDisplay(model.gold);
  setupEventHandlers();
}

function setupEventHandlers() {
  let button = document.getElementById("buyButton");
  button.onclick = buyButtonHandler;

  button = document.getElementById("helpButton");
  let modal = document.getElementById("helpModal");
  button.onclick = function() {
    modal.style.display = "block";
  }

  let close = document.getElementById("modalClose");
  close.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  }
}

function checkForGrowth() {
  // console.log("in checkForGrowth");
  const now = new Date().getTime();

  model.field.forEach(function(plot) {
    if (plot.name !== "nothing") {
      const sproutTime = plot.timePlanted.getTime() +
        plot.timeSpanToSprout * millisecondsPerMinute;
      const ripeTime = sproutTime +
        plot.timeSpanFromSproutToRipe * millisecondsPerMinute;
      const numSproutStages = 4;
      const sproutStageTimeSpan = (ripeTime - sproutTime)/numSproutStages;
      // const sprout2Time = sproutTime + 1 * sproutStageTimeSpan;
      // const sprout3Time = sproutTime + 2 * sproutStageTimeSpan;
      // const sprout4Time = sproutTime + 3 * sproutStageTimeSpan;

      if (now > sproutTime) {
        if (plot.state === "planted") {
          console.log("time to sprout");
          plot.state = "sprout";
        } else if (plot.state === "sprout" && now > ripeTime) {
        // } else if (plot.state === "sprout" && now > sprout2Time) {
        //   plot.state = "sprout2";
        // } else if (plot.state === "sprout2" && now > sprout3Time) {
        //   plot.state = "sprout3";
        // } else if (plot.state === "sprout3" && now > sprout4Time) {
        //   plot.state = "sprout4";
        // } else if (plot.state === "sprout4" && now > ripeTime) {
          console.log("ripe!");
          plot.state = "ripe";
        }
      }
    }
  });
}


let model = {
  gold: 10,
  seeds: setupSeeds(),
  inventory: undefined,
  field: undefined,
  supplies: undefined,
  cellIdOfSelectedItem: undefined,

  setupField: function() {
    model.field = new Array(model.fieldSize());

    model.field.fill(nothing);

    view.updateField();
  },

  fieldSize: function() {
    const fieldTable = document.getElementById("field");
    return fieldTable.getElementsByTagName('td').length
  },

  fieldGetItemById: function(id) {
    return model.field.find(item => item.id === id);
  },

  removeFieldItem: function(id) {
    for (let i = 0; i < model.field.length; i++) {
      if (model.field[i].id === id) {
        model.field[i] = nothing;
        break;
      }
    }
  },

  inventorySize: function() {
    const invTable = document.getElementById("inventory");
    return invTable.getElementsByTagName('td').length
  },

  setupInventory: function() {
    model.inventory = new Array(model.inventorySize());
    model.inventory.fill(nothing);

    if (model.inventory.length < 2) {
      return;
    }

    model.inventory[0] = clone(model.seeds[0]);
    model.inventory[1] = clone(model.seeds[1]);

    view.updateInventory(model.inventory);
  },

  inventoryGetItemById: function(id) {
    return model.inventory.find(item => item.id === id)
  },

  inventoryGetItemByName: function(name) {
    return model.inventory.find(item => item.name === name)
  },

  inventoryGetTypeById: function(id) {
    const item = model.inventory.find(item => item.id === id);

    if (item) {
      return item.type;
    }
  },

  inventoryAlreadyHasItem: function(name) {
    return model.inventory.some(item => item.name === name);
  },

  inventoryHasAvailableSpace: function() {
    return model.inventory.some(item => item.name === "nothing")
  },

  addItemToInventory: function(item) {
    if (model.inventoryAlreadyHasItem(item.name)) {
      const inventoryItem = model.inventoryGetItemByName(item.name);
      inventoryItem.quantity += 1;
    } else {
      for (let i = 0; i < model.inventory.length; i++) {
        if (model.inventory[i].name === "nothing") {
          model.inventory[i] = clone(item);
          break;
        }
      }
    }
  },

  removeInventoryItem: function(id) {
    for (let i = 0; i < model.inventory.length; i++) {
      if (model.inventory[i].id === id) {
        if (model.inventory[i].quantity > 1) {
          model.inventory[i].quantity -= 1;
        } else {
          model.inventory[i] = nothing;
        }
        break;
      }
    }
  },

  suppliesSize: function() {
    const suppliesTable = document.getElementById("supplies");
    return suppliesTable.getElementsByTagName('td').length
  },

  // TODO: refactor
  setupSupplies: function() {
    model.supplies = new Array(model.suppliesSize());
    model.supplies.fill(nothing);

    let i = 0;
    for (let seed of model.seeds) {
      if (i < model.suppliesSize()) {
        model.supplies[i] = clone(seed);
      }
      i += 1;
    }

    view.updateSupplies(model.supplies);
  },

  suppliesGetItemById: function(id) {
    return model.supplies.find(item => item.id === id)
  },

  getItemById: function(id) {
    var item = model.inventoryGetItemById(id);
    if (!item) {
      item = model.fieldGetItemById(id);
    }
    console.log("in getItemById, item = " + item);
    return item;
  },

  enoughGoldToBuy: function(item) {
    const hasEnough = model.gold >= item.buyPrice;
    if (!hasEnough) {
      console.log("Not enough gold!");
    }
    return hasEnough;
  },

  enoughRoomInInventoryFor: function(item) {
    const hasEnough = model.inventoryHasAvailableSpace() ||
      model.inventoryAlreadyHasItem(item.name);
    if (!hasEnough) {
      console.log("Not enough room in inventory!");
    }
    return hasEnough;
  },

  buyItem: function() {
    let item = model.suppliesGetItemById(document
      .getElementById(model.cellIdOfSelectedItem)
      .firstChild
      .firstChild
      .id);

    if (
      model.enoughGoldToBuy(item) &&
      model.enoughRoomInInventoryFor(item)
    )
    {
      model.gold -= item.buyPrice;
      model.addItemToInventory(item);
      view.updateInventory(model.inventory);
      view.updateGoldDisplay(model.gold);
    }
  },

  plantSeed: function(plotId, seedId) {
    let index = plotId.replace("plot", "");

    let newSeed = clone(model.inventoryGetItemById(seedId));
    newSeed.id = generateId();
    newSeed.timePlanted = new Date();
    newSeed.state = "planted";

    model.field[index] = newSeed;

    model.removeInventoryItem(seedId);

    view.updateField();
    view.updateInventory(model.inventory);
  },

  sellItem: function(item) {
    console.log("in model.sellItem");
    if (item.type === "seed") {
      if (item.state === "ripe") {
        model.gold += item.sellPrice;
      } else {
        model.gold += item.buyPrice;
      }
    }

    view.updateGoldDisplay(model.gold);

    if (model.inventoryGetItemById(item.id)) {
      model.removeInventoryItem(item.id);
      view.updateInventory(model.inventory);
    } else {
      model.removeFieldItem(item.id);
      // console.log("model.field = " + model.field);
      view.updateField();
    }
  }
};

let view = {
  // Update all cells in field table to match field array.
  updateField: function() {
    console.log("in view.updateField");
    for (let i = 0; i < model.field.length; i++) {
      let cell = document.getElementById("plot" + i);
      view.removeAllChildren(cell);

      if (model.field[i].name === "nothing") {
        cell.ondragover = dragoverHandler;
        cell.ondrop = fieldDropHandler;
        continue;
      }

      cell.ondragover = null;
      cell.ondrop = null;

      let newElement = document.createElement("div");
      newElement.setAttribute("class", "fieldItemContainer");

      let img = document.createElement("img");
      if (model.field[i].state === "planted") {
        img.setAttribute("src", cropImagePath + model.field[i].name + "0.png");
      } else {
        img.setAttribute("src", currentImage(model.field[i]));
      }
      img.setAttribute("id", model.field[i].id);
      img.ondragstart = dragstartHandler;
      newElement.appendChild(img);

      let span = document.createElement("span");
      span.setAttribute("class", "fieldTooltip");
      let tooltipMessages = [getName(model.field[i])];
      if (model.field[i].state !== "ripe") {
        tooltipMessages.push("Ripe in " + timeUntilRipe(model.field[i]));
      } else {
        tooltipMessages.push("Ripe!");
        tooltipMessages.push("Sell Price: " + model.field[i].sellPrice + " gold");
      }
      appendMultilineText(span, tooltipMessages);
      newElement.appendChild(span);

      cell.appendChild(newElement);
    }
  },

  // Update all cells in inventory table to match inventory array.
  updateInventory: function(inventory) {
    console.log("in view.updateInventory");
    for (let i = 0; i < inventory.length; i++) {
      let cell = document.getElementById("invt" + i);
      view.removeAllChildren(cell);

      if (inventory[i].name === "nothing") {
        continue;
      }

      let div = document.createElement("div");
      div.setAttribute("class", "inventoryItemContainer");

      let img = document.createElement("img");
      img.setAttribute("src", inventory[i].seedImage);
      img.setAttribute("id", inventory[i].id);
      img.ondragstart = dragstartHandler;
      div.appendChild(img);

      let span = document.createElement("span");
      span.setAttribute("class", "inventoryTooltip");
      let tooltipMessages = [getName(inventory[i])];
      tooltipMessages.push("Sell Price (seed): " + inventory[i].buyPrice + " gold");
      tooltipMessages.push("Sell Price (ripe): " + inventory[i].sellPrice + " gold");
      tooltipMessages.push("Growth Period: " + inventory[i].totalTimeToRipen() + " minutes");
      tooltipMessages.push("Quantity: " + inventory[i].quantity);
      appendMultilineText(span, tooltipMessages);
      div.appendChild(span);

      cell.appendChild(div);
    }
  },

  // TODO: refactor
  updateSupplies: function(supplies) {
    console.log("in view.updateSupplies");
    for (let i = 0; i < supplies.length; i++) {
      let cell = document.getElementById("shelf" + i);
      view.removeAllChildren(cell);

      if (supplies[i].name === "nothing") {
        continue;
      }

      cell.onclick = suppliesSelectionHandler;

      // This div contains the image and the tooltip.
      // It will also contain the selector image when
      // triggered.
      let newElement = document.createElement("div");
      newElement.setAttribute("class", "suppliesItemContainer");

      let img = document.createElement("img");
      img.setAttribute("src", supplies[i].seedImage);
      img.setAttribute("id", supplies[i].id);
      img.setAttribute("draggable", "false");
      newElement.appendChild(img);

      let span = document.createElement("span");
      span.setAttribute("class", "suppliesTooltip");

      let tooltipMessages = [getName(supplies[i])];
      tooltipMessages.push("Purchase: " + supplies[i].buyPrice + " gold");
      tooltipMessages.push("Sell Price (ripe): " + supplies[i].sellPrice + " gold");
      tooltipMessages.push("Growth Period: " + supplies[i].totalTimeToRipen() + " minutes");

      appendMultilineText(span, tooltipMessages);
      newElement.appendChild(span);

      cell.appendChild(newElement);
    }
  },

  isSelected: function(cell) {
    return cell.id === model.cellIdOfSelectedItem;
  },

  // Deselect any other cells in the same table.
  select: function(cell) {
    let table = cell.parentElement.parentElement.parentElement;
    console.log("table.id = " + table.id);
    if (table.id === "supplies" && model.cellIdOfSelectedItem) {
      view.deselect(document.getElementById(model.cellIdOfSelectedItem));
    }

    let newElement = document.createElement("div");
    newElement.setAttribute("id", "selected");
    newElement.setAttribute("class", "selected");

    // Each cell should contain a div which all child nodes are appended to.
    cell.firstChild.appendChild(newElement);

    if (cell.id.startsWith("shelf")) {
      model.cellIdOfSelectedItem = cell.id;
    }

  },

  // Visually deselect a cell.
  deselect: function(cell) {
    console.log("in view.deselect");
    if (cell.id.startsWith("shelf")) {
      model.cellIdOfSelectedItem = undefined;
      view.updateSupplies(model.supplies);
    }
  },

  removeAllChildren: function(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  updateGoldDisplay: function(count) {
    let textBox = document.getElementById("goldAmt");
    textBox.innerHTML = count;
  },

  setupMarket: function() {
    let cell = document.getElementById("market");
    cell.ondragover = dragoverHandler;
    cell.ondrop = marketDropHandler;
  },

  // Hide the tooltip for a cell.
  // Each cell starts with a div which contains an img followed by a span.
  // The span is the tooltip.
  disableTooltip: function(cell) {
    let span = cell.firstChild.children[1];
    span.setAttribute("style", "visibility: hidden;");
  }
};

// This is the game loop function
function startGame() {
  setupGame();

  // Run the loop every second:
  setInterval(
    function() {
      checkForGrowth();
      view.updateField();
    }, millisecondsPerSecond
  );
}
window.onload = startGame;


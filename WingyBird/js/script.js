// Define variables
let fps = 60;
let intervalId;
let columnSpeed = 2 * protagonists[currentProtagonist].currentSpeed;
let removeSpeed = 3;
let currentFrame = 0;
let chanceOfSpecialEvent = 2; // 3/10
let columnRenderAmount = 10;
let firstColumnX = 0;
let gameIsRunning = false;
let jumpAudio = new Audio("./snd/jump.wav");
let failAudio = new Audio("./snd/fail.mp3");
let protagonistOrigY = 0;
let gravityTurn = 1;
let startingScoreSpecialEvent = 0;
let specialEventsTurnedOn = true;
let endSequence = 0;
let finishedX = 0;
let moveDownSpeed = 1;

// Define elements
let protagonistCss = document.getElementById("protagonist");
let backgroundCss = document.getElementById("background");
let columnGapContainerCss = document.getElementById("columnGapContainer");

// Set event listeners
document.getElementById("startButton").onclick = startGame;
document.getElementById("menuButton").onclick = backToMenu;
document.getElementById("prevBgButton").onclick = function() {
  setNewBackground(-1);
};
document.getElementById("nextBgButton").onclick = function() {
  setNewBackground(1);
};
document.getElementById("prevPtButton").onclick = function() {
  setNewProtagonist(-1);
};
document.getElementById("nextPtButton").onclick = function() {
  setNewProtagonist(1);
};
document.getElementById("prevOcButton").onclick = function() {
  setNewObstacle(-1);
};
document.getElementById("nextOcButton").onclick = function() {
  setNewObstacle(1);
};

// Set event listeners for controls
backgroundCss.onclick = function() {
  if (gameIsRunning) { jump(); } 
};
document.body.onkeyup = function(e) {  
  // Jump if spacebar clicked
  if (e.key == "Space" || e.keyCode == 32) { e.preventDefault(); jump(); }
};

// Start game
function startGame() {
  // Set score
  document.getElementById("score").textContent = "Score: 0";
  gameIsRunning = true;
  // Check if events should occur
  specialEventsTurnedOn = document.getElementById("eventCheckbox").checked;
  // Hide start ui
  showUi(1);
  // Initialize running game
  startGameLoop();
}

// Switch the visibility of ui elements
function showUi(index) {
  // Hide all
  let elems = document.getElementsByClassName("ui_element");
  for (let i = 0; i < elems.length; i++) {
    elems[i].classList.add("d-none");
  }
  // Show specific ui
  if (index == 0) { elems = document.getElementsByClassName("start_ui"); }
  if (index == 1) { elems = document.getElementsByClassName("match_ui"); }
  if (index == 2) { elems = document.getElementsByClassName("score_ui"); }
  
  for (let i = 0; i < elems.length; i++) {
    elems[i].classList.remove("d-none");
  }
  
}

// Initialize game loop 
function startGameLoop() {
  // Set properties for protagonist
  initializeProtagonist();
  // Set properties for background
  InitializeBackground();
  // Spawn columnRenderAmount of gaps and columns
  spawnGaps();
  spawnColumns();
  // Reset current frame 
  currentFrame = 0;
  // Start game loop
  intervalId = setInterval(gameLoop, 16);

}

// Set initial properties like position for protagonist
function initializeProtagonist() {
  // Set dimensions and position of element
  updateProtagonist(protagonistCss.offsetWidth, protagonistCss.offsetHeight, protagonistCss.getBoundingClientRect().left, protagonistCss.getBoundingClientRect().top, 0, false, 0, 0);
}

// Set initial properties like background position for background
function InitializeBackground() {
  // Set background position in css
  backgroundCss.style.backgroundPositionX = "0px";
  // Set background position in js
  background.posX = 0;
}

// Set submitted properties to element
function updateProtagonist(width, height, posX, posY, score, isJumping, jumpingSince, jumpingFromY) {
  if (width != null) { protagonists[currentProtagonist].width = width; }
  if (height != null) { protagonists[currentProtagonist].height = height; }
  if (posX != null) { protagonists[currentProtagonist].posX = posX; }
  if (posY != null) { protagonists[currentProtagonist].posY = posY; protagonistOrigY = posY; }
  if (score != null) { protagonists[currentProtagonist].score = score; }
  if (isJumping != null) { protagonists[currentProtagonist].isJumping = isJumping; }
  if (jumpingSince != null) { protagonists[currentProtagonist].jumpingSince = jumpingSince; }
  if (jumpingFromY != null) { protagonists[currentProtagonist].jumpingFromY = jumpingFromY; }
}

// Contain all functions needed during game
function gameLoop() {
  // Move scenery to the left
  moveBackgroundX(protagonists[currentProtagonist].currentSpeed * (-1));
  // Move protagonist in y-axis
  moveProtagonistY();
  // Move columns to the left
  moveGapsX(columnSpeed * (-1));
  moveColumnsX(columnSpeed * (-1));
  // Move special events to the left
  moveSpecialEventsX(columnSpeed * (-1));
  // Check hitdetection of protagonist
  if (checkHitDetections() || checkOutOfBounds()) { endGame() }
  // Check if special event was touched
  checkHitWithSpecialEvents();
  // Check if new column is to be spawned
  checkColumnSpawn();
  // add frame
  currentFrame++;
}

// Move submitted element sideways in a specific speed
function moveProtagonistY() {
  // Draw element in y position
  if (protagonists[currentProtagonist].isJumping) {
    // Continue jump
    protagonists[currentProtagonist].posY = calculatePosY();
  } else {
    protagonists[currentProtagonist].posY += (protagonists[currentProtagonist].fallSpeed * gravityTurn)
  }
  protagonistCss.style.top = protagonists[currentProtagonist].posY + "px";
}

// Move background to the left
function moveBackgroundX(speed) {
  background.posX += speed;
  backgroundCss.style.backgroundPositionX = background.posX + "px";
}

// Set protagonist to jumping
function jump() {
  // Set element to jumping
  protagonists[currentProtagonist].jumpingSince = currentFrame;
  protagonists[currentProtagonist].isJumping = true;
  protagonists[currentProtagonist].jumpingFromY = protagonists[currentProtagonist].posY;
  // Change rotation of protagonist
  protagonistCss.classList.remove("falling");
  protagonistCss.classList.add("jumping");
  // Play jumping audio
  jumpAudio.play();
}

// Return height element at specific place during jump
function calculatePosY() {
  let x = currentFrame - protagonists[currentProtagonist].jumpingSince;
  // If maximum heigt is reached, drop down slowly
  if (maximumReached(x)) {
    protagonists[currentProtagonist].isJumping = false;
    protagonistCss.classList.remove("jumping");
    protagonistCss.classList.add("falling");
    // Maximum reached
    return protagonists[currentProtagonist].posY + (protagonists[currentProtagonist].fallSpeed * gravityTurn);
  } else {
    // maximun not reached
    let y = gravityTurn * jumpFormula(x);
    return protagonists[currentProtagonist].posY - y;
  }
}

// Return y value of jumping formula
function jumpFormula(x) {
  return Math.sin(x/9) * (protagonists[currentProtagonist].height / 7)
}

// Check if protagonist reached the summit of the function
function maximumReached(x) {
  return (50 * Math.cos(x/9)*63 <= 0);
}

// Spawn initial columns
function spawnGaps() {
  // Spawn gaps
  let currentX = 0;
  for (let i = 0; i < columnRenderAmount; i++) {
    if (gaps.length <= 0) {
      currentX = gapBlueprint.startX;
    } else {
      let prevGap = gaps[(i-1)%gaps.length];
      currentX = prevGap.left + prevGap.width + getRandomInt(gapBlueprint.minDistance, gapBlueprint.maxDistance);
    }
    spawnGap(currentX);
  }
}
 
// Spawn a single gap
function spawnGap(x) {
  // Create values for gap properties
  let gap = Object.create(gapObject);
  gap.id = "gap" + gaps.length;
  gap.width = getRandomInt(gapBlueprint.minWidth, gapBlueprint.maxWidth);
  gap.height = getRandomInt(gapBlueprint.minHeight, gapBlueprint.maxHeight);
  gap.left = x;
  gap.top = getRandomInt(gapBlueprint.minY, gapBlueprint.maxY);
  // Create the div with calculated properties
  let gapCss = document.createElement("div");
  gapCss.id = gap.id;
  gapCss.style.width = gap.width + "px";
  gapCss.style.height = gap.height + "px";
  gapCss.style.left = gap.left + "px";
  gapCss.style.top = gap.top + "px";
  gapCss.classList.add(gapBlueprint.color, "stack_child");
  // Add div to document and insert created gap in array
  // Maybe spawn a special event in this gap
  if (specialEventsTurnedOn && protagonists[currentProtagonist].score >= startingScoreSpecialEvent && chanceOfSpecialEvent >= getRandomInt(1, 10)) {
    // Spawn a special event in this gap
    spawnSpecialEvent(gap);
  }
  columnGapContainerCss.appendChild(gapCss);
  gaps.push(gap);
}

// Spawn a special event in submitted gap
function spawnSpecialEvent(gap) {
  // Define special event object
  let sE = Object.create(specialEventBluePrint);
  sE.id = gap.id + "sE";
  sE.posX = gap.left + (0.5 * gap.width) - (0.5 * sE.width);
  sE.posY = gap.top + (0.5 * gap.height) - (0.5 * sE.height);
  // Create the div with calculated properties
  let sECss = document.createElement("div");
  sECss.id = sE.id;
  console.log("adding " + sECss.id)
  sECss.style.width = sE.width + "px";
  sECss.style.height = sE.height + "px";
  sECss.style.left = sE.posX + "px";
  sECss.style.top = sE.posY + "px";
  sECss.classList.add("stack_child", "special_event", "egg_element", "background_cover");
  // Append to array / document
  columnGapContainerCss.appendChild(sECss);
  specialEvents.push(sE);
}

// Spawn columns where the gap was set
function spawnColumns() {
  for (let i = 0; i < gaps.length; i++) {
    spawnColumn(i);
  }
}

// Spawn a single column including upper and lower
function spawnColumn(index) {
  // Get fitting gap
  let gapCss = document.getElementById("gap" + index);
  // Create values for column properties
  let column = Object.create(columnObject);
  column.id = "column" + columns.length;
  column.width = gaps[index].width;
  column.left = gaps[index].left;
  column.upperBorderY = gaps[index].top;
  column.lowerBorderY = gaps[index].top + gaps[index].height;
  // Create upper div with calculated properties
  let upperColumnCss = document.createElement("div");
  upperColumnCss.id = column.id + "Up";
  upperColumnCss.style.width = gapCss.style.width;
  upperColumnCss.style.height = gapCss.style.top;
  upperColumnCss.style.left = gapCss.style.left;
  upperColumnCss.style.top = 0 + "px";
  upperColumnCss.style.background = "url(\"./img/obstacle" + currentObstacle + ".jpg\")";
  upperColumnCss.classList.add("stack_child");
  // Create lower div with calculated properties
  let lowerColumnCss = document.createElement("div");
  lowerColumnCss.id = column.id + "Down";
  lowerColumnCss.style.width = gapCss.style.width;
  lowerColumnCss.style.height = (columnBlueprint.bottomY - (gaps[index].top + gaps[index].height)) + "px";
  lowerColumnCss.style.left = gapCss.style.left;
  lowerColumnCss.style.top = (gaps[index].top + gaps[index].height) + "px";
  lowerColumnCss.style.background = "url(\"./img/obstacle" + currentObstacle + ".jpg\")";
  lowerColumnCss.classList.add("stack_child");
  // Add div to document and insert created column in array
  columnGapContainerCss.appendChild(upperColumnCss);
  columnGapContainerCss.appendChild(lowerColumnCss);
  columns.push(column);
}

// Return number between min and max (both inclusive)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Move all spawned columns to the left
function moveGapsX(speed) {
  for (let i = 0; i < gaps.length; i++) {
    moveGapX(i, speed);
  }
}

// Move a single gap horizontally
function moveGapX(index, speed) {
  gaps[index].left += speed;
  document.getElementById(gaps[index].id).style.left = gaps[index].left + "px";
  // Check if gap is passed
  if (isGapCrossed(gaps[index])) { 
    // Increase score
    protagonists[currentProtagonist].score++;
    // Update score
    updateScore();
  }
}

// Move all spawned columns to the left
function moveColumnsX(speed) {
  for (let i = 0; i < columns.length; i++) {
    moveColumnX(i, speed);
  }
}

// Move a column horizontally
function moveColumnX(index, speed) {
  columns[index].left = gaps[index].left;
  document.getElementById(columns[index].id + "Up").style.left = document.getElementById("gap" + index).style.left;
  document.getElementById(columns[index].id + "Down").style.left = document.getElementById("gap" + index).style.left;
}

// Move all special events horizontally
function moveSpecialEventsX(speed) {
  for (let i = 0; i < specialEvents.length; i++) {
    moveSpecialEventX(i);
  }
}

// Move a single special event horizontally
function moveSpecialEventX(index) {
  // Get gap in which special event is spawned
  let gap = findGapById(specialEvents[index].id.substring(0, specialEvents[index].id.length - 2));
  // No need to move if no event exists
  if (document.getElementById(specialEvents[index].id) == undefined) {
    return;
  }
  // Move event sideaways
  specialEvents[index].posX = gap.left + (0.5 * gap.width) - (0.5 * specialEvents[index].width);
  document.getElementById(specialEvents[index].id).style.left = specialEvents[index].posX + "px";
}

// Get index of gap by submitted id
function findGapById(id) {
  for (let i = 0; i < gaps.length; i++) {
    if (gaps[i].id == id) { return gaps[i]; }
  }
  // No gap with specific id found
  return -1;
}

// Update score css element 
function updateScore() {
  document.getElementById("score").textContent = "Score: " + protagonists[currentProtagonist].score;
}

// Check if protagonist passed a specific gap
function isGapCrossed(gap) {
  let rb = gap.left + gap.width;
  let lb = protagonists[currentProtagonist].posX;
  return (rb < lb && lb <= rb+columnSpeed);
}

// Check if the protagonist hits a column
function checkHitDetections() {
  for (let i = 0; i < columns.length; i++) {
    if (checkHitDetection(i)) { return true; }
  }
  // No column hit
  return false;
}

// Check if protagonist hits a special event
function checkHitWithSpecialEvents() {
  for (let i = 0; i < specialEvents.length; i++) {
    // Activate reverse gravity if hit
    if (checkHitWithSpecialEvent(i)) { specialEventHit(i) }
  }
}

// Return if protagonist hits a specific special event
function checkHitWithSpecialEvent(i) {
  return (protagonists[currentProtagonist].posX < specialEvents[i].posX + specialEventBluePrint.width &&
  protagonists[currentProtagonist].posX + protagonists[currentProtagonist].width > specialEvents[i].posX && 
  protagonists[currentProtagonist].posY < specialEvents[i].posY + specialEventBluePrint.height  && 
  protagonists[currentProtagonist].posY + protagonists[currentProtagonist].height > specialEvents[i].posY)
}

// Act after a specific special event was hit
function specialEventHit(i) {
  // Remove element from array and delete css element
  let sE = document.getElementById(specialEvents[i].id);
  // No need to remove if it does not exist
  if (sE == undefined) { return; }
  // Remove special event
  sE.remove();
  specialEvents.splice(i, 1);
  // Turn gravity
  if (specialEventsTurnedOn) {
    gravityTurn *= (-1);
  }
  // Stop jumping
  protagonists[currentProtagonist].isJumping = false;
  protagonistCss.classList.remove("jumping");
  protagonistCss.classList.add("falling");
}

// Check if protagonist hit a specific upper or lower column
function checkHitDetection(index) {
  let col = columns[index];
  // Check if either the upper or lower column is hit
  return (checkUpperColumnHitDetection(col) || checkLowerColumnHitDetection(col));
}

// Check if protagonist hit a specific upper column
function checkUpperColumnHitDetection(col) {
  return (protagonists[currentProtagonist].posX < col.left + col.width &&
  protagonists[currentProtagonist].posX + protagonists[currentProtagonist].width > col.left && 
  protagonists[currentProtagonist].posY < col.upperBorderY  && 
  protagonists[currentProtagonist].posY + protagonists[currentProtagonist].height > 0)
}

// Check if protagonist hit a specific lower column
function checkLowerColumnHitDetection(col) {
  return (protagonists[currentProtagonist].posX < col.left + col.width &&
    protagonists[currentProtagonist].posX + protagonists[currentProtagonist].width > col.left && 
    protagonists[currentProtagonist].posY < columnBlueprint.bottomY  && 
    protagonists[currentProtagonist].posY + protagonists[currentProtagonist].height > col.lowerBorderY)
  }

// Check if new column(s) need(s) to be spawned
function checkColumnSpawn() {
  for (let i = 0; i < columns.length; i++) {
    // Check if current column has completely passed the left border
    if (isColumnGone(i)) {
      // Decide on a new x-position
      let prevGap = (i == 0) ? gaps[gaps.length-1] : gaps[i-1];
      let currentX = prevGap.left + prevGap.width + getRandomInt(gapBlueprint.minDistance, gapBlueprint.maxDistance);
      // Reuse this gap 
      reuseGap(i, currentX);
      // Reuse this column
      reuseColumn(i, currentX);
    }
  }
}

// Remove a special event that was hit or passed completely
function removeSpecialEvent(index) {
  let sE = document.getElementById(gaps[index].id + "sE");
  // No need to remove if it does not exist
  if (sE == undefined) { return; }
  // Remove special event
  sE.remove();
  specialEvents.splice(index, 1);
}

// Check if column if completely passed and not visible anymore
function isColumnGone(index) {
  return ((columns[index].left + columns[index].width) < 0); 
}

// Move a completely passed and invisible gap to the front 
function reuseGap(index, x) {
  // Create values for gap properties
  let gap = gaps[index];
  //gap.id = "gap" + index;
  gap.width = getRandomInt(gapBlueprint.minWidth, gapBlueprint.maxWidth);
  gap.height = getRandomInt(gapBlueprint.minHeight, gapBlueprint.maxHeight);
  gap.left = x;
  gap.top = getRandomInt(gapBlueprint.minY, gapBlueprint.maxY);
  // Create the div with calculated properties
  let gapCss = document.getElementById(gap.id);
  gapCss.style.width = gap.width + "px";
  gapCss.style.height = gap.height + "px";
  gapCss.style.left = gap.left + "px";
  gapCss.style.top = gap.top + "px";
  // Check if a special event belongs to gap
  let elem = document.getElementById(gap.id + "sE");
  if (elem != undefined) {
    // Remove element from array
    for (let i = 0; i < specialEvents.length; i++) {
      if (specialEvents[i].id == elem.id) {
        console.log("remove " + specialEvents[i].id)
        specialEvents.splice(i, 1);
      }
    }
    // Remove Css element 
    elem.remove();
  }
  // Maybe add new special event to column
  if (specialEventsTurnedOn && chanceOfSpecialEvent >= getRandomInt(1, 10)) {
    // Spawn a special event in this gap
    spawnSpecialEvent(gap);
  }
  // Add div to document and insert created gap in array
  gaps[index] = gap;
}

// Move a completely passed and invisible column to the front 
function reuseColumn(index, x) {
  // Get fitting gap
  let gapCss = document.getElementById("gap" + index);
  // Create values for column properties
  let column = columns[index];
  //column.id = "column" + index;
  column.width = gaps[index].width;
  column.left = gaps[index].left;
  column.upperBorderY = gaps[index].top;
  column.lowerBorderY = gaps[index].top + gaps[index].height;
  // Create upper div with calculated properties
  let upperColumnCss = document.getElementById(column.id + "Up");
  upperColumnCss.style.width = gapCss.style.width;
  upperColumnCss.style.height = gapCss.style.top;
  upperColumnCss.style.left = gapCss.style.left;
  upperColumnCss.style.top = 0 + "px";
  // Create lower div with calculated properties
  let lowerColumnCss = document.getElementById(column.id + "Down");
  lowerColumnCss.style.width = gapCss.style.width;
  lowerColumnCss.style.height = (columnBlueprint.bottomY - (gaps[index].top + gaps[index].height)) + "px";
  lowerColumnCss.style.left = gapCss.style.left;
  lowerColumnCss.style.top = (gaps[index].top + gaps[index].height) + "px";
  // Add div to document and insert created column in array
  columns[index] = column;
}

// Update background after changing it
function setNewBackground(step) {
  // Get new background image
  background.image = (background.image + step) % background.imagesAmount;
  if (background.image < 0) { background.image = background.imagesAmount - 1};
  // Update css element
  backgroundCss.style.background = "url(\"./img/background" + background.image + ".jpg\")";
  // Update text in html
  document.getElementById("nextPrevPlaceholder").textContent = background.titles[background.image].toUpperCase();
}

// Update protagonist after changing it
function setNewProtagonist(step) {
  // Get new background image
  currentProtagonist = (currentProtagonist + step) % protagonists.length;
  if (currentProtagonist < 0) { currentProtagonist = protagonists.length - 1};
  // Update css element
  protagonistCss.style.background = "url(\"./img/protagonist" + currentProtagonist + ".png\")";
  // Set proportions for protagonist
  protagonistCss.style.width = protagonists[currentProtagonist].width + "px";
  protagonistCss.style.height = protagonists[currentProtagonist].height + "px";
  // Update speed
  columnSpeed = 2 * protagonists[currentProtagonist].currentSpeed
  // Update text in html
  document.getElementById("nextPrevPtPlaceholder").textContent = protagonists[currentProtagonist].name.toUpperCase();
}

// Update showing article in main menu
function setNewObstacle(step) {
  let obstacleCss = document.getElementById("showObstacle");
  // Get new obstacle image
  currentObstacle = (currentObstacle + step) % obstacles.length;
  if (currentObstacle < 0) { currentObstacle = obstacles.length - 1};
  // Update css element
  obstacleCss.style.background = "url(\"./img/obstacle" + currentObstacle + ".jpg\")";

  // Update text in html
  document.getElementById("nextPrevOcPlaceholder").textContent = obstacles[currentObstacle].toUpperCase();
}

// Game is finished
async function endGame() {
  // Stop game from running
  gameIsRunning = false;
  clearInterval(intervalId)
  // Play fail sound
  failAudio.play();
  // Show menu ui
  showUi(2);
}

// Start animations wanting to get back to the menu after loosing
function backToMenu() {
  document.getElementById("menuButton").classList.add("d-none");
  // Start animations
  intervalId = setInterval(finishLoop, 16);
}

// Processing the ending animations
function finishLoop() {
  finishedX = Math.abs(background.posX)
  if (columns.length <= 0) {
    clearInterval(intervalId);
    // Show ui of menu
    showUi(0);
    return;
  }
  // Remove all special effects
  if (specialEvents.length > 0) {
    removeAllSpecialEvents();
  }
  if (endSequence == 0) {
    // Minimize all columns if they exist and drop protagonist down
    if (!checkColumnsGone() || !isProtagonistDown()) { minimizeColumns(); moveProtagonistDown(); }
    // Start new sequence
    else { endSequence = 1; }
  }
  if (endSequence== 1) {
    // Change rotation of protation
    protagonistCss.classList.remove("falling");
    protagonistCss.classList.remove("jumping");
    endSequence = 2;
  }
  if (endSequence == 2) {
    if (moveBackgroundBack() && moveProtagonistUp()) { endSequence = 3; } // Move background to original position
  }
  if (endSequence == 3) {
    resetVariables();
    removeAllChildren(columnGapContainerCss);
    columns = [];
  } 
}

// Set all changed variables to default values
function resetVariables() {
  // Define variables
  columnSpeed = 2 * protagonists[currentProtagonist].currentSpeed;
  removeSpeed = 3;
  currentFrame = 0;
  gameIsRunning = false;
  protagonistOrigY = 0;
  protagonists[currentProtagonist].score = 0;
  protagonists[currentProtagonist].isJumping = false;
  protagonists[currentProtagonist].jumpingSince = 0;
  protagonists[currentProtagonist].jumpingFromY = 0;
  gaps = [];
  columns = [];
  specialEvents = [];
  moveDownSpeed = 1;
  currentObstacle = 0
  endSequence = 0;
  finishedX = 0;
  gravityTurn = 1;
}

// Move protagonist up in end animation
function moveProtagonistUp() {
  // Top border of animation is hit -> set to specific height
  if (protagonists[currentProtagonist].posY <= protagonistOrigY) {
    protagonists[currentProtagonist].posY = protagonistOrigY;
    protagonistCss.style.top = protagonists[currentProtagonist].posY + "px";
    return true;
  }
  // Continue animation
  protagonists[currentProtagonist].posY-= 4;
  protagonistCss.style.top = protagonists[currentProtagonist].posY + "px";
  return false;
}

// Remove all special events after losing
function removeAllSpecialEvents() {
  let elems = document.getElementsByClassName("special_event");
  while (elems.length > 0) { elems[0].remove(); }
  specialEvents = [];
}

// Minimize all columns in ending animation
function minimizeColumns() {
  for (let i = 0; i < columns.length; i++) {
    minimizeColumn(i);
  }
}

// Check if protagonist is below visible screen
function isProtagonistDown() {
  return protagonists[currentProtagonist].posY > columnBlueprint.bottomY;
}

// Move protagonist down
function moveProtagonistDown() {
  if (isProtagonistDown()) { return; }
  protagonists[currentProtagonist].posY += moveDownSpeed++;
  protagonistCss.style.top = protagonists[currentProtagonist].posY + "px";
}

// Minimize specific upper and lower column in ending animation
function minimizeColumn(index) {
  minimizeUpperColumn(index);
  minimizeLowerColumn(index);
}

// Minimize specific upper column in ending animation
function minimizeUpperColumn(index) {
  let col = columns[index];
  let colCss = document.getElementById(col.id + "Up");
  if (colCss == undefined) { return; }
  col.upperBorderY -= removeSpeed;
  if (col.upperBorderY <= 0) {
    // Delete column
    colCss.remove();
  } else {
    // Make column smaller
    colCss.style.height = col.upperBorderY + "px";
  }
}

// Minimize specific lower column in ending animation
function minimizeLowerColumn(index) {
  let col = columns[index];
  let colCss = document.getElementById(col.id + "Down");
  if (colCss == undefined) { return; }
  col.lowerBorderY += removeSpeed;
  if (col.lowerBorderY > columnBlueprint.bottomY) {
    // Delete column
    colCss.remove();
  } else {
    // Make column smaller
    colCss.style.height = (columnBlueprint.bottomY - col.lowerBorderY) + "px";
    // Move column to stick to ground
    colCss.style.top = col.lowerBorderY + "px";
  }
}

// Check if all columns were removed in end animation
function checkColumnsGone() {
  return (document.getElementById("columnGapContainer").children.length == columns.length);
}

// Remove all children from specific element
function removeAllChildren(elem) {
  elem.innerHTML = "";
}

// Move background back to original position horizontally
function moveBackgroundBack() {
  // Check if the movement is finished or surpassed
  if (background.posX >= 0) { return true; }
  // Keep moving
  moveBackgroundX(Math.abs(background.posX) > Math.abs(finishedX / 2) ? removeSpeed++ : removeSpeed--);
  return false;
}

// Check if protagonist touched upper or lower border
function checkOutOfBounds() {
  return (protagonists[currentProtagonist].posY <= 0 || protagonists[currentProtagonist].posY + protagonists[currentProtagonist].height >= columnBlueprint.bottomY);
}
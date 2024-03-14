let currentProtagonist = 0;
let currentObstacle = 0;

let protagonists = [
  { // Flappy bird
  width : 80,
  height : 50,
  posX : 0,
  posY : 0,
  score : 0,
  isJumping : false,
  jumpingSince : 0,
  jumpingFromY : 0,
  currentSpeed : 1,
  fallSpeed : 5,
  name : "Flappy"
  },
  {
    width : 70,
    height : 70,
    posX : 0,
    posY : 0,
    score : 0,
    isJumping : false,
    jumpingSince : 0,
    jumpingFromY : 0,
    currentSpeed : 0.8,
    fallSpeed : 3,
    name : "Dreamy"
    },
    {
      width : 80,
      height : 70,
      posX : 0,
      posY : 0,
      score : 0,
      isJumping : false,
      jumpingSince : 0,
      jumpingFromY : 0,
      currentSpeed : 2,
      fallSpeed : 5,
      name : "Mordecai"
      },
]

// Moving background 
let background = {
  posX : 0,
  image : 0,
  imagesAmount : 4,
  titles : ["CLOUDS", "FOREST", "CITY", "MOUNTAINS"]
}

// Define all obstacles
let obstacles = [
  "Brick",
  "Wood",
  "Stone"
]

// Will be the gap between the columns
let gapBlueprint = {
  minWidth : 100,
  maxWidth : 200,
  color: ".",
  minHeight : protagonists[currentProtagonist].height * 4,
  maxHeight: protagonists[currentProtagonist].height * 6,
  minY : 100,
  maxY : window.innerHeight - 450,
  minDistance : protagonists[currentProtagonist].width,
  maxDistance : protagonists[currentProtagonist].width * 3,
  startX : 500
}
let gaps = [];
const gapObject = {
  id : 0,
  width : 0,
  height : 0,
  left : 0,
  top : 0
}
// Will be the column above and below the gaps
let columnBlueprint = {
  color : "bg-warning",
  topY : 0,
  bottomY : window.innerHeight
}
let columns = [];
const columnObject = {
  id : 0,
  width : 0,
  left : 0,
  upperBorderY : 0,
  lowerBorderY : 0
}

let specialEvents = [];
let specialEventBluePrint = {
  id : 0,
  width : 20,
  height : 20,
  posX : 0,
  posY : 0
}


window.addEventListener('resize',function(){
  console.log(window.innerHeight);
});